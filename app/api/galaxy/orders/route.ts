import { OrderStatus, Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery, withIdempotency, hashPayload } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createOrderSchema } from "@/lib/validators/galaxy";
import { createOrder, getOrCreateCustomerContact } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin, withSourceLabels } from "@/lib/scope";
import { formatNGN } from "@/lib/money";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const isStaff =
    isSuperAdmin(ctx.user) ||
    (ctx.user.serviceAccess.includes(ServiceSlug.GALAXY) &&
      ctx.user.roles.some((r) => r !== Role.CUSTOMER));

  let contactFilter: { contactId?: string } = {};
  if (!isStaff) {
    const contact = await getOrCreateCustomerContact(ctx);
    contactFilter = { contactId: contact.id };
  }

  const where = {
    source: ServiceSlug.GALAXY,
    ...contactFilter,
    ...(q.status ? { status: q.status as OrderStatus } : {}),
    ...(q.q
      ? {
          OR: [
            { orderNo: { contains: q.q, mode: "insensitive" as const } },
            { contact: { name: { contains: q.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { contact: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.order.count({ where }),
  ]);

  const enriched = await withSourceLabels(
    rows.map((o) => ({ ...o, totalDisplay: formatNGN(o.totalKobo) }))
  );
  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, createOrderSchema);

  const result = await withIdempotency(req, hashPayload(body), async () => {
    const order = await createOrder(ctx, body);
    return { status: 201, data: order };
  });

  return ok(result.data, result.status, requestId);
});
