import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { closeDrawerSchema } from "@/lib/validators/sales";
import { closeDrawer } from "@/lib/services/drawer";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, closeDrawerSchema);
  const session = await closeDrawer(ctx, ServiceSlug.SPARK, body);
  return ok(session, 200, requestId);
});
