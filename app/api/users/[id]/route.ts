import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validators/platform";
import { updateUser } from "@/lib/services/platform";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    requireRole(ctx, [Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateUserSchema);
    const updated = await updateUser(ctx, params.id, body as Record<string, unknown>);
    return ok(updated, 200, requestId);
  }
);
