import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  return ok(ctx.user, 200, requestId);
});
