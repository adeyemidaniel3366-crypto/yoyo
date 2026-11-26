import { z } from "zod";
import { positiveKoboSchema } from "./common";

export const createRoomTypeSchema = z
  .object({
    slug: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1),
    basePriceKobo: positiveKoboSchema,
    taxPct: z.number().min(0).max(100).default(10),
    adults: z.number().int().min(1).max(20),
    children: z.number().int().min(0).max(20).default(0),
    checkIn: z.string().default("23:00"),
    checkOut: z.string().default("10:00"),
    cancellation: z.string().default("Free Cancellation"),
    images: z.array(z.string()).default([]),
    amenities: z.array(z.string()).default([]),
    facilities: z.array(z.string()).default([]),
    bedType: z.string().default("6x6"),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  })
  .strict();

export const updateRoomTypeSchema = createRoomTypeSchema.partial().strict();

export const createBookingSchema = z
  .object({
    roomTypeId: z.string().min(1),
    roomTypeSlug: z.string().optional().nullable(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "checkIn must be YYYY-MM-DD"),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "checkOut must be YYYY-MM-DD"),
    adults: z.number().int().min(1).max(20),
    children: z.number().int().min(0).max(20).default(0),
    rooms: z.number().int().min(1).max(10).default(1),
    guestName: z.string().trim().min(2).max(150),
    guestEmail: z.string().email().transform((s) => s.toLowerCase().trim()),
    guestPhone: z.string().trim().min(6).max(30),
    specialRequests: z.string().trim().max(1000).optional().nullable(),
    payNow: z.boolean().default(false),
    gateway: z.enum(["PAYSTACK", "FLUTTERWAVE"]).optional(),
  })
  .strict();

export const bookingConfirmSchema = z
  .object({
    roomId: z.string().optional().nullable(),
  })
  .strict();

export const bookingCheckInSchema = z
  .object({
    roomId: z.string().optional().nullable(),
  })
  .strict();

export const bookingCheckOutSchema = z
  .object({
    managerOverride: z.boolean().default(false),
    overrideReason: z.string().trim().max(300).optional(),
  })
  .strict();

export const bookingCancelSchema = z
  .object({
    reason: z.string().trim().min(3).max(300),
  })
  .strict();

export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    email: z.string().email().transform((s) => s.toLowerCase().trim()),
    subject: z.string().trim().min(2).max(200),
    message: z.string().trim().min(5).max(3000),
  })
  .strict();

export const newsletterSchema = z
  .object({
    email: z.string().email().transform((s) => s.toLowerCase().trim()),
  })
  .strict();
