import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { clockOut } from "@/lib/services/visitors";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const att = await clockOut(ctx);
  return ok(att, 200, requestId);
});
