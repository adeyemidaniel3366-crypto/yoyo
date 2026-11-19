import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { bookingConfirmSchema } from "@/lib/validators/apartments";
import { confirmBooking } from "@/lib/services/bookings";

export const POST = withErrorHandler<{ params: { ref: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.APARTMENTS);
    requireRole(ctx, [Role.RECEPTION, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, bookingConfirmSchema).catch(() => ({ roomId: null }));
    const updated = await confirmBooking(ctx, params.ref, body.roomId);
    return ok(updated, 200, requestId);
  }
);
