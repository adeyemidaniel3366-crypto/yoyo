import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/services/platform";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const res = await markAllNotificationsRead(ctx);
  return ok(res, 200, requestId);
});
