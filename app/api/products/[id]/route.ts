import { ProductStatus, Role } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const DELETE = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const { id } = params;

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] },
    });

    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    await requireService(ctx, existing.source);
    requireRole(ctx, [Role.SUPER_ADMIN, Role.SERVICE_MANAGER, Role.EMPLOYEE]);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: existing.id },
        data: { status: ProductStatus.ARCHIVED },
      });

      await logActivity(tx, {
        source: existing.source,
        actorId: ctx.user.id.startsWith("demo-") ? null : ctx.user.id,
        action: ActivityAction.PRODUCT_UPDATED,
        entityType: "Product",
        entityId: existing.id,
        summary: `Archived product ${existing.name} (${existing.sku})`,
      });
    });

    return ok({ deleted: true, id: existing.id }, 200, requestId);
  }
);
