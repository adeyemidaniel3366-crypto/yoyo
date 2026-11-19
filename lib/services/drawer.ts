// ---------------------------------------------------------------------------
// Zino One — Cash Drawer Sessions (§9.7)
// ---------------------------------------------------------------------------

import { Role, ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import { BusinessError, ConflictError, NotFoundError } from "../errors";
import { requireLocation } from "../auth";
import type { ServiceContext } from "../scope";
import { addKobo, formatNGN, subKobo } from "../money";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";

/**
 * Pure helper for unit-testing expected cash calculation (§9.7, §18).
 */
export function computeExpectedDrawerCash(params: {
  openingKobo: number;
  cashSalesKobo: number;
  cashReceivedKobo: number;
  cashExpensesKobo: number;
  cashRefundsKobo: number;
}): number {
  const inflows = addKobo(
    params.openingKobo,
    params.cashSalesKobo,
    params.cashReceivedKobo
  );
  const outflows = addKobo(params.cashExpensesKobo, params.cashRefundsKobo);
  return subKobo(inflows, outflows);
}

export async function getActiveDrawer(
  ctx: ServiceContext,
  source: ServiceSlug,
  locationId?: string
) {
  const where: Record<string, unknown> = { source, status: "OPEN" };
  if (locationId) {
    requireLocation(ctx, locationId);
    where.locationId = locationId;
  } else if (ctx.user.locationIds.length > 0 && !ctx.user.roles.includes(Role.SUPER_ADMIN)) {
    where.locationId = { in: ctx.user.locationIds };
  }

  return prisma.cashDrawerSession.findFirst({
    where,
    include: { location: true },
    orderBy: { openedAt: "desc" },
  });
}

export async function openDrawer(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: { locationId: string; openingKobo: number }
) {
  requireLocation(ctx, input.locationId);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.cashDrawerSession.findFirst({
      where: { locationId: input.locationId, status: "OPEN" },
    });
    if (existing) {
      throw new ConflictError("A cash drawer session is already open at this location");
    }

    const session = await tx.cashDrawerSession.create({
      data: {
        source,
        locationId: input.locationId,
        openedById: ctx.user.id,
        openingKobo: input.openingKobo,
        status: "OPEN",
      },
      include: { location: true },
    });

    await logActivity(tx, {
      source,
      locationId: input.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.DRAWER_OPENED,
      entityType: "CashDrawerSession",
      entityId: session.id,
      summary: `Opened cash drawer at ${session.location.name} with ${formatNGN(input.openingKobo)}`,
      amountKobo: input.openingKobo,
    });

    return session;
  });
}

export async function closeDrawer(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: { sessionId: string; countedKobo: number }
) {
  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.cashDrawerSession.findUnique({
      where: { id: input.sessionId },
      include: { location: true },
    });
    if (!session || session.source !== source) {
      throw new NotFoundError("Cash drawer session not found");
    }
    requireLocation(ctx, session.locationId);

    if (session.status !== "OPEN") {
      throw new BusinessError("Cash drawer session is already closed");
    }

    const now = new Date();

    const [salesAgg, paymentsAgg, refundsAgg, expensesAgg] = await Promise.all([
      tx.sale.aggregate({
        where: {
          source,
          locationId: session.locationId,
          paymentMethod: "CASH",
          isParked: false,
          status: { not: "VOID" },
          createdAt: { gte: session.openedAt, lte: now },
        },
        _sum: { paidKobo: true },
      }),
      tx.payment.aggregate({
        where: {
          source,
          method: "CASH",
          status: "PAID",
          amountKobo: { gt: 0 },
          invoiceId: { not: null },
          date: { gte: session.openedAt, lte: now },
        },
        _sum: { amountKobo: true },
      }),
      tx.payment.aggregate({
        where: {
          source,
          method: "CASH",
          status: "REFUNDED",
          date: { gte: session.openedAt, lte: now },
        },
        _sum: { amountKobo: true },
      }),
      tx.expense.aggregate({
        where: {
          source,
          locationId: session.locationId,
          date: { gte: session.openedAt, lte: now },
        },
        _sum: { amountKobo: true },
      }),
    ]);

    const expectedKobo = computeExpectedDrawerCash({
      openingKobo: session.openingKobo,
      cashSalesKobo: salesAgg._sum.paidKobo ?? 0,
      cashReceivedKobo: paymentsAgg._sum.amountKobo ?? 0,
      cashExpensesKobo: expensesAgg._sum.amountKobo ?? 0,
      cashRefundsKobo: Math.abs(refundsAgg._sum.amountKobo ?? 0),
    });

    const varianceKobo = subKobo(input.countedKobo, expectedKobo);

    const closed = await tx.cashDrawerSession.update({
      where: { id: session.id },
      data: {
        closedById: ctx.user.id,
        closedAt: now,
        expectedKobo,
        countedKobo: input.countedKobo,
        varianceKobo,
        status: "CLOSED",
      },
      include: { location: true },
    });

    await logActivity(tx, {
      source,
      locationId: session.locationId,
      actorId: ctx.user.id,
      action: ActivityAction.DRAWER_CLOSED,
      entityType: "CashDrawerSession",
      entityId: session.id,
      summary: `Closed cash drawer at ${session.location.name}. Counted ${formatNGN(input.countedKobo)}, expected ${formatNGN(expectedKobo)}, variance ${formatNGN(varianceKobo)}`,
      amountKobo: varianceKobo,
    });

    return closed;
  });

  if (result.varianceKobo && result.varianceKobo !== 0) {
    void notify({
      roles: [Role.SERVICE_MANAGER, Role.SUPER_ADMIN],
      source,
      title: `Cash Drawer Variance — ${result.location.name}`,
      body: `Drawer closed with a variance of ${formatNGN(result.varianceKobo)} (expected ${formatNGN(result.expectedKobo ?? 0)}, counted ${formatNGN(result.countedKobo ?? 0)}).`,
      entityType: "CashDrawerSession",
      entityId: result.id,
      channels: ["IN_APP", "EMAIL"],
      critical: true,
    });
  }

  return result;
}
