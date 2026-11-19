import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createPurchaseOrderSchema } from "@/lib/validators/invoicing";
import { createPurchaseOrder } from "@/lib/services/invoicing";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";
import { formatNGN } from "@/lib/money";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.BILLSTACKS };
  const [rows, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);
  const enriched = await withSourceLabels(rows.map((r) => ({ ...r, totalDisplay: formatNGN(r.totalKobo) })));
  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createPurchaseOrderSchema);
  const po = await createPurchaseOrder(ctx, ServiceSlug.BILLSTACKS, body);
  return ok(po, 201, requestId);
});
