import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateLocationSchema } from "@/lib/validators/platform";
import { updateLocation } from "@/lib/services/platform";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    requireRole(ctx, [Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateLocationSchema);
    const loc = await updateLocation(ctx, params.id, body);
    return ok(loc, 200, requestId);
  }
);
