import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { clockIn } from "@/lib/services/visitors";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.VISITORS);
  const att = await clockIn(ctx);
  return ok(att, 201, requestId);
});
