import { PurchaseOrderStatus, Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { receivePurchaseSchema } from "@/lib/validators/invoicing";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { adjustStock } from "@/lib/services/inventory";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.SPARK);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, receivePurchaseSchema);

    const updated = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!po || po.source !== ServiceSlug.SPARK) throw new NotFoundError("Purchase order not found");

      for (const item of body.items) {
        const orig = po.items.find((i) => i.id === item.purchaseItemId);
        if (!orig) continue;
        await adjustStock(tx, {
          productId: orig.productId,
          locationId: body.locationId,
          qtyChange: -item.qty,
          reason: `PO_RETURN:${po.poNo}`,
          refType: "PurchaseOrder",
          refId: po.id,
          actorId: ctx.user.id,
        });
      }

      const saved = await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: PurchaseOrderStatus.CANCELLED },
      });

      await logActivity(tx, {
        source: ServiceSlug.SPARK,
        locationId: body.locationId,
        actorId: ctx.user.id,
        action: ActivityAction.PO_RETURNED,
        entityType: "PurchaseOrder",
        entityId: po.id,
        summary: `Returned purchase order ${po.poNo} items to supplier`,
      });
      return saved;
    });

    return ok(updated, 200, requestId);
  }
);
