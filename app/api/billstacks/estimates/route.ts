import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createEstimateSchema } from "@/lib/validators/invoicing";
import { createEstimate } from "@/lib/services/invoicing";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";
import { formatNGN } from "@/lib/money";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.BILLSTACKS };
  const [rows, total] = await Promise.all([
    prisma.estimate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.estimate.count({ where }),
  ]);
  const enriched = await withSourceLabels(rows.map((r) => ({ ...r, totalDisplay: formatNGN(r.totalKobo) })));
  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createEstimateSchema);
  const est = await createEstimate(ctx, ServiceSlug.BILLSTACKS, body);
  return ok(est, 201, requestId);
});
