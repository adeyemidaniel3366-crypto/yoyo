import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { markNotificationRead } from "@/lib/services/platform";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const updated = await markNotificationRead(ctx, params.id);
    return ok(updated, 200, requestId);
  }
);
