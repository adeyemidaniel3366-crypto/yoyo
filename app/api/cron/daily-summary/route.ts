import { withErrorHandler, ok, requireCronSecret } from "@/lib/api";
import { runDailySummary } from "@/lib/services/cron";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  requireCronSecret(req);
  const result = await runDailySummary();
  return ok(result, 200, requestId);
});

export const GET = POST;
