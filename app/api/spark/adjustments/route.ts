import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { createAdjustmentSchema } from "@/lib/validators/inventory";
import { recordAdjustment } from "@/lib/services/inventory";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.STOREKEEPER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createAdjustmentSchema);
  const adj = await recordAdjustment(ctx, ServiceSlug.SPARK, body);
  return ok(adj, 201, requestId);
});
