import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { markBookingNoShow } from "@/lib/services/bookings";

export const POST = withErrorHandler<{ params: { ref: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.APARTMENTS);
    requireRole(ctx, [Role.RECEPTION, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const updated = await markBookingNoShow(ctx, params.ref);
    return ok(updated, 200, requestId);
  }
);
