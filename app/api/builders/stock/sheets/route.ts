import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BUILDERS);
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.BUILDERS };
  const [rows, total] = await Promise.all([
    prisma.stockSheet.findMany({
      where,
      include: { items: { include: { product: { select: { name: true, sku: true, unit: true } } } } },
      orderBy: { date: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.stockSheet.count({ where }),
  ]);
  return okList(await withSourceLabels(rows), buildPaginationMeta(q.page, q.perPage, total), requestId);
});
