import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, okList, buildPaginationMeta, parseQuery } from "@/lib/api";
import { listQuerySchema } from "@/lib/validators/common";
import { listProducts } from "@/lib/services/products";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listProducts(ServiceSlug.GALAXY, {
    page: q.page,
    perPage: q.perPage,
    q: q.q,
    category: q.category,
    brand: q.brand,
    publicOnly: true,
  });
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});
