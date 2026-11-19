// ---------------------------------------------------------------------------
// Zino One — Inventory Service (§9.3)
// adjustStock() is the ONLY function that writes StockLevel.qty and inserts
// a StockMovement audit row.
// ---------------------------------------------------------------------------

import { Prisma, ServiceSlug, TransferStatus } from "@prisma/client";
import { prisma, type DbClient } from "../prisma";
import {
  BusinessError,
  ConflictError,
  InsufficientStockError,
  NotFoundError,
} from "../errors";
import { requireLocation } from "../auth";
import type { ServiceContext } from "../scope";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { formatSeq, nextNumber } from "./numbering";
import { toDateOnly } from "../dates";

export interface AdjustStockInput {
  productId: string;
  locationId: string;
  qtyChange: number; // positive or negative
  reason: string;
  refType: string;
  refId: string;
  actorId: string;
  allowNegative?: boolean;
}

/**
 * The single sanctioned writer to StockLevel.qty + StockMovement (§9.3).
 */
export async function adjustStock(tx: DbClient, input: AdjustStockInput) {
  const existing = await tx.stockLevel.findUnique({
    where: {
      productId_locationId: {
        productId: input.productId,
        locationId: input.locationId,
      },
    },
    include: { product: { select: { name: true } } },
  });

  const currentQty = existing ? Number(existing.qty) : 0;
  const nextQty = Number((currentQty + input.qtyChange).toFixed(2));

  if (nextQty < 0 && !input.allowNegative) {
    let productName = existing?.product.name;
    if (!productName) {
      const p = await tx.product.findUnique({
        where: { id: input.productId },
        select: { name: true },
      });
      productName = p?.name ?? input.productId;
    }
    throw new InsufficientStockError(
      productName,
      currentQty,
      Math.abs(input.qtyChange)
    );
  }

  const level = await tx.stockLevel.upsert({
    where: {
      productId_locationId: {
        productId: input.productId,
        locationId: input.locationId,
      },
    },
    update: { qty: new Prisma.Decimal(nextQty) },
    create: {
      productId: input.productId,
      locationId: input.locationId,
      qty: new Prisma.Decimal(nextQty),
    },
  });

  await tx.stockMovement.create({
    data: {
      productId: input.productId,
      locationId: input.locationId,
      qtyChange: new Prisma.Decimal(input.qtyChange),
      reason: input.reason,
      refType: input.refType,
      refId: input.refId,
      actorId: input.actorId,
    },
  });

  return level;
}

export async function transferStock(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    fromId: string;
    toId: string;
    note?: string | null;
    items: Array<{ productId: string; qty: number }>;
  }
) {
  if (input.fromId === input.toId) {
    throw new BusinessError("Source and destination locations must be different");
  }
  requireLocation(ctx, input.fromId);

  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.create({
      data: {
        source,
        fromId: input.fromId,
        toId: input.toId,
        status: TransferStatus.IN_TRANSIT,
        requestedById: ctx.user.id,
        note: input.note ?? null,
        items: {
          create: input.items.map((it) => ({
            productId: it.productId,
            qty: new Prisma.Decimal(it.qty),
          })),
        },
      },
      include: { items: true, from: true, to: true },
    });

    // Decrement source location immediately (stock is in transit)
    for (const item of input.items) {
      await adjustStock(tx, {
        productId: item.productId,
        locationId: input.fromId,
        qtyChange: -item.qty,
        reason: "TRANSFER_OUT",
        refType: "StockTransfer",
        refId: transfer.id,
        actorId: ctx.user.id,
      });
    }

    await logActivity(tx, {
      source,
      locationId: input.fromId,
      actorId: ctx.user.id,
      action: ActivityAction.STOCK_TRANSFERRED,
      entityType: "StockTransfer",
      entityId: transfer.id,
      summary: `Transferred ${input.items.length} item(s) from ${transfer.from.name} to ${transfer.to.name}`,
    });

    return transfer;
  });
}

