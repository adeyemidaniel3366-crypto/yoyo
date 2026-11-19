import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  const q = parseQuery(req, listQuerySchema);
  const [rows, total] = await Promise.all([
    prisma.employee.findMany({
      include: { contact: true, department: true, designation: true },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.employee.count(),
  ]);
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
