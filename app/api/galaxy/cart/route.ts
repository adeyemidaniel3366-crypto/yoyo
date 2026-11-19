import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { cartAddSchema } from "@/lib/validators/galaxy";
import { getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const contact = await getOrCreateCustomerContact(ctx);
  const items = await prisma.cartItem.findMany({
    where: { contactId: contact.id },
    include: { product: true, variant: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(items, 200, requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, cartAddSchema);
  const contact = await getOrCreateCustomerContact(ctx);

  const existing = await prisma.cartItem.findFirst({
    where: {
      contactId: contact.id,
      productId: body.productId,
      variantId: body.variantId ?? null,
    },
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + body.qty },
        include: { product: true, variant: true },
      })
    : await prisma.cartItem.create({
        data: {
          contactId: contact.id,
          productId: body.productId,
          variantId: body.variantId ?? null,
          qty: body.qty,
        },
        include: { product: true, variant: true },
      });

  return ok(item, 201, requestId);
});
