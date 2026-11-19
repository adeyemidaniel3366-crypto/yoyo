import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { registerSchema } from "@/lib/validators/auth";
import { registerPublicCustomer } from "@/lib/services/platform";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.AUTH, getClientIp(req));
  const body = await parseBody(req, registerSchema);
  const user = await registerPublicCustomer(body);
  return ok(user, 201, requestId);
});
