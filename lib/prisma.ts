// ---------------------------------------------------------------------------
// Zino One — Singleton PrismaClient (§3, §5.1)
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";
import { validateEnv } from "./env";

validateEnv();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type PrismaTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
export type DbClient = PrismaClient | PrismaTx;
