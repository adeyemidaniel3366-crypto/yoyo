import { z } from "zod";
import { ProductStatus } from "@prisma/client";
import { koboSchema, positiveKoboSchema, positiveQtySchema } from "./common";

export const createProductSchema = z
  .object({
    sku: z.string().trim().min(1).max(80),
    slug: z.string().trim().min(1).max(150).optional(),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    brandId: z.string().optional().nullable(),
    unit: z.string().trim().min(1).max(30).default("pcs"),
    costKobo: koboSchema.default(0),
    priceKobo: positiveKoboSchema,
    salePriceKobo: positiveKoboSchema.optional().nullable(),
    saleStart: z.string().optional().nullable(),
    saleEnd: z.string().optional().nullable(),
    taxRatePct: z.number().min(0).max(100).default(0),
    lowStockAt: z.number().int().min(0).default(5),
    images: z.array(z.string()).default([]),
    specifications: z.record(z.unknown()).optional().nullable(),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export const createTransferSchema = z
  .object({
    fromId: z.string().min(1),
    toId: z.string().min(1),
    note: z.string().trim().max(500).optional().nullable(),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            qty: positiveQtySchema,
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const createAdjustmentSchema = z
  .object({
    locationId: z.string().min(1),
    reason: z.string().trim().min(2).max(120),
    note: z.string().trim().max(500).optional().nullable(),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            qtyChange: z.number().refine((v) => v !== 0, "Quantity change cannot be 0"),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const stockInSchema = z
  .object({
    locationId: z.string().min(1),
    supplier: z.string().trim().max(150).optional(),
    invoiceNo: z.string().trim().max(80).optional(),
    note: z.string().trim().max(500).optional(),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            qty: positiveQtySchema,
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const stockCountSchema = z
  .object({
    locationId: z.string().min(1),
    date: z.string().optional(),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            countedQty: z.number().min(0),
          })
          .strict()
      )
      .min(1),
  })
  .strict();
