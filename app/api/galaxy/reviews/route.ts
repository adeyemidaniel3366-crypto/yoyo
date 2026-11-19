import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validators/galaxy";
import { getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, createReviewSchema);
  const contact = await getOrCreateCustomerContact(ctx);

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: body.productId,
      order: { contactId: contact.id, status: "DELIVERED" },
    },
  });

  const review = await prisma.review.create({
    data: {
      productId: body.productId,
      contactId: contact.id,
      rating: body.rating,
      title: body.title ?? null,
      comment: body.comment,
      isVerifiedPurchase: Boolean(hasPurchased),
      isApproved: false,
    },
  });

  return ok(review, 201, requestId);
});
