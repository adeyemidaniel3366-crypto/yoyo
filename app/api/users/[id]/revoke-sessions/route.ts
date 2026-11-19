import { Role } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { revokeUserSessions } from "@/lib/services/platform";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    requireRole(ctx, [Role.SUPER_ADMIN]);
    const res = await revokeUserSessions(ctx, params.id);
    return ok(res, 200, requestId);
  }
);
