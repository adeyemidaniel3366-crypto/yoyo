import { z } from "zod";
import { koboSchema, positiveKoboSchema, positiveQtySchema } from "./common";

const rawSaleItemSchema = z
  .object({
    productId: z.string().min(1),
    qty: positiveQtySchema,
    unitPriceKobo: positiveKoboSchema.optional(),
  })
  .strict();

const uiSaleLineSchema = z
  .object({
    productId: z.string().optional(),
    productCode: z.string().optional(),
    productName: z.string().optional(),
    qty: positiveQtySchema,
    unitPriceKobo: positiveKoboSchema.optional(),
    discountKobo: koboSchema.optional(),
  })
  .strict();

export const createSaleSchema = z
  .object({
    locationId: z.string().optional(),
    source: z.string().optional(),
    contactId: z.string().optional().nullable(),
    customerName: z.string().trim().max(150).optional().nullable(),
    walkInPhone: z.string().trim().max(30).optional().nullable(),
    items: z.array(rawSaleItemSchema).min(1).optional(),
    lines: z.array(uiSaleLineSchema).min(1).optional(),
    payments: z
      .array(
        z.object({
          method: z.string().trim().max(40),
          amountKobo: koboSchema,
        })
      )
      .optional(),
    discountKobo: koboSchema.default(0),
    paidKobo: koboSchema.optional(),
    paymentMethod: z.string().trim().max(40).optional(),
    fulfilment: z.string().trim().max(40).optional().nullable(),
    fulfilmentStatus: z.string().trim().max(40).optional().nullable(),
    remarks: z.string().trim().max(500).optional().nullable(),
    isParked: z.boolean().default(false),
    allowCreditOversell: z.boolean().default(false),
  })
  .refine((data) => (data.items && data.items.length > 0) || (data.lines && data.lines.length > 0), {
    message: "At least one item is required",
  });

export const voidSaleSchema = z
  .object({
    reason: z.string().trim().min(3, "Reason is required").max(300),
  })
  .strict();

export const returnSaleSchema = z
  .object({
    reason: z.string().trim().min(3).max(300),
    refundMethod: z.string().trim().default("CASH"),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            qty: positiveQtySchema,
            restock: z.boolean().default(true),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const openDrawerSchema = z
  .object({
    locationId: z.string().min(1),
    openingKobo: koboSchema,
  })
  .strict();

export const closeDrawerSchema = z
  .object({
    sessionId: z.string().min(1),
    countedKobo: koboSchema,
  })
  .strict();
