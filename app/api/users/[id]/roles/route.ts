import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateUserRolesSchema } from "@/lib/validators/platform";
import { updateUserRoles } from "@/lib/services/platform";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    requireRole(ctx, [Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateUserRolesSchema);
    const updated = await updateUserRoles(ctx, params.id, body);
    return ok(updated, 200, requestId);
  }
);
