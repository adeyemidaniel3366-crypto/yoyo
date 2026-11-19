import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { listUserNotifications } from "@/lib/services/platform";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listUserNotifications(ctx, q.page, q.perPage);
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