export async function receiveTransfer(
  ctx: ServiceContext,
  source: ServiceSlug,
  transferId: string
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.findUnique({
      where: { id: transferId },
      include: { items: true, from: true, to: true },
    });

    if (!transfer || transfer.source !== source) {
      throw new NotFoundError("Stock transfer not found");
    }
    requireLocation(ctx, transfer.toId);

    if (transfer.status === TransferStatus.RECEIVED) {
      throw new ConflictError("Stock transfer has already been received");
    }
    if (transfer.status === TransferStatus.CANCELLED) {
      throw new BusinessError("Cannot receive a cancelled transfer");
    }

    for (const item of transfer.items) {
      await adjustStock(tx, {
        productId: item.productId,
        locationId: transfer.toId,
        qtyChange: Number(item.qty),
        reason: "TRANSFER_IN",
        refType: "StockTransfer",
        refId: transfer.id,
        actorId: ctx.user.id,
      });
    }

    const updated = await tx.stockTransfer.update({
      where: { id: transfer.id },
      data: {
        status: TransferStatus.RECEIVED,
        receivedById: ctx.user.id,
      },
      include: { items: true, from: true, to: true },
    });

    await logActivity(tx, {
      source,
      locationId: transfer.toId,
      actorId: ctx.user.id,
      action: ActivityAction.STOCK_TRANSFER_RECEIVED,
      entityType: "StockTransfer",
      entityId: transfer.id,
      summary: `Received transfer of ${transfer.items.length} item(s) at ${transfer.to.name}`,
    });

    return updated;
  });
}

export async function cancelTransfer(
  ctx: ServiceContext,
  source: ServiceSlug,
  transferId: string
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.findUnique({
      where: { id: transferId },
      include: { items: true, from: true },
    });
    if (!transfer || transfer.source !== source) {
      throw new NotFoundError("Stock transfer not found");
    }
    if (
      transfer.status !== TransferStatus.REQUESTED &&
      transfer.status !== TransferStatus.IN_TRANSIT
    ) {
      throw new BusinessError("Only requested or in-transit transfers can be cancelled");
    }

    for (const item of transfer.items) {
      await adjustStock(tx, {
        productId: item.productId,
        locationId: transfer.fromId,
        qtyChange: Number(item.qty),
        reason: "TRANSFER_CANCELLED",
        refType: "StockTransfer",
        refId: transfer.id,
        actorId: ctx.user.id,
      });
    }

    const updated = await tx.stockTransfer.update({
      where: { id: transfer.id },
      data: { status: TransferStatus.CANCELLED },
    });

    await logActivity(tx, {
      source,
      locationId: transfer.fromId,
      actorId: ctx.user.id,
      action: ActivityAction.STOCK_TRANSFER_CANCELLED,
      entityType: "StockTransfer",
      entityId: transfer.id,
      summary: `Cancelled stock transfer ${transfer.id} and returned stock to ${transfer.from.name}`,
    });

    return updated;
  });
}

export async function recordAdjustment(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    locationId: string;
    reason: string;
    note?: string | null;
    items: Array<{ productId: string; qtyChange: number }>;
  }
) {
  requireLocation(ctx, input.locationId);

  return prisma.$transaction(async (tx) => {
    const adjustment = await tx.stockAdjustment.create({
      data: {
        source,
        locationId: input.locationId,
        reason: input.reason,
        note: input.note ?? null,
        createdById: ctx.user.id,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            qtyChange: new Prisma.Decimal(i.qtyChange),
          })),
        },
      },
      include: { items: true, location: true },
    });

    for (const item of input.items) {
      await adjustStock(tx, {
        productId: item.productId,
        locationId: input.locationId,
        qtyChange: item.qtyChange,
        reason: input.reason,
        refType: "StockAdjustment",
        refId: adjustment.id,
        actorId: ctx.user.id,
      });
    }

    await logActivity(tx, {
      source,
      locationId: input.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.STOCK_ADJUSTED,
      entityType: "StockAdjustment",
      entityId: adjustment.id,
      summary: `Adjusted ${input.items.length} item(s) at ${adjustment.location.name} (${input.reason})`,
    });

    return adjustment;
  });
}

export async function recordStockIn(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    locationId: string;
    supplier?: string;
    invoiceNo?: string;
    note?: string;
    items: Array<{ productId: string; qty: number }>;
  }
) {
  requireLocation(ctx, input.locationId);

  return prisma.$transaction(async (tx) => {
    const adjustment = await tx.stockAdjustment.create({
      data: {
        source,
        locationId: input.locationId,
        reason: `STOCK_IN${input.supplier ? `: ${input.supplier}` : ""}`,
        note: input.note ?? (input.invoiceNo ? `Invoice: ${input.invoiceNo}` : null),
        createdById: ctx.user.id,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            qtyChange: new Prisma.Decimal(i.qty),
          })),
        },
      },
      include: { items: true, location: true },
    });

    for (const item of input.items) {
      await adjustStock(tx, {
        productId: item.productId,
        locationId: input.locationId,
        qtyChange: item.qty,
        reason: "STOCK_IN",
        refType: "StockIn",
        refId: adjustment.id,
        actorId: ctx.user.id,
      });
    }

    await logActivity(tx, {
      source,
      locationId: input.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.STOCK_IN,
      entityType: "StockAdjustment",
      entityId: adjustment.id,
      summary: `Stocked in ${input.items.length} item(s) at ${adjustment.location.name}`,
    });

    return adjustment;
  });
}

