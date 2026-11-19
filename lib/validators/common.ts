// ---------------------------------------------------------------------------
// Zino One — Common Zod Schemas (§7.2, §15)
// ---------------------------------------------------------------------------

import { z } from "zod";
import { ServiceSlug } from "@prisma/client";

export const serviceSlugSchema = z.nativeEnum(ServiceSlug);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  sort: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  service: z.string().trim().optional(),
  location: z.string().trim().optional(),
  status: z.string().trim().optional(),
  contactId: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  filter: z.string().trim().optional(),
  groupBy: z.string().trim().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export function parseCsvServices(raw?: string): ServiceSlug[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const valid = new Set(Object.values(ServiceSlug));
  const result: ServiceSlug[] = [];
  for (const p of parts) {
    if (valid.has(p as ServiceSlug)) {
      result.push(p as ServiceSlug);
    }
  }
  return result.length > 0 ? result : undefined;
}

export function parseCsvStrings(raw?: string): string[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

export const koboSchema = z.number().int().min(0, "Amount must be >= 0");
export const positiveKoboSchema = z.number().int().min(1, "Amount must be > 0");
export const positiveQtySchema = z.number().positive("Quantity must be greater than 0");
