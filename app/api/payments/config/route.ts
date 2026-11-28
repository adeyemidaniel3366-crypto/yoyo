import { withErrorHandler, ok } from "@/lib/api";
import { getPublicPaymentConfig } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

/** Public, secret-free view of which payment gateways are live on this server. */
export const GET = withErrorHandler(async (_req, _ctx, requestId) => {
  return ok(getPublicPaymentConfig(), 200, requestId);
});
