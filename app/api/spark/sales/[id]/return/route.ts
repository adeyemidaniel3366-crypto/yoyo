import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { returnSaleSchema } from "@/lib/validators/sales";
import { returnSale } from "@/lib/services/sales";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.SPARK);
    requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, returnSaleSchema);
    const res = await returnSale(ctx, ServiceSlug.SPARK, params.id, body);
    return ok(res, 200, requestId);
  }
);
