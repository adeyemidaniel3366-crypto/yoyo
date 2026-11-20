import { ServiceSlug, VisitStatus } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createVisitSchema } from "@/lib/validators/visitors";
import { walkInCheckIn } from "@/lib/services/visitors";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const q = parseQuery(req, listQuerySchema);
  const where = {
    source: ServiceSlug.VISITORS,
    deletedAt: null,
    ...(q.status ? { status: q.status as VisitStatus } : {}),
    ...(q.q
      ? {
          OR: [
            { contact: { name: { contains: q.q, mode: "insensitive" as const } } },
            { purpose: { contains: q.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      include: { contact: true, host: { include: { contact: true } } },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.visit.count({ where }),
  ]);

  return okList(await withSourceLabels(rows), buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const body = await parseBody(req, createVisitSchema);
  const visit = await walkInCheckIn(ctx, body);
  return ok(visit, 201, requestId);
});
