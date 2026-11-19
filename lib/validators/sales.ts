import { z } from "zod";
import { koboSchema, positiveKoboSchema, positiveQtySchema } from "./common";

export const createSaleSchema = z
  .object({
    locationId: z.string().min(1, "Location is required"),
    contactId: z.string().optional().nullable(),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            qty: positiveQtySchema,
            unitPriceKobo: positiveKoboSchema.optional(),
          })
          .strict()
      )
      .min(1, "At least one item is required"),
    discountKobo: koboSchema.default(0),
    paidKobo: koboSchema.default(0),
    paymentMethod: z.string().trim().max(40).default("CASH"),
    fulfilment: z.string().trim().max(40).optional().nullable(),
    remarks: z.string().trim().max(500).optional().nullable(),
    isParked: z.boolean().default(false),
    allowCreditOversell: z.boolean().default(false),
  })
  .strict();

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
