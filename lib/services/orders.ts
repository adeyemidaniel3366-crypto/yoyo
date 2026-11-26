// ---------------------------------------------------------------------------
// Zino One — Device Galaxy E-Commerce Service (§9.5)
// Cart, Wishlist, Compare (max 4), Coupons, Orders, Strict Status Machine, Reviews.
// ---------------------------------------------------------------------------

import {
  ContactType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ServiceSlug,
} from "@prisma/client";
import { prisma } from "../prisma";
import {
  BusinessError,
  ConflictError,
  InsufficientStockError,
  NotFoundError,
} from "../errors";
import { withSourceLabel, type ServiceContext } from "../scope";
import { addKobo, calcTaxKobo, formatNGN, mulKobo, subKobo } from "../money";
import { generateUniqueRef } from "./numbering";
import { adjustStock } from "./inventory";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";
import {
  generatePaymentReference,
  initializePayment,
  type PaymentGateway,
} from "../payments";
import { getEnv } from "../env";

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.REFUNDED],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * Pure helper for testing order state machine transitions (§9.5, §18).
 */
export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return ALLOWED_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Pure helper for coupon discount calculation (§9.5, §18).
 */
export function computeCouponDiscount(
  coupon: {
    discountPct?: number | Prisma.Decimal | null;
    discountKobo?: number | null;
    minSpendKobo?: number | null;
    maxUses?: number | null;
    usedCount: number;
    validFrom?: Date | null;
    validUntil?: Date | null;
    isActive: boolean;
  },
  subtotalKobo: number,
  now: Date = new Date()
): { valid: boolean; discountKobo: number; reason?: string } {
  if (!coupon.isActive) return { valid: false, discountKobo: 0, reason: "Coupon is inactive" };
  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, discountKobo: 0, reason: "Coupon is not yet valid" };
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    return { valid: false, discountKobo: 0, reason: "Coupon has expired" };
  }
  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discountKobo: 0, reason: "Coupon usage limit reached" };
  }
  if (coupon.minSpendKobo && subtotalKobo < coupon.minSpendKobo) {
    return {
      valid: false,
      discountKobo: 0,
      reason: `Minimum spend of ${formatNGN(coupon.minSpendKobo)} required`,
    };
  }

  let discountKobo = 0;
  if (coupon.discountPct) {
    discountKobo = calcTaxKobo(subtotalKobo, Number(coupon.discountPct));
  } else if (coupon.discountKobo) {
    discountKobo = coupon.discountKobo;
  }
  discountKobo = Math.min(discountKobo, subtotalKobo);
  return { valid: true, discountKobo };
}

export async function getOrCreateCustomerContact(
  ctx: ServiceContext,
  phone?: string
) {
  let contact = await prisma.contact.findFirst({
    where: {
      OR: [
        { email: { equals: ctx.user.email, mode: "insensitive" } },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });
  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        name: `${ctx.user.firstName} ${ctx.user.lastName}`,
        email: ctx.user.email,
        phone: phone ?? null,
        types: [ContactType.CUSTOMER],
        sources: [ServiceSlug.GALAXY],
      },
    });
  }
  return contact;
}

async function getGalaxyLocationId(): Promise<string> {
  const loc = await prisma.location.findFirst({
    where: { services: { has: ServiceSlug.GALAXY }, isActive: true },
  });
  if (!loc) throw new BusinessError("Galaxy Online location is not configured");
  return loc.id;
}

export async function validateCouponCode(code: string, subtotalKobo: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon) {
    throw new NotFoundError("Coupon code not found");
  }
  const result = computeCouponDiscount(coupon, subtotalKobo);
  if (!result.valid) {
    throw new BusinessError(result.reason ?? "Coupon is not valid");
  }
  return {
    couponId: coupon.id,
    code: coupon.code,
    discountKobo: result.discountKobo,
    discountDisplay: formatNGN(result.discountKobo),
  };
}

