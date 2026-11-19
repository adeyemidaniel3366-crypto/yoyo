import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { getSaleById } from "@/lib/services/sales";

export const GET = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BUILDERS);
    const sale = await getSaleById(ctx, ServiceSlug.BUILDERS, params.id);
    return ok(sale, 200, requestId);
  }
);
