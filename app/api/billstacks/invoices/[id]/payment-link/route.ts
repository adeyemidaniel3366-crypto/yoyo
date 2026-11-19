import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { createPaymentLinkSchema } from "@/lib/validators/invoicing";
import { createInvoicePaymentLink } from "@/lib/services/invoicing";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BILLSTACKS);
    requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, createPaymentLinkSchema);
    const link = await createInvoicePaymentLink(ctx, ServiceSlug.BILLSTACKS, params.id, body);
    return ok(link, 201, requestId);
  }
);
