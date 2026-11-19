import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { voidSaleSchema } from "@/lib/validators/sales";
import { voidSale } from "@/lib/services/sales";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.SPARK);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, voidSaleSchema);
    const updated = await voidSale(ctx, ServiceSlug.SPARK, params.id, body.reason);
    return ok(updated, 200, requestId);
  }
);
