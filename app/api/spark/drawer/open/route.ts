import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { openDrawerSchema } from "@/lib/validators/sales";
import { openDrawer } from "@/lib/services/drawer";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, openDrawerSchema);
  const session = await openDrawer(ctx, ServiceSlug.SPARK, body);
  return ok(session, 201, requestId);
});
