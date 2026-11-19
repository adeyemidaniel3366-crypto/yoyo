import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createExpenseSchema } from "@/lib/validators/invoicing";
import { createExpense } from "@/lib/services/invoicing";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";
import { formatNGN } from "@/lib/money";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const q = parseQuery(req, listQuerySchema);
  const where = { source: ServiceSlug.SPARK };
  const [rows, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { location: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.expense.count({ where }),
  ]);
  const enriched = await withSourceLabels(rows.map((r) => ({ ...r, amountDisplay: formatNGN(r.amountKobo) })));
  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const body = await parseBody(req, createExpenseSchema);
  const exp = await createExpense(ctx, ServiceSlug.SPARK, body);
  return ok(exp, 201, requestId);
});
