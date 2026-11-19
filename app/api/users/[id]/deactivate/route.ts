import { Role } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { deactivateUser } from "@/lib/services/platform";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    requireRole(ctx, [Role.SUPER_ADMIN]);
    const updated = await deactivateUser(ctx, params.id);
    return ok(updated, 200, requestId);
  }
);
