import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { prisma } from "@/lib/prisma";
import { formatDateOnly, toDateOnly } from "@/lib/dates";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const q = parseQuery(req, listQuerySchema);
  const where = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.from || q.to
      ? {
          date: {
            ...(q.from ? { gte: toDateOnly(q.from) } : {}),
            ...(q.to ? { lte: toDateOnly(q.to) } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: { employee: { include: { contact: true, department: true } } },
      orderBy: { date: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.attendance.count({ where }),
  ]);

  const enriched = rows.map((a) => ({
    ...a,
    date: formatDateOnly(a.date),
  }));

  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
