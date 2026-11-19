import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { globalSearch } from "@/lib/services/search";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const results = await globalSearch(ctx, q.q ?? "");
  return ok(results, 200, requestId);
});
