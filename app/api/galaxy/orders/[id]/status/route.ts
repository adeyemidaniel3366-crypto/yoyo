import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validators/galaxy";
import { updateOrderStatus } from "@/lib/services/orders";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.GALAXY);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateOrderStatusSchema);
    const updated = await updateOrderStatus(ctx, params.id, body.status);
    return ok(updated, 200, requestId);
  }
);
