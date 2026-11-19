// ---------------------------------------------------------------------------
// Zino One — Sales Service (Spark POS + Builders Counter) (§9.1)
// Transactional stock locking (SELECT ... FOR UPDATE), integer kobo math,
// atomic receipt numbering, void/return stock restoration, large-sale alert.
// ---------------------------------------------------------------------------

import { Prisma, Role, SaleStatus, ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import {
  BusinessError,
  InsufficientStockError,
  NotFoundError,
} from "../errors";
import { requireLocation } from "../auth";
import { assertRecordInScope, scopeWhere, withSourceLabel, withSourceLabels, type ServiceContext } from "../scope";
import { addKobo, calcTaxKobo, formatNGN, lineTotalKobo, subKobo } from "../money";
import { formatSeq, nextNumber } from "./numbering";
import { adjustStock } from "./inventory";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";
import { getEnv } from "../env";

export function deriveSaleStatus(totalKobo: number, paidKobo: number): SaleStatus {
  if (paidKobo >= totalKobo) return SaleStatus.PAID;
  if (paidKobo > 0) return SaleStatus.PART_PAID;
  return SaleStatus.UNPAID;
}

export interface CreateSaleInput {
  locationId: string;
  contactId?: string | null;
  items: Array<{ productId: string; qty: number; unitPriceKobo?: number }>;
  discountKobo: number;
  paidKobo: number;
  paymentMethod: string;
  fulfilment?: string | null;
  remarks?: string | null;
  isParked: boolean;
  allowCreditOversell: boolean;
}

export async function createSale(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: CreateSaleInput
) {
  requireLocation(ctx, input.locationId);

  const canOversell =
    source === ServiceSlug.BUILDERS &&
    input.allowCreditOversell &&
    input.paidKobo === 0 &&
    (ctx.user.roles.includes(Role.SERVICE_MANAGER) ||
      ctx.user.roles.includes(Role.SUPER_ADMIN));

  const created = await prisma.$transaction(async (tx) => {
    const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BusinessError(`Product ${item.productId} not found or inactive`);
      }
      if (item.qty <= 0) {
        throw new BusinessError("Quantity must be greater than 0");
      }
    }

    // Lock stock rows with SELECT ... FOR UPDATE (parameterised $queryRaw, §9.1)
    if (!input.isParked) {
      const sortedIds = [...productIds].sort();
      for (const pid of sortedIds) {
        const rows = await tx.$queryRaw<Array<{ qty: string }>>`
          SELECT "qty"::text FROM "StockLevel"
          WHERE "productId" = ${pid} AND "locationId" = ${input.locationId}
          FOR UPDATE
        `;
        const available = rows[0] ? Number(rows[0].qty) : 0;
        const requested = input.items
          .filter((i) => i.productId === pid)
          .reduce((acc, i) => acc + i.qty, 0);
        if (requested > available && !canOversell) {
          throw new InsufficientStockError(
            productMap.get(pid)!.name,
            available,
            requested
          );
        }
      }
    }

    // Compute line totals & per-line tax in integer kobo (§5.2)
    let subtotalKobo = 0;
    let taxKobo = 0;
    const saleItemsData = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPriceKobo = item.unitPriceKobo ?? product.priceKobo;
      const lineTotal = lineTotalKobo(item.qty, unitPriceKobo);
      const lineTax = calcTaxKobo(lineTotal, Number(product.taxRatePct));
      subtotalKobo = addKobo(subtotalKobo, lineTotal);
      taxKobo = addKobo(taxKobo, lineTax);
      return {
        productId: item.productId,
        qty: new Prisma.Decimal(item.qty),
        unitPriceKobo,
        totalKobo: lineTotal,
      };
    });

    if (input.discountKobo > subtotalKobo) {
      throw new BusinessError("Discount cannot exceed subtotal");
    }

    const totalKobo = addKobo(subKobo(subtotalKobo, input.discountKobo), taxKobo);
    const paidKobo = input.isParked ? 0 : Math.min(input.paidKobo, totalKobo);
    const status = deriveSaleStatus(totalKobo, paidKobo);

    const seqKey =
      source === ServiceSlug.SPARK
        ? `RCPT-SPARK-${input.locationId}`
        : `RCPT-${source}`;
    const seq = await nextNumber(tx, seqKey);
    const receiptNo = formatSeq(source === ServiceSlug.SPARK ? "SPK" : "BLD", seq, 6);

    const sale = await tx.sale.create({
      data: {
        source,
        locationId: input.locationId,
        receiptNo,
        contactId: input.contactId ?? null,
        subtotalKobo,
        discountKobo: input.discountKobo,
        taxKobo,
        totalKobo,
        paidKobo,
        status,
        fulfilment: input.fulfilment ?? null,
        paymentMethod: input.paymentMethod,
        soldById: ctx.user.id,
        remarks: input.remarks ?? null,
        isParked: input.isParked,
        items: { create: saleItemsData },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true, unit: true } } } },
        contact: true,
        location: true,
      },
    });

    if (!input.isParked) {
      for (const item of input.items) {
        await adjustStock(tx, {
          productId: item.productId,
          locationId: input.locationId,
          qtyChange: -item.qty,
          reason: "SALE",
          refType: "Sale",
          refId: sale.id,
          actorId: ctx.user.id,
          allowNegative: canOversell,
        });
      }

      if (paidKobo > 0 && input.contactId) {
        await tx.payment.create({
          data: {
            source,
            contactId: input.contactId,
            amountKobo: paidKobo,
            method: input.paymentMethod,
            status: "PAID",
            receivedById: ctx.user.id,
            note: `Sale ${receiptNo}`,
          },
        });
      }

      if (input.contactId) {
        const contact = await tx.contact.findUnique({ where: { id: input.contactId } });
        if (contact && !contact.sources.includes(source)) {
          await tx.contact.update({
            where: { id: contact.id },
            data: { sources: { push: source } },
          });
        }
      }
    }

    await logActivity(tx, {
      source,
      locationId: input.locationId,
      actorId: ctx.user.id,
      action: input.isParked ? ActivityAction.SALE_PARKED : ActivityAction.SALE_CREATED,
      entityType: "Sale",
      entityId: sale.id,
      summary: `${input.isParked ? "Parked" : "Recorded"} sale ${receiptNo} at ${sale.location.name} for ${formatNGN(totalKobo)}`,
      amountKobo: totalKobo,
    });

    return sale;
  });

  if (!created.isParked && created.totalKobo >= getEnv().LARGE_SALE_ALERT_KOBO) {
    void notify({
      roles: [Role.SERVICE_MANAGER, Role.SUPER_ADMIN],
      source,
      title: `Large Sale Alert — ${created.receiptNo}`,
      body: `Sale ${created.receiptNo} of ${formatNGN(created.totalKobo)} completed at ${created.location.name}.`,
      entityType: "Sale",
      entityId: created.id,
      channels: ["IN_APP", "EMAIL"],
    });
  }

  return withSourceLabel({
    ...created,
    totalDisplay: formatNGN(created.totalKobo),
    paidDisplay: formatNGN(created.paidKobo),
  });
}

