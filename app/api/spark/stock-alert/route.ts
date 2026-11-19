import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema, parseCsvStrings } from "@/lib/validators/common";
import { getStockAlerts } from "@/lib/services/inventory";
import { isSuperAdmin, withSourceLabels } from "@/lib/scope";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const q = parseQuery(req, listQuerySchema);
  const requestedLocs = parseCsvStrings(q.location);
  const effectiveLocs =
    requestedLocs ??
    (!isSuperAdmin(ctx.user) && ctx.user.locationIds.length > 0
      ? ctx.user.locationIds
      : undefined);
  const alerts = await getStockAlerts(ServiceSlug.SPARK, effectiveLocs);
  return ok(await withSourceLabels(alerts), 200, requestId);
});