export async function syncCart(
  ctx: ServiceContext,
  localItems: Array<{ productId: string; variantId?: string | null; qty: number }>
) {
  const contact = await getOrCreateCustomerContact(ctx);
  const galaxyLocId = await getGalaxyLocationId();
  const dropped: Array<{ productId: string; reason: string }> = [];

  for (const item of localItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        stock: { where: { locationId: galaxyLocId } },
        variants: true,
      },
    });
    if (!product || product.status !== "ACTIVE") {
      dropped.push({ productId: item.productId, reason: "Product unavailable" });
      continue;
    }

    const available = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)?.stockQty ?? 0
      : Number(product.stock[0]?.qty ?? 0);

    if (available <= 0) {
      dropped.push({ productId: item.productId, reason: "Out of stock" });
      continue;
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        contactId: contact.id,
        productId: item.productId,
        variantId: item.variantId ?? null,
      },
    });

    const targetQty = Math.min(available, Math.max(item.qty, existing?.qty ?? 0));
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: targetQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          contactId: contact.id,
          productId: item.productId,
          variantId: item.variantId ?? null,
          qty: targetQty,
        },
      });
    }
  }

  const cart = await prisma.cartItem.findMany({
    where: { contactId: contact.id },
    include: { product: true, variant: true },
  });

  return { items: cart, dropped };
}

export async function addToCompare(ctx: ServiceContext, productId: string) {
  const contact = await getOrCreateCustomerContact(ctx);
  const count = await prisma.compareItem.count({ where: { contactId: contact.id } });
  if (count >= 4) {
    throw new ConflictError("Compare list is capped at 4 items");
  }
  return prisma.compareItem.upsert({
    where: { contactId_productId: { contactId: contact.id, productId } },
    update: {},
    create: { contactId: contact.id, productId },
    include: { product: true },
  });
}

