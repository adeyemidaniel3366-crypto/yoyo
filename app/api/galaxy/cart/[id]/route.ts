import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { cartUpdateSchema } from "@/lib/validators/galaxy";
import { getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const body = await parseBody(req, cartUpdateSchema);
    const contact = await getOrCreateCustomerContact(ctx);
    const existing = await prisma.cartItem.findFirst({
      where: { id: params.id, contactId: contact.id },
    });
    if (!existing) throw new NotFoundError("Cart item not found");
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { qty: body.qty },
      include: { product: true, variant: true },
    });
    return ok(updated, 200, requestId);
  }
);

export const DELETE = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const contact = await getOrCreateCustomerContact(ctx);
    await prisma.cartItem.deleteMany({
      where: { id: params.id, contactId: contact.id },
    });
    return ok({ deleted: true }, 200, requestId);
  }
);
