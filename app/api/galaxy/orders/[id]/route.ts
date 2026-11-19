import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { isSuperAdmin, withSourceLabel } from "@/lib/scope";
import { getOrCreateCustomerContact } from "@/lib/services/orders";
import { formatNGN } from "@/lib/money";

export const GET = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: params.id }, { orderNo: params.id }] },
      include: { contact: true, items: true, payments: true, coupon: true },
    });
    if (!order) throw new NotFoundError("Order not found");

    const isStaff =
      isSuperAdmin(ctx.user) ||
      (ctx.user.serviceAccess.includes(ServiceSlug.GALAXY) &&
        ctx.user.roles.some((r) => r !== Role.CUSTOMER));

    if (!isStaff) {
      const contact = await getOrCreateCustomerContact(ctx);
      if (order.contactId !== contact.id) {
        throw new NotFoundError("Order not found");
      }
    }

    return ok(
      await withSourceLabel({ ...order, totalDisplay: formatNGN(order.totalKobo) }),
      200,
      requestId
    );
  }
);
