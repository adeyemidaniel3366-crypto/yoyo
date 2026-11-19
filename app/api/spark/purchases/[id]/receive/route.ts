import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { receivePurchaseSchema } from "@/lib/validators/invoicing";
import { receivePurchaseOrder } from "@/lib/services/invoicing";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.SPARK);
    requireRole(ctx, [Role.STOREKEEPER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, receivePurchaseSchema);
    const po = await receivePurchaseOrder(ctx, ServiceSlug.SPARK, params.id, body);
    return ok(po, 200, requestId);
  }
);
