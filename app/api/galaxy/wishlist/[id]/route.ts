import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";

export const DELETE = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const contact = await getOrCreateCustomerContact(ctx);
    await prisma.wishlistItem.deleteMany({
      where: { id: params.id, contactId: contact.id },
    });
    return ok({ deleted: true }, 200, requestId);
  }
);
