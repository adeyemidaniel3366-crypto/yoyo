import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRecordInScope, withSourceLabel } from "@/lib/scope";
import { NotFoundError } from "@/lib/errors";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.SPARK);
    requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const sale = await prisma.sale.findUnique({ where: { id: params.id } });
    await assertRecordInScope(ctx, sale, "Sale");
    if (!sale || sale.source !== ServiceSlug.SPARK) throw new NotFoundError("Sale not found");
    const updated = await prisma.sale.update({
      where: { id: sale.id },
      data: { isParked: true },
    });
    return ok(await withSourceLabel(updated), 200, requestId);
  }
);
