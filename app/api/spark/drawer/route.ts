import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { getActiveDrawer } from "@/lib/services/drawer";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId") ?? undefined;
  const session = await getActiveDrawer(ctx, ServiceSlug.SPARK, locationId);
  return ok(session, 200, requestId);
});