export async function createOrder(
  ctx: ServiceContext,
  input: {
    shippingAddress: Record<string, unknown>;
    billingAddress?: Record<string, unknown>;
    customerEmail?: string | null;
    couponCode?: string | null;
    paymentMethod: "ONLINE" | "COD";
    gateway?: PaymentGateway;
    notes?: string | null;
    items?: Array<{
      productId: string;
      sku?: string;
      variantId?: string | null;
      qty: number;
    }>;
  }
) {
  const phoneStr =
    typeof input.shippingAddress?.phone === "string"
      ? input.shippingAddress.phone
      : undefined;
  const contact = await getOrCreateCustomerContact(ctx, phoneStr);
  const galaxyLocId = await getGalaxyLocationId();

  // Read shipping settings (defaults: ₦3,500 flat, free above ₦100,000)
  const [flatSetting, freeSetting] = await Promise.all([
    prisma.platformSetting.findUnique({ where: { key: "GALAXY_SHIPPING_FLAT_KOBO" } }),
    prisma.platformSetting.findUnique({ where: { key: "GALAXY_FREE_SHIPPING_KOBO" } }),
  ]);
  const flatShippingKobo = Number(flatSetting?.value ?? 350000);
  const freeThresholdKobo = Number(freeSetting?.value ?? 10000000);
  const defaultTaxPct = getEnv().DEFAULT_TAX_PCT;

  const order = await prisma.$transaction(async (tx) => {
    let cartItems = await tx.cartItem.findMany({
      where: { contactId: contact.id },
      include: { product: true, variant: true },
    });

    // If DB cart is empty and client submitted inline cart items (e.g. guest checkout from localStorage)
    if (cartItems.length === 0 && input.items && input.items.length > 0) {
      const resolvedItems: typeof cartItems = [];
      for (const reqItem of input.items) {
        const product = await tx.product.findFirst({
          where: {
            OR: [
              { id: reqItem.productId },
              ...(reqItem.sku ? [{ sku: reqItem.sku }] : []),
            ],
          },
        });
        if (!product) {
          throw new BusinessError(`Product ${reqItem.sku || reqItem.productId} not found`);
        }
        const variant = reqItem.variantId
          ? await tx.productVariant.findUnique({ where: { id: reqItem.variantId } })
          : null;
        resolvedItems.push({
          id: `inline_${product.id}`,
          contactId: contact.id,
          productId: product.id,
          variantId: variant?.id ?? null,
          qty: reqItem.qty,
          createdAt: new Date(),
          updatedAt: new Date(),
          product,
          variant,
        });
      }
      cartItems = resolvedItems;
    }

    if (cartItems.length === 0) {
      throw new BusinessError("Your cart is empty");
    }

    let subtotalKobo = 0;
    let taxKobo = 0;
    const orderItemsData: Array<{
      productId: string;
      variantId: string | null;
      productName: string;
      productSku: string;
      priceKobo: number;
      qty: number;
      totalKobo: number;
    }> = [];

    for (const ci of cartItems) {
      if (ci.product.status !== "ACTIVE") {
        throw new BusinessError(`Product ${ci.product.name} is no longer available`);
      }

      if (ci.variantId && ci.variant) {
        if (ci.variant.stockQty < ci.qty) {
          throw new InsufficientStockError(
            `${ci.product.name} (${ci.variant.name})`,
            ci.variant.stockQty,
            ci.qty
          );
        }
        await tx.productVariant.update({
          where: { id: ci.variant.id },
          data: { stockQty: { decrement: ci.qty } },
        });
      }

      const unitPrice = ci.variant ? ci.variant.priceKobo : ci.product.salePriceKobo ?? ci.product.priceKobo;
      const lineTotal = mulKobo(unitPrice, ci.qty, 1);
      const lineTax = calcTaxKobo(
        lineTotal,
        Number(ci.product.taxRatePct) || defaultTaxPct
      );
      subtotalKobo = addKobo(subtotalKobo, lineTotal);
      taxKobo = addKobo(taxKobo, lineTax);

      orderItemsData.push({
        productId: ci.productId,
        variantId: ci.variantId ?? null,
        productName: ci.product.name,
        productSku: ci.variant?.sku ?? ci.product.sku,
        priceKobo: unitPrice,
        qty: ci.qty,
        totalKobo: lineTotal,
      });
    }

    let discountKobo = 0;
    let couponId: string | null = null;
    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: input.couponCode.trim().toUpperCase() },
      });
      if (!coupon) throw new NotFoundError("Coupon not found");
      const check = computeCouponDiscount(coupon, subtotalKobo);
      if (!check.valid) throw new BusinessError(check.reason ?? "Invalid coupon");
      discountKobo = check.discountKobo;
      couponId = coupon.id;

      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const shippingKobo = subtotalKobo >= freeThresholdKobo ? 0 : flatShippingKobo;
    const totalKobo = addKobo(subKobo(subtotalKobo, discountKobo), taxKobo, shippingKobo);

    const orderNo = await generateUniqueRef("DG", async (candidate) => {
      const existing = await tx.order.findUnique({ where: { orderNo: candidate } });
      return Boolean(existing);
    });

    const created = await tx.order.create({
      data: {
        orderNo,
        source: ServiceSlug.GALAXY,
        contactId: contact.id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
        billingAddress: input.billingAddress
          ? (input.billingAddress as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        subtotalKobo,
        taxKobo,
        shippingKobo,
        discountKobo,
        totalKobo,
        couponId,
        notes: input.notes ?? null,
        items: { create: orderItemsData },
      },
      include: { items: true, contact: true },
    });

    // Decrement Galaxy Online stock via adjustStock
    for (const item of orderItemsData) {
      await adjustStock(tx, {
        productId: item.productId,
        locationId: galaxyLocId,
        qtyChange: -item.qty,
        reason: `ORDER:${orderNo}`,
        refType: "Order",
        refId: created.id,
        actorId: ctx.user.id,
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { contactId: contact.id } });

    await logActivity(tx, {
      source: ServiceSlug.GALAXY,
      locationId: galaxyLocId,
      actorId: ctx.user.id,
      action: ActivityAction.ORDER_PLACED,
      entityType: "Order",
      entityId: created.id,
      summary: `Order ${orderNo} placed by ${contact.name} (${formatNGN(totalKobo)})`,
      amountKobo: totalKobo,
    });

    return created;
  });

  if (order.contact.email) {
    const rendered = renderEmailTemplate("order-confirmation", ServiceSlug.GALAXY, {
      customerName: order.contact.name,
      orderNo: order.orderNo,
      totalDisplay: formatNGN(order.totalKobo),
    });
    void sendEmail({ to: order.contact.email, ...rendered });
  }

  let paymentInit: { authorizationUrl: string; reference: string; gateway: string } | undefined;
  if (input.paymentMethod === "ONLINE") {
    const reference = generatePaymentReference(ServiceSlug.GALAXY);
    paymentInit = await initializePayment(
      {
        amountKobo: order.totalKobo,
        email: order.contact.email ?? ctx.user.email,
        reference,
        metadata: { orderId: order.id, orderNo: order.orderNo, source: ServiceSlug.GALAXY },
      },
      input.gateway
    );

    await prisma.payment.create({
      data: {
        source: ServiceSlug.GALAXY,
        contactId: order.contactId,
        orderId: order.id,
        amountKobo: order.totalKobo,
        method: "ONLINE",
        reference,
        gateway: paymentInit.gateway,
        status: PaymentStatus.PENDING,
        receivedById: ctx.user.id,
        note: `Galaxy order ${order.orderNo}`,
      },
    });
  }

  return withSourceLabel({
    ...order,
    totalDisplay: formatNGN(order.totalKobo),
    ...(paymentInit ? { payment: paymentInit } : {}),
  });
}

