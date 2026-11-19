import { Role } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { listQuerySchema, parseCsvServices } from "@/lib/validators/common";
import { createContactSchema } from "@/lib/validators/contacts";
import { createContact, listContacts } from "@/lib/services/platform";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listContacts(ctx, {
    page: q.page,
    perPage: q.perPage,
    q: q.q,
    services: parseCsvServices(q.service),
    type: q.filter,
  });
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [
    Role.CASHIER,
    Role.RECEPTION,
    Role.ACCOUNTANT,
    Role.STOREKEEPER,
    Role.SERVICE_MANAGER,
    Role.SUPER_ADMIN,
  ]);
  const body = await parseBody(req, createContactSchema);
  const contact = await createContact(ctx, body);
  return ok(contact, 201, requestId);
});
