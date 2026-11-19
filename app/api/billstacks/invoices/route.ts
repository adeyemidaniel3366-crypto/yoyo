import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery, parseSort } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createInvoiceSchema } from "@/lib/validators/invoicing";
import { createInvoice, listInvoices } from "@/lib/services/invoicing";
import { lagosEndOfDayUTC, lagosStartOfDayUTC } from "@/lib/dates";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listInvoices(ctx, ServiceSlug.BILLSTACKS, {
    page: q.page,
    perPage: q.perPage,
    q: q.q,
    status: q.status,
    contactId: q.contactId,
    from: q.from ? lagosStartOfDayUTC(q.from) : undefined,
    to: q.to ? lagosEndOfDayUTC(q.to) : undefined,
    orderBy: parseSort(q.sort, { createdAt: "createdAt", totalKobo: "totalKobo", dueDate: "dueDate" }),
  });
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createInvoiceSchema);
  const inv = await createInvoice(ctx, ServiceSlug.BILLSTACKS, body);
  return ok(inv, 201, requestId);
});
