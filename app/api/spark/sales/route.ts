import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery, parseSort, withIdempotency, hashPayload } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema, parseCsvStrings } from "@/lib/validators/common";
import { createSaleSchema } from "@/lib/validators/sales";
import { createSale, listSales } from "@/lib/services/sales";
import { lagosEndOfDayUTC, lagosStartOfDayUTC } from "@/lib/dates";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  const q = parseQuery(req, listQuerySchema);
  const { rows, total } = await listSales(ctx, ServiceSlug.SPARK, {
    page: q.page,
    perPage: q.perPage,
    q: q.q,
    status: q.status,
    locationIds: parseCsvStrings(q.location),
    from: q.from ? lagosStartOfDayUTC(q.from) : undefined,
    to: q.to ? lagosEndOfDayUTC(q.to) : undefined,
    orderBy: parseSort(q.sort, { createdAt: "createdAt", totalKobo: "totalKobo" }),
  });
  return okList(rows, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.SPARK);
  requireRole(ctx, [Role.CASHIER, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createSaleSchema);

  const result = await withIdempotency(req, hashPayload(body), async () => {
    const sale = await createSale(ctx, ServiceSlug.SPARK, body);
    return { status: 201, data: sale };
  });

  return ok(result.data, result.status, requestId);
});
