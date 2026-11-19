import { withErrorHandler, ok } from "@/lib/api";
import { checkHealth } from "@/lib/services/platform";

export const GET = withErrorHandler(async (_req, _ctx, requestId) => {
  const data = await checkHealth();
  return ok(data, 200, requestId);
});
