import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { cartSyncSchema } from "@/lib/validators/galaxy";
import { syncCart } from "@/lib/services/orders";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, cartSyncSchema);
  const res = await syncCart(ctx, body.items);
  return ok(res, 200, requestId);
});
