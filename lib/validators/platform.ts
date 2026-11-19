import { z } from "zod";
import { Role, ServiceSlug } from "@prisma/client";
import { passwordSchema } from "./common";

export const createLocationSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    type: z.string().trim().min(1).max(50),
    address: z.string().trim().max(300).optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    managerId: z.string().trim().optional().nullable(),
    services: z.array(z.nativeEnum(ServiceSlug)).min(1),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateLocationSchema = createLocationSchema.partial().strict();

export const createUserSchema = z
  .object({
    email: z.string().email().transform((s) => s.toLowerCase().trim()),
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    phone: z.string().trim().max(30).optional().nullable(),
    roles: z.array(z.nativeEnum(Role)).min(1),
    serviceAccess: z.array(z.nativeEnum(ServiceSlug)).default([]),
    locationIds: z.array(z.string()).default([]),
  })
  .strict();

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    phone: z.string().trim().max(30).optional().nullable(),
    avatar: z.string().trim().optional().nullable(),
    serviceAccess: z.array(z.nativeEnum(ServiceSlug)).optional(),
    locationIds: z.array(z.string()).optional(),
    notificationPrefs: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateUserRolesSchema = z
  .object({
    roles: z.array(z.nativeEnum(Role)).min(1),
    serviceAccess: z.array(z.nativeEnum(ServiceSlug)).optional(),
    locationIds: z.array(z.string()).optional(),
  })
  .strict();

export const updateSettingsSchema = z
  .object({
    settings: z.record(z.unknown()),
  })
  .strict();

export const exportRequestSchema = z
  .object({
    type: z.enum([
      "sales",
      "invoices",
      "stock-alert",
      "bookings",
      "orders",
      "visitors",
      "attendance",
      "activity",
      "contacts",
      "expenses",
    ]),
    format: z.enum(["csv", "xlsx", "pdf"]),
    filters: z
      .object({
        service: z.string().optional(),
        location: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        status: z.string().optional(),
        q: z.string().optional(),
      })
      .optional()
      .default({}),
  })
  .strict();
