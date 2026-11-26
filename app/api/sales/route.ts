import { Role, SaleStatus, ServiceSlug } from "@prisma/client";
import {
  withErrorHandler,
  ok,
  okList,
  buildPaginationMeta,
  parseQuery,
} from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getEffectiveServices } from "@/lib/scope";
import { formatNGN } from "@/lib/money";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";
import { listQuerySchema, parseCsvServices } from "@/lib/validators/common";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const allowed = getEffectiveServices(ctx.user, parseCsvServices(q.service));

  const where = {
    source: { in: allowed },
    isParked: false,
  };

  const [rows, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        contact: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.sale.count({ where }),
  ]);

  return okList(
    rows.map((s) => ({ ...s, totalDisplay: formatNGN(s.totalKobo) })),
    buildPaginationMeta(q.page, q.perPage, total),
    requestId
  );
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await req.json().catch(() => null);
  if (!body) {
    throw new ValidationError("Request body is required");
  }

  const source = (body.source as ServiceSlug) || ServiceSlug.SPARK;
  if (!Object.values(ServiceSlug).includes(source)) {
    throw new ValidationError("Invalid service source");
  }

  await requireService(ctx, source);
  requireRole(ctx, [
    Role.SUPER_ADMIN,
    Role.SERVICE_MANAGER,
    Role.CASHIER,
    Role.ACCOUNTANT,
    Role.EMPLOYEE,
  ]);

  const amountKobo = Math.max(0, Math.trunc(Number(body.amountKobo ?? 0)));
  const summary = String(
    body.activitySummary || body.summary || "Platform transaction"
  );
  const receiptNo = String(
    body.invoiceNo || `TX-${Date.now().toString().slice(-6)}`
  );

  const loc = await prisma.location.findFirst({
    where: { isActive: true, services: { has: source } },
  });

  if (!loc) {
    // Log activity even if no physical location record exists for the service
    await logActivity(prisma, {
      source,
      actorId: ctx.user.id.startsWith("demo-") ? null : ctx.user.id,
      action: ActivityAction.SALE_CREATED,
      entityType: "Transaction",
      entityId: receiptNo,
      summary,
      amountKobo,
    });
    return ok({ recorded: true, receiptNo, amountKobo }, 201, requestId);
  }

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        source,
        locationId: loc.id,
        receiptNo,
        subtotalKobo: amountKobo,
        discountKobo: 0,
        taxKobo: 0,
        totalKobo: amountKobo,
        paidKobo: amountKobo,
        status: SaleStatus.PAID,
        paymentMethod: "POS",
        soldById: ctx.user.id,
        remarks: summary,
      },
    });

    await logActivity(tx, {
      source,
      locationId: loc.id,
      actorId: ctx.user.id.startsWith("demo-") ? null : ctx.user.id,
      action: ActivityAction.SALE_CREATED,
      entityType: "Sale",
      entityId: created.id,
      summary: `${summary} (${receiptNo})`,
      amountKobo,
    });

    return created;
  });

  return ok(
    { ...sale, totalDisplay: formatNGN(sale.totalKobo) },
    201,
    requestId
  );
});