export async function voidSale(
  ctx: ServiceContext,
  source: ServiceSlug,
  saleId: string,
  reason: string
) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true, location: true },
    });
    await assertRecordInScope(ctx, sale, "Sale");
    if (!sale || sale.source !== source) throw new NotFoundError("Sale not found");
    if (sale.status === SaleStatus.VOID) {
      throw new BusinessError("Sale is already voided");
    }

    if (!sale.isParked) {
      for (const item of sale.items) {
        await adjustStock(tx, {
          productId: item.productId,
          locationId: sale.locationId,
          qtyChange: Number(item.qty),
          reason: `SALE_VOID: ${reason}`,
          refType: "Sale",
          refId: sale.id,
          actorId: ctx.user.id,
        });
      }
    }

    const updated = await tx.sale.update({
      where: { id: sale.id },
      data: {
        status: SaleStatus.VOID,
        remarks: `${sale.remarks ? sale.remarks + " | " : ""}VOID: ${reason}`,
      },
    });

    await logActivity(tx, {
      source,
      locationId: sale.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.SALE_VOIDED,
      entityType: "Sale",
      entityId: sale.id,
      summary: `Voided sale ${sale.receiptNo} (${reason})`,
      amountKobo: -sale.totalKobo,
    });

    return withSourceLabel(updated);
  });
}

