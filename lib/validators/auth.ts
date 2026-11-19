import { z } from "zod";
import { passwordSchema } from "./common";

export const registerSchema = z
  .object({
    email: z.string().email("Valid email required").transform((s) => s.toLowerCase().trim()),
    password: passwordSchema,
    firstName: z.string().trim().min(1, "First name required").max(80),
    lastName: z.string().trim().min(1, "Last name required").max(80),
    phone: z.string().trim().max(30).optional(),
  })
  .strict();

export const requestPasswordResetSchema = z
  .object({
    email: z.string().email().transform((s) => s.toLowerCase().trim()),
  })
  .strict();

export const confirmPasswordResetSchema = z
  .object({
    token: z.string().min(10),
    newPassword: passwordSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
  })
  .strict();

export const demoLoginSchema = z
  .object({
    role: z.enum(["admin", "employee", "reception"]),
  })
  .strict();
