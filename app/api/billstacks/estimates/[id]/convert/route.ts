import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { convertEstimateToInvoice } from "@/lib/services/invoicing";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BILLSTACKS);
    requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const inv = await convertEstimateToInvoice(ctx, ServiceSlug.BILLSTACKS, params.id);
    return ok(inv, 201, requestId);
  }
);
