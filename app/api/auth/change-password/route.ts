import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators/auth";
import { changePassword } from "@/lib/services/platform";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, changePasswordSchema);
  const res = await changePassword(ctx, body.currentPassword, body.newPassword);
  return ok(res, 200, requestId);
});
