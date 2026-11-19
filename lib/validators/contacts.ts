import { z } from "zod";
import { ContactType, ServiceSlug } from "@prisma/client";

export const createContactSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(150),
    phone: z.string().trim().max(30).optional().nullable(),
    email: z
      .string()
      .trim()
      .email("Invalid email")
      .transform((s) => s.toLowerCase())
      .optional()
      .nullable(),
    address: z.string().trim().max(300).optional().nullable(),
    types: z.array(z.nativeEnum(ContactType)).min(1).default([ContactType.CUSTOMER]),
    service: z.nativeEnum(ServiceSlug).optional(),
    locationId: z.string().trim().optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
  })
  .strict();

export const updateContactSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    phone: z.string().trim().max(30).optional().nullable(),
    email: z
      .string()
      .trim()
      .email()
      .transform((s) => s.toLowerCase())
      .optional()
      .nullable(),
    address: z.string().trim().max(300).optional().nullable(),
    types: z.array(z.nativeEnum(ContactType)).min(1).optional(),
    locationId: z.string().trim().optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
  })
  .strict();
