import { ServiceSlug, VisitStatus } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createPreRegisterSchema } from "@/lib/validators/visitors";
import { createPreRegister } from "@/lib/services/visitors";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";
import { formatDateOnly } from "@/lib/dates";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const q = parseQuery(req, listQuerySchema);
  const where = {
    source: ServiceSlug.VISITORS,
    ...(q.status ? { status: q.status as VisitStatus } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.preRegister.findMany({
      where,
      include: { host: { include: { contact: true } } },
      orderBy: { visitDate: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.preRegister.count({ where }),
  ]);

  const enriched = await withSourceLabels(
    rows.map((r) => ({ ...r, visitDate: formatDateOnly(r.visitDate) }))
  );
  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const body = await parseBody(req, createPreRegisterSchema);
  const preReg = await createPreRegister(ctx, body);
  return ok(preReg, 201, requestId);
});
