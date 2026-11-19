import { z } from "zod";
import { koboSchema, positiveKoboSchema, positiveQtySchema } from "./common";

const invoiceItemSchema = z
  .object({
    productId: z.string().optional().nullable(),
    description: z.string().trim().min(1).max(300),
    qty: positiveQtySchema,
    unitPriceKobo: positiveKoboSchema,
    taxRatePct: z.number().min(0).max(100).optional(),
  })
  .strict();

export const createInvoiceSchema = z
  .object({
    contactId: z.string().min(1),
    items: z.array(invoiceItemSchema).min(1),
    discountKobo: koboSchema.default(0),
    dueDate: z.string().optional().nullable(),
  })
  .strict();

export const updateInvoiceSchema = z
  .object({
    items: z.array(invoiceItemSchema).min(1).optional(),
    discountKobo: koboSchema.optional(),
    dueDate: z.string().optional().nullable(),
  })
  .strict();

export const recordPaymentSchema = z
  .object({
    amountKobo: positiveKoboSchema,
    method: z.string().trim().min(1).max(40).default("TRANSFER"),
    reference: z.string().trim().max(120).optional().nullable(),
    note: z.string().trim().max(500).optional().nullable(),
  })
  .strict();

export const createPaymentLinkSchema = z
  .object({
    gateway: z.enum(["PAYSTACK", "FLUTTERWAVE"]).optional(),
    callbackUrl: z.string().url().optional(),
  })
  .strict();

export const createEstimateSchema = z
  .object({
    contactId: z.string().min(1),
    items: z.array(invoiceItemSchema).min(1),
    validUntil: z.string().optional().nullable(),
  })
  .strict();

export const createRecurringSchema = z
  .object({
    contactId: z.string().min(1),
    frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
    nextRunAt: z.string().min(1),
    template: z
      .object({
        items: z.array(invoiceItemSchema).min(1),
        discountKobo: koboSchema.default(0),
        dueDays: z.number().int().min(0).max(365).default(14),
        autoSend: z.boolean().default(false),
      })
      .strict(),
  })
  .strict();

export const createExpenseSchema = z
  .object({
    locationId: z.string().optional().nullable(),
    category: z.string().trim().min(1).max(100),
    amountKobo: positiveKoboSchema,
    paidTo: z.string().trim().max(150).optional().nullable(),
    receiptUrl: z.string().trim().max(500).optional().nullable(),
    note: z.string().trim().max(500).optional().nullable(),
    date: z.string().optional(),
  })
  .strict();

export const createPurchaseOrderSchema = z
  .object({
    contactId: z.string().min(1),
    expectedAt: z.string().optional().nullable(),
    note: z.string().trim().max(500).optional().nullable(),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            qty: positiveQtySchema,
            unitCostKobo: positiveKoboSchema,
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const receivePurchaseSchema = z
  .object({
    locationId: z.string().min(1),
    items: z
      .array(
        z
          .object({
            purchaseItemId: z.string().min(1),
            qty: positiveQtySchema,
          })
          .strict()
      )
      .min(1),
  })
  .strict();
