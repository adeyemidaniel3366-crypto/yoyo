import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const cartAddSchema = z
  .object({
    productId: z.string().min(1),
    variantId: z.string().optional().nullable(),
    qty: z.number().int().min(1).max(99).default(1),
  })
  .strict();

export const cartUpdateSchema = z
  .object({
    qty: z.number().int().min(1).max(99),
  })
  .strict();

export const cartSyncSchema = z
  .object({
    items: z.array(
      z
        .object({
          productId: z.string().min(1),
          variantId: z.string().optional().nullable(),
          qty: z.number().int().min(1).max(99),
        })
        .strict()
    ),
  })
  .strict();

export const productIdBodySchema = z
  .object({
    productId: z.string().min(1),
  })
  .strict();

const addressSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150),
    phone: z.string().trim().min(6).max(30),
    line1: z.string().trim().min(3).max(250),
    line2: z.string().trim().max(250).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    country: z.string().trim().default("Nigeria"),
  })
  .strict();

export const createOrderSchema = z
  .object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    couponCode: z.string().trim().max(40).optional().nullable(),
    paymentMethod: z.enum(["ONLINE", "COD"]).default("ONLINE"),
    gateway: z.enum(["PAYSTACK", "FLUTTERWAVE"]).optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.nativeEnum(OrderStatus),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const createReviewSchema = z
  .object({
    productId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(150).optional().nullable(),
    comment: z.string().trim().min(5).max(2000),
  })
  .strict();

export const approveReviewSchema = z
  .object({
    isApproved: z.boolean().default(true),
  })
  .strict();

export const validateCouponSchema = z
  .object({
    code: z.string().trim().min(1).max(40),
    subtotalKobo: z.number().int().min(0),
  })
  .strict();
