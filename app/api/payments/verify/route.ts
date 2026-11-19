import { withErrorHandler, ok } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { verifyAndSettlePayment } from "@/lib/services/webhooks";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim();
  if (!reference) {
    throw new ValidationError("reference query parameter is required");
  }
  const result = await verifyAndSettlePayment(reference);
  return ok(result, 200, requestId);
});
