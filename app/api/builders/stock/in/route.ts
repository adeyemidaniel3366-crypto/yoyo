import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { stockInSchema } from "@/lib/validators/inventory";
import { recordStockIn } from "@/lib/services/inventory";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BUILDERS);
  requireRole(ctx, [Role.STOREKEEPER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, stockInSchema);
  const res = await recordStockIn(ctx, ServiceSlug.BUILDERS, body);
  return ok(res, 201, requestId);
});
