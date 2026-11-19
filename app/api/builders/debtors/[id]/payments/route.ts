import { Role, SaleStatus, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { recordPaymentSchema } from "@/lib/validators/invoicing";
import { prisma } from "@/lib/prisma";
import { addKobo, formatNGN, subKobo } from "@/lib/money";
import { deriveSaleStatus } from "@/lib/services/sales";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BUILDERS);
    requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, recordPaymentSchema);

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          source: ServiceSlug.BUILDERS,
          contactId: params.id,
          amountKobo: body.amountKobo,
          method: body.method,
          reference: body.reference ?? null,
          status: "PAID",
          receivedById: ctx.user.id,
          note: body.note ?? "Debtor balance payment",
        },
      });

      // Allocate FIFO across unpaid/part-paid Builders sales for this debtor
      let remaining = body.amountKobo;
      const openSales = await tx.sale.findMany({
        where: {
          source: ServiceSlug.BUILDERS,
          contactId: params.id,
          status: { in: [SaleStatus.UNPAID, SaleStatus.PART_PAID] },
        },
        orderBy: { createdAt: "asc" },
      });

      for (const s of openSales) {
        if (remaining <= 0) break;
        const due = subKobo(s.totalKobo, s.paidKobo);
        const applied = Math.min(due, remaining);
        const newPaid = addKobo(s.paidKobo, applied);
        await tx.sale.update({
          where: { id: s.id },
          data: {
            paidKobo: newPaid,
            status: deriveSaleStatus(s.totalKobo, newPaid),
          },
        });
        remaining = subKobo(remaining, applied);
      }

      await logActivity(tx, {
        source: ServiceSlug.BUILDERS,
        actorId: ctx.user.id,
        action: ActivityAction.PAYMENT_RECORDED,
        entityType: "Contact",
        entityId: params.id,
        summary: `Recorded debtor payment of ${formatNGN(body.amountKobo)} via ${body.method}`,
        amountKobo: body.amountKobo,
      });

      return p;
    });

    return ok({ ...payment, amountDisplay: formatNGN(payment.amountKobo) }, 201, requestId);
  }
);
