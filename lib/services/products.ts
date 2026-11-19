// ---------------------------------------------------------------------------
// Zino One — Products CRUD Service (Spark, Builders, Galaxy)
// ---------------------------------------------------------------------------

import { Prisma, ProductStatus, ServiceSlug } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError } from "../errors";
import { withSourceLabel, withSourceLabels, type ServiceContext } from "../scope";
import { formatNGN } from "../money";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listProducts(
  source: ServiceSlug,
  params: {
    page: number;
    perPage: number;
    q?: string;
    category?: string;
    brand?: string;
    status?: string;
    publicOnly?: boolean;
  }
) {
  const where: Prisma.ProductWhereInput = {
    source,
    ...(params.publicOnly
      ? { status: ProductStatus.ACTIVE }
      : params.status
        ? { status: params.status as ProductStatus }
        : {}),
    ...(params.category
      ? { category: { slug: params.category } }
      : {}),
    ...(params.brand
      ? { brand: { slug: params.brand } }
      : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { sku: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        stock: { include: { location: { select: { id: true, name: true } } } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
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

  return { rows: enriched, total };
}

export async function getProductBySlug(source: ServiceSlug, slug: string) {
  const product = await prisma.product.findFirst({
    where: { source, slug, status: ProductStatus.ACTIVE },
    include: {
      category: true,
      brand: true,
      variants: { where: { isActive: true } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
      stock: { include: { location: { select: { id: true, name: true } } } },
    },
  });
  if (!product) throw new NotFoundError("Product not found");
  return withSourceLabel({
    ...product,
    priceDisplay: formatNGN(product.priceKobo),
  });
}

export async function createProduct(
  ctx: ServiceContext,
  source: ServiceSlug,
  input: {
    sku: string;
    slug?: string;
    name: string;
    description?: string | null;
    categoryId?: string | null;
    brandId?: string | null;
    unit: string;
    costKobo: number;
    priceKobo: number;
    salePriceKobo?: number | null;
    saleStart?: string | null;
    saleEnd?: string | null;
    taxRatePct: number;
    lowStockAt: number;
    images: string[];
    specifications?: Record<string, unknown> | null;
    status: ProductStatus;
    isFeatured: boolean;
    isNew: boolean;
  }
) {
  const slug = input.slug || `${slugify(input.name)}-${slugify(input.sku)}`;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        sku: input.sku,
        slug,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        brandId: input.brandId ?? null,
        source,
        unit: input.unit,
        costKobo: input.costKobo,
        priceKobo: input.priceKobo,
        salePriceKobo: input.salePriceKobo ?? null,
        saleStart: input.saleStart ? new Date(input.saleStart) : null,
        saleEnd: input.saleEnd ? new Date(input.saleEnd) : null,
        taxRatePct: new Prisma.Decimal(input.taxRatePct),
        lowStockAt: input.lowStockAt,
        images: input.images,
        specifications: input.specifications
          ? (input.specifications as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: input.status,
        isFeatured: input.isFeatured,
        isNew: input.isNew,
      },
    });

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.PRODUCT_CREATED,
      entityType: "Product",
      entityId: created.id,
      summary: `Created product ${created.name} (${created.sku}) at ${formatNGN(created.priceKobo)}`,
      amountKobo: created.priceKobo,
    });

    return created;
  });

  return withSourceLabel({ ...product, priceDisplay: formatNGN(product.priceKobo) });
}

export async function updateProduct(
  ctx: ServiceContext,
  source: ServiceSlug,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.source !== source) {
    throw new NotFoundError("Product not found");
  }

  // Strip immutable source if somehow passed
  const { source: _ignored, ...safeData } = input;
  void _ignored;

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.product.update({
      where: { id },
      data: safeData as Prisma.ProductUpdateInput,
    });

    await logActivity(tx, {
      source,
      actorId: ctx.user.id,
      action: ActivityAction.PRODUCT_UPDATED,
      entityType: "Product",
      entityId: id,
      summary: `Updated product ${saved.name} (${saved.sku})`,
    });

    return saved;
  });

  return withSourceLabel({ ...updated, priceDisplay: formatNGN(updated.priceKobo) });
}
