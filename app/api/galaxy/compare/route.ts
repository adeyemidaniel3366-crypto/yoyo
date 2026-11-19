import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { productIdBodySchema } from "@/lib/validators/galaxy";
import { addToCompare, getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const contact = await getOrCreateCustomerContact(ctx);
  const items = await prisma.compareItem.findMany({
    where: { contactId: contact.id },
    include: { product: true },
  });
  return ok(items, 200, requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, productIdBodySchema);
  const item = await addToCompare(ctx, body.productId);
  return ok(item, 201, requestId);
});

export const DELETE = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const contact = await getOrCreateCustomerContact(ctx);
  await prisma.compareItem.deleteMany({ where: { contactId: contact.id } });
  return ok({ cleared: true }, 200, requestId);
});
