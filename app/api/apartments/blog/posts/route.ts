import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { listQuerySchema } from "@/lib/validators/common";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.APARTMENTS, status: "PUBLISHED" };
  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.blogPost.count({ where }),
  ]);
  return okList(await withSourceLabels(rows), buildPaginationMeta(q.page, q.perPage, total), requestId);
});
