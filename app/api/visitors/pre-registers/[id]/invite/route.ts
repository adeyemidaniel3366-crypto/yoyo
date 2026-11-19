import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { sendPreRegisterInvite } from "@/lib/services/visitors";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.VISITORS);
    const updated = await sendPreRegisterInvite(ctx, params.id);
    return ok(updated, 200, requestId);
  }
);
