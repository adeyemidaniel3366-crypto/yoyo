import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createRecurringSchema } from "@/lib/validators/invoicing";
import { createRecurringInvoice } from "@/lib/services/invoicing";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.BILLSTACKS };
  const [rows, total] = await Promise.all([
    prisma.recurringInvoice.findMany({
      where,
      orderBy: { nextRunAt: "asc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.recurringInvoice.count({ where }),
  ]);
  return okList(await withSourceLabels(rows), buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createRecurringSchema);
  const rec = await createRecurringInvoice(ctx, ServiceSlug.BILLSTACKS, body);
  return ok(rec, 201, requestId);
});