export async function returnSale(
  ctx: ServiceContext,
  source: ServiceSlug,
  saleId: string,
  input: {
    reason: string;
    refundMethod: string;
    items: Array<{ productId: string; qty: number; restock: boolean }>;
  }
) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true, location: true },
    });
    await assertRecordInScope(ctx, sale, "Sale");
    if (!sale || sale.source !== source) throw new NotFoundError("Sale not found");
    if (sale.status === SaleStatus.VOID) {
      throw new BusinessError("Cannot return a voided sale");
    }

    let refundKobo = 0;
    for (const ret of input.items) {
      const orig = sale.items.find((i) => i.productId === ret.productId);
      if (!orig) {
        throw new BusinessError(`Product ${ret.productId} was not part of this sale`);
      }
      if (ret.qty > Number(orig.qty)) {
        throw new BusinessError("Return quantity cannot exceed sold quantity");
      }
      refundKobo = addKobo(refundKobo, lineTotalKobo(ret.qty, orig.unitPriceKobo));

      if (ret.restock) {
        await adjustStock(tx, {
          productId: ret.productId,
          locationId: sale.locationId,
          qtyChange: ret.qty,
          reason: `SALE_RETURN: ${input.reason}`,
          refType: "SaleReturn",
          refId: sale.id,
          actorId: ctx.user.id,
        });
      }
    }

    if (sale.contactId && refundKobo > 0) {
      await tx.payment.create({
        data: {
          source,
          contactId: sale.contactId,
          amountKobo: -refundKobo,
          method: input.refundMethod,
          status: "REFUNDED",
          receivedById: ctx.user.id,
          note: `Return on sale ${sale.receiptNo}: ${input.reason}`,
        },
      });
    }

    const updated = await tx.sale.update({
      where: { id: sale.id },
      data: {
        status: SaleStatus.RETURNED,
        paidKobo: Math.max(0, subKobo(sale.paidKobo, refundKobo)),
      },
    });

    await logActivity(tx, {
      source,
      locationId: sale.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.SALE_RETURNED,
      entityType: "Sale",
      entityId: sale.id,
      summary: `Returned items on sale ${sale.receiptNo} — refund ${formatNGN(refundKobo)}`,
      amountKobo: -refundKobo,
    });

    return withSourceLabel({
      sale: updated,
      refundKobo,
      refundDisplay: formatNGN(refundKobo),
      source,
    });
  });
}

export async function listSales(
  ctx: ServiceContext,
  source: ServiceSlug,
  params: {
    page: number;
    perPage: number;
    q?: string;
    status?: string;
    locationIds?: string[];
    from?: Date;
    to?: Date;
    orderBy?: Record<string, "asc" | "desc">;
  }
) {
  const scope = scopeWhere(ctx, {
    service: source,
    locationIds: params.locationIds,
    hasLocation: true,
  });

  const where: Prisma.SaleWhereInput = {
    ...scope,
    ...(params.status ? { status: params.status as SaleStatus } : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          OR: [
            { receiptNo: { contains: params.q, mode: "insensitive" } },
            { contact: { name: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        location: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true, phone: true } },
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
      orderBy: params.orderBy ?? { createdAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    }),
    prisma.sale.count({ where }),
  ]);

  const enriched = await withSourceLabels(
    rows.map((r) => ({
      ...r,
      totalDisplay: formatNGN(r.totalKobo),
      paidDisplay: formatNGN(r.paidKobo),
    }))
  );

  return { rows: enriched, total };
}

export async function getSaleById(
  ctx: ServiceContext,
  source: ServiceSlug,
  id: string
) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      location: true,
      contact: true,
      items: { include: { product: true } },
    },
  });
  await assertRecordInScope(ctx, sale, "Sale");
  if (!sale || sale.source !== source) throw new NotFoundError("Sale not found");
  return withSourceLabel({
    ...sale,
    totalDisplay: formatNGN(sale.totalKobo),
    paidDisplay: formatNGN(sale.paidKobo),
  });
}
