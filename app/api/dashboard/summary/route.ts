import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listQuerySchema, parseCsvServices, parseCsvStrings } from "@/lib/validators/common";
import { getDashboardSummary } from "@/lib/services/reports";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const data = await getDashboardSummary(ctx, {
    services: parseCsvServices(q.service),
    locationIds: parseCsvStrings(q.location),
    from: q.from,
    to: q.to,
  });
  return ok(data, 200, requestId);
});
