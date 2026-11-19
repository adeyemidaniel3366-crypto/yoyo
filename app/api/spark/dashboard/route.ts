import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema, parseCsvStrings } from "@/lib/validators/common";
import { getDashboardSummary } from "@/lib/services/reports";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const q = parseQuery(req, listQuerySchema);
  const data = await getDashboardSummary(ctx, {
    services: [ServiceSlug.SPARK],
    locationIds: parseCsvStrings(q.location),
    from: q.from,
    to: q.to,
  });
  return ok(data, 200, requestId);
});
