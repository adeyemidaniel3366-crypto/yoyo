import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listQuerySchema, parseCsvServices, parseCsvStrings } from "@/lib/validators/common";
import { listActivity } from "@/lib/services/platform";
import { lagosEndOfDayUTC, lagosStartOfDayUTC } from "@/lib/dates";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listActivity(ctx, {
    page: q.page,
    perPage: q.perPage,
    services: parseCsvServices(q.service),
    locationIds: parseCsvStrings(q.location),
    q: q.q,
    from: q.from ? lagosStartOfDayUTC(q.from) : undefined,
    to: q.to ? lagosEndOfDayUTC(q.to) : undefined,
  });
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
