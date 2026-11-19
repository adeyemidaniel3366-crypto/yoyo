import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { checkOutVisit } from "@/lib/services/visitors";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.VISITORS);
    requireRole(ctx, [Role.RECEPTION, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const visit = await checkOutVisit(ctx, params.id);
    return ok(visit, 200, requestId);
  }
);
