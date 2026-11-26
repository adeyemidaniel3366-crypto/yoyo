import { Prisma, ProductStatus, Role, ServiceSlug } from "@prisma/client";
import {
  withErrorHandler,
  ok,
  okList,
  buildPaginationMeta,
  parseQuery,
} from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getEffectiveServices, withSourceLabels } from "@/lib/scope";
import { formatNGN } from "@/lib/money";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";
import { listQuerySchema, parseCsvServices } from "@/lib/validators/common";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const q = parseQuery(req, listQuerySchema);
  const allowed = getEffectiveServices(ctx.user, parseCsvServices(q.service));

  const where: Prisma.ProductWhereInput = {
    source: { in: allowed },
    status: { not: ProductStatus.ARCHIVED },
    ...(q.q
      ? {
          OR: [
            { name: { contains: q.q, mode: "insensitive" } },
            { sku: { contains: q.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        stock: { include: { location: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = await withSourceLabels(
    rows.map((p) => ({
      ...p,
      priceDisplay: formatNGN(p.priceKobo),
      costDisplay: formatNGN(p.costKobo),
      totalStock: p.stock.reduce((acc, s) => acc + Number(s.qty), 0),
    }))
  );

  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    throw new ValidationError("Product name is required");
  }

  const source = (body.source as ServiceSlug) || ServiceSlug.SPARK;
  if (!Object.values(ServiceSlug).includes(source)) {
    throw new ValidationError("Invalid service source");
  }

  await requireService(ctx, source);
  requireRole(ctx, [
    Role.SUPER_ADMIN,
    Role.SERVICE_MANAGER,
    Role.STOREKEEPER,
    Role.EMPLOYEE,
  ]);

  const sku = String(body.sku || `SKU-${Date.now()}`).trim();
  const name = body.name.trim();
  const slug = `${slugify(name)}-${slugify(sku)}`.slice(0, 120);
  const priceKobo = Math.max(0, Math.trunc(Number(body.priceKobo ?? 0)));
  const costKobo = Math.max(
    0,
    Math.trunc(Number(body.costKobo ?? Math.round(priceKobo * 0.75)))
  );
  const images: string[] = Array.isArray(body.images)
    ? body.images.filter((i: unknown) => typeof i === "string" && i.trim())
    : typeof body.imageUrl === "string" && body.imageUrl.trim()
    ? [body.imageUrl.trim()]
    : [];

  const statusValue = Object.values(ProductStatus).includes(body.status)
    ? (body.status as ProductStatus)
    : ProductStatus.ACTIVE;

  const existing = await prisma.product.findFirst({
    where: {
      OR: [...(body.id ? [{ id: String(body.id) }] : []), { sku }],
    },
  });

  const saved = await prisma.$transaction(async (tx) => {
    const product = existing
      ? await tx.product.update({
          where: { id: existing.id },
          data: {
            name,
            description: body.description ?? body.label ?? existing.description,
            source,
            priceKobo,
            costKobo,
            lowStockAt:
              typeof body.lowStockAt === "number"
                ? body.lowStockAt
                : existing.lowStockAt,
            images,
            status: statusValue,
            isFeatured:
              typeof body.isFeatured === "boolean"
                ? body.isFeatured
                : existing.isFeatured,
            isNew: typeof body.isNew === "boolean" ? body.isNew : existing.isNew,
          },
        })
      : await tx.product.create({
          data: {
            sku,
            slug,
            name,
            description: body.description ?? body.label ?? null,
            source,
            unit: String(body.unit || "unit"),
            costKobo,
            priceKobo,
            lowStockAt: typeof body.lowStockAt === "number" ? body.lowStockAt : 5,
            images,
            status: statusValue,
            isFeatured: Boolean(body.isFeatured ?? true),
            isNew: Boolean(body.isNew ?? false),
          },
        });

    if (typeof body.totalStock === "number" && body.totalStock >= 0) {
      const loc = await tx.location.findFirst({
        where: { isActive: true, services: { has: source } },
      });
      if (loc) {
        await tx.stockLevel.upsert({
          where: {
            productId_locationId: { productId: product.id, locationId: loc.id },
          },
          update: { qty: new Prisma.Decimal(body.totalStock) },
          create: {
            productId: product.id,
            locationId: loc.id,
            qty: new Prisma.Decimal(body.totalStock),
          },
        });
      }
    }

    await logActivity(tx, {
      source,
      actorId: ctx.user.id.startsWith("demo-") ? null : ctx.user.id,
      action: existing
        ? ActivityAction.PRODUCT_UPDATED
        : ActivityAction.PRODUCT_CREATED,
      entityType: "Product",
      entityId: product.id,
      summary: `${existing ? "Updated" : "Created"} product ${product.name} (${product.sku})`,
      amountKobo: product.priceKobo,
    });

    return product;
  });

  return ok(
    { ...saved, priceDisplay: formatNGN(saved.priceKobo) },
    existing ? 200 : 201,
    requestId
  );
});