export async function updateOrderStatus(
  ctx: ServiceContext,
  orderId: string,
  nextStatus: OrderStatus
) {
  const galaxyLocId = await getGalaxyLocationId();

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, contact: true },
    });
    if (!order) throw new NotFoundError("Order not found");

    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      throw new BusinessError(
        `Illegal order transition from ${order.status} to ${nextStatus}`
      );
    }

    const now = new Date();
    const data: Prisma.OrderUpdateInput = { status: nextStatus };
    if (nextStatus === OrderStatus.SHIPPED) data.shippedAt = now;
    if (nextStatus === OrderStatus.DELIVERED) data.deliveredAt = now;

    // Return stock on cancellation (§9.5)
    if (nextStatus === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await adjustStock(tx, {
          productId: item.productId,
          locationId: galaxyLocId,
          qtyChange: item.qty,
          reason: `ORDER_CANCELLED:${order.orderNo}`,
          refType: "Order",
          refId: order.id,
          actorId: ctx.user.id,
        });
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { increment: item.qty } },
          });
        }
      }
    }

    const saved = await tx.order.update({
      where: { id: order.id },
      data,
      include: { contact: true, items: true },
    });

    const actionMap: Record<OrderStatus, keyof typeof ActivityAction> = {
      PENDING: "ORDER_PLACED",
      CONFIRMED: "ORDER_CONFIRMED",
      PROCESSING: "ORDER_PROCESSING",
      SHIPPED: "ORDER_SHIPPED",
      DELIVERED: "ORDER_DELIVERED",
      CANCELLED: "ORDER_CANCELLED",
      REFUNDED: "ORDER_REFUNDED",
    };

    await logActivity(tx, {
      source: ServiceSlug.GALAXY,
      locationId: galaxyLocId,
      actorId: ctx.user.id,
      action: ActivityAction[actionMap[nextStatus]],
      entityType: "Order",
      entityId: order.id,
      summary: `Order ${order.orderNo} status changed to ${nextStatus}`,
    });

    return saved;
  });

  if (updated.contact.email) {
    if (nextStatus === OrderStatus.SHIPPED) {
      const rendered = renderEmailTemplate("order-shipped", ServiceSlug.GALAXY, {
        customerName: updated.contact.name,
        orderNo: updated.orderNo,
      });
      void sendEmail({ to: updated.contact.email, ...rendered });
    } else if (nextStatus === OrderStatus.DELIVERED) {
      const rendered = renderEmailTemplate("order-delivered", ServiceSlug.GALAXY, {
        customerName: updated.contact.name,
        orderNo: updated.orderNo,
      });
      void sendEmail({ to: updated.contact.email, ...rendered });
    }
  }

  return withSourceLabel({ ...updated, totalDisplay: formatNGN(updated.totalKobo) });
}
