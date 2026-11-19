import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createTransferSchema } from "@/lib/validators/inventory";
import { transferStock } from "@/lib/services/inventory";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.SPARK };
  const [rows, total] = await Promise.all([
    prisma.stockTransfer.findMany({
      where,
      include: { from: true, to: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.stockTransfer.count({ where }),
  ]);
  return okList(await withSourceLabels(rows), buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.STOREKEEPER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createTransferSchema);
  const transfer = await transferStock(ctx, ServiceSlug.SPARK, body);
  return ok(transfer, 201, requestId);
});
