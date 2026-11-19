import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createProductSchema } from "@/lib/validators/inventory";
import { createProduct, listProducts } from "@/lib/services/products";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listProducts(ServiceSlug.SPARK, {
    page: q.page,
    perPage: q.perPage,
    q: q.q,
    category: q.category,
    brand: q.brand,
    status: q.status,
  });
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createProductSchema);
  const prod = await createProduct(ctx, ServiceSlug.SPARK, body);
  return ok(prod, 201, requestId);
});
