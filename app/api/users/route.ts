import { Role } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createUserSchema } from "@/lib/validators/platform";
import { createUser, listUsers } from "@/lib/services/platform";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [Role.SUPER_ADMIN, Role.SERVICE_MANAGER]);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listUsers(ctx, q.page, q.perPage);
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [Role.SUPER_ADMIN]);
  const body = await parseBody(req, createUserSchema);
  const user = await createUser(ctx, body);
  return ok(user, 201, requestId);
});
