import { withErrorHandler, ok, requireCronSecret } from "@/lib/api";
import { runDueRecurringInvoices } from "@/lib/services/invoicing";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  requireCronSecret(req);
  const result = await runDueRecurringInvoices();
  return ok(result, 200, requestId);
});

export const GET = POST;
