import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { getProductBySlug } from "@/lib/services/products";

export const GET = withErrorHandler<{ params: { slug: string } }>(
  async (_req, { params }, requestId) => {
    const product = await getProductBySlug(ServiceSlug.GALAXY, params.slug);
    return ok(product, 200, requestId);
  }
);
