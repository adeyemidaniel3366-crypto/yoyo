import { withErrorHandler, ok, requireCronSecret } from "@/lib/api";
import { markOverdueInvoices } from "@/lib/services/invoicing";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  requireCronSecret(req);
  const result = await markOverdueInvoices();
  return ok(result, 200, requestId);
});

export const GET = POST;
