import { withErrorHandler, ok, parseBody } from "@/lib/api";
import {
  confirmPasswordResetSchema,
  requestPasswordResetSchema,
} from "@/lib/validators/auth";
import {
  confirmPasswordReset,
  requestPasswordReset,
} from "@/lib/services/platform";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.AUTH, getClientIp(req));
  const body = await parseBody(req, requestPasswordResetSchema);
  const res = await requestPasswordReset(body.email);
  return ok(res, 200, requestId);
});

export const PUT = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.AUTH, getClientIp(req));
  const body = await parseBody(req, confirmPasswordResetSchema);
  const res = await confirmPasswordReset(body.token, body.newPassword);
  return ok(res, 200, requestId);
});
