import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { stockCountSchema } from "@/lib/validators/inventory";
import { recordStockCount } from "@/lib/services/inventory";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BUILDERS);
  requireRole(ctx, [Role.STOREKEEPER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, stockCountSchema);
  const sheet = await recordStockCount(ctx, ServiceSlug.BUILDERS, body);
  return ok(sheet, 201, requestId);
});
