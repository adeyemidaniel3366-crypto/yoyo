import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { productIdBodySchema } from "@/lib/validators/galaxy";
import { getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const contact = await getOrCreateCustomerContact(ctx);
  const items = await prisma.wishlistItem.findMany({
    where: { contactId: contact.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(items, 200, requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, productIdBodySchema);
  const contact = await getOrCreateCustomerContact(ctx);
  const item = await prisma.wishlistItem.upsert({
    where: { contactId_productId: { contactId: contact.id, productId: body.productId } },
    update: {},
    create: { contactId: contact.id, productId: body.productId },
    include: { product: true },
  });
  return ok(item, 201, requestId);
});