export async function recordStockCount(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    locationId: string;
    date?: string;
    items: Array<{ productId: string; countedQty: number }>;
  }
) {
  requireLocation(ctx, input.locationId);

  return prisma.$transaction(async (tx) => {
    const sheetDate = toDateOnly(input.date ?? new Date());
    const seq = await nextNumber(tx, `SHEET-${source}`);
    const sheetNo = formatSeq("ST", seq, 5);

    const varianceItems: Array<{ productId: string; qtyChange: number }> = [];
    const sheetItemsData: Array<{
      productId: string;
      itemNo: number;
      openingQty: Prisma.Decimal;
      outQty: Prisma.Decimal;
      inQty: Prisma.Decimal;
      closingQty: Prisma.Decimal;
    }> = [];

    let itemNo = 1;
    for (const item of input.items) {
      const level = await tx.stockLevel.findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: input.locationId,
          },
        },
      });
      const systemQty = level ? Number(level.qty) : 0;
      const variance = Number((item.countedQty - systemQty).toFixed(2));

      if (variance !== 0) {
        varianceItems.push({ productId: item.productId, qtyChange: variance });
      }

      sheetItemsData.push({
        productId: item.productId,
        itemNo: itemNo++,
        openingQty: new Prisma.Decimal(systemQty),
        outQty: new Prisma.Decimal(variance < 0 ? Math.abs(variance) : 0),
        inQty: new Prisma.Decimal(variance > 0 ? variance : 0),
        closingQty: new Prisma.Decimal(item.countedQty),
      });
    }

    if (varianceItems.length > 0) {
      const adj = await tx.stockAdjustment.create({
        data: {
          source,
          locationId: input.locationId,
          reason: "PHYSICAL_COUNT",
          note: `Sheet ${sheetNo}`,
          createdById: ctx.user.id,
          items: {
            create: varianceItems.map((v) => ({
              productId: v.productId,
              qtyChange: new Prisma.Decimal(v.qtyChange),
            })),
          },
        },
      });

      for (const v of varianceItems) {
        await adjustStock(tx, {
          productId: v.productId,
          locationId: input.locationId,
          qtyChange: v.qtyChange,
          reason: "PHYSICAL_COUNT",
          refType: "StockAdjustment",
          refId: adj.id,
          actorId: ctx.user.id,
          allowNegative: true,
        });
      }
    }

    const sheet = await tx.stockSheet.create({
      data: {
        source,
        sheetNo,
        date: sheetDate,
        countedBy: `${ctx.user.firstName} ${ctx.user.lastName}`,
        items: { create: sheetItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    await logActivity(tx, {
      source,
      locationId: input.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.STOCK_COUNTED,
      entityType: "StockSheet",
      entityId: sheet.id,
      summary: `Completed physical stock count ${sheetNo} (${input.items.length} products, ${varianceItems.length} variances)`,
    });

    return sheet;
  });
}

export async function getStockAlerts(
  source: ServiceSlug,
  locationIds?: string[]
) {
  const levels = await prisma.stockLevel.findMany({
    where: {
      product: { source, status: "ACTIVE" },
      ...(locationIds && locationIds.length > 0
        ? { locationId: { in: locationIds } }
        : {}),
    },
    include: {
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          unit: true,
          lowStockAt: true,
          priceKobo: true,
          source: true,
        },
      },
      location: { select: { id: true, name: true } },
    },
    orderBy: { qty: "asc" },
  });

  return levels
    .filter((l) => Number(l.qty) <= l.product.lowStockAt)
    .map((l) => ({
      id: l.id,
      productId: l.productId,
      sku: l.product.sku,
      productName: l.product.name,
      unit: l.product.unit,
      locationId: l.locationId,
      locationName: l.location.name,
      qty: Number(l.qty),
      lowStockAt: l.product.lowStockAt,
      source: l.product.source,
      status: Number(l.qty) <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    }));
}
