import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validators/inventory";
import { updateProduct } from "@/lib/services/products";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BUILDERS);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateProductSchema);
    const updated = await updateProduct(ctx, ServiceSlug.BUILDERS, params.id, body);
    return ok(updated, 200, requestId);
  }
);
