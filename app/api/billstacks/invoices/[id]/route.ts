import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { updateInvoiceSchema } from "@/lib/validators/invoicing";
import { updateInvoice } from "@/lib/services/invoicing";
import { prisma } from "@/lib/prisma";
import { assertRecordInScope, withSourceLabel } from "@/lib/scope";
import { NotFoundError } from "@/lib/errors";
import { formatNGN } from "@/lib/money";

export const GET = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BILLSTACKS);
    const inv = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { contact: true, items: true, payments: true },
    });
    await assertRecordInScope(ctx, inv, "Invoice");
    if (!inv || inv.source !== ServiceSlug.BILLSTACKS) throw new NotFoundError("Invoice not found");
    return ok(await withSourceLabel({ ...inv, totalDisplay: formatNGN(inv.totalKobo) }), 200, requestId);
  }
);

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BILLSTACKS);
    requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateInvoiceSchema);
    const updated = await updateInvoice(ctx, ServiceSlug.BILLSTACKS, params.id, body);
    return ok(updated, 200, requestId);
  }
);
