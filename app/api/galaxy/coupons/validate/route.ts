import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { validateCouponSchema } from "@/lib/validators/galaxy";
import { validateCouponCode } from "@/lib/services/orders";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await requireAuth(req, requestId);
  const body = await parseBody(req, validateCouponSchema);
  const result = await validateCouponCode(body.code, body.subtotalKobo);
  return ok(result, 200, requestId);
});
