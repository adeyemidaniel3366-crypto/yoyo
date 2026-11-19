import { ContactType, ServiceSlug } from "@prisma/client";
import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.APARTMENTS);
  const q = parseQuery(req, listQuerySchema);
  const where = {
    types: { has: ContactType.GUEST },
    sources: { has: ServiceSlug.APARTMENTS },
    ...(q.q ? { name: { contains: q.q, mode: "insensitive" as const } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.contact.count({ where }),
  ]);
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
