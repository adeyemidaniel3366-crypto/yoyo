import { z } from "zod";

export const createVisitSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    phone: z.string().trim().min(6).max(30),
    email: z.string().email().optional().nullable(),
    hostId: z.string().optional().nullable(),
    purpose: z.string().trim().max(300).optional().nullable(),
  })
  .strict();

export const checkInTokenSchema = z
  .object({
    token: z.string().min(8),
  })
  .strict();

export const createPreRegisterSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    phone: z.string().trim().min(6).max(30),
    email: z.string().email().optional().nullable(),
    hostId: z.string().optional().nullable(),
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "visitDate must be YYYY-MM-DD"),
    visitTime: z.string().trim().max(20).optional().nullable(),
    purpose: z.string().trim().max(300).optional().nullable(),
  })
  .strict();

export const createEmployeeSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    phone: z.string().trim().min(6).max(30).optional().nullable(),
    email: z.string().email().optional().nullable(),
    departmentId: z.string().optional().nullable(),
    designationId: z.string().optional().nullable(),
  })
  .strict();

export const createNameOnlySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
  })
  .strict();

export const decideLeaveSchema = z
  .object({
    decision: z.enum(["APPROVED", "REJECTED"]),
  })
  .strict();
