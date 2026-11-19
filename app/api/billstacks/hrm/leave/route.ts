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
    prisma.leaveRequest.findMany({
      include: { employee: { include: { contact: true } } },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.leaveRequest.count(),
  ]);
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
