// Re-export singleton Prisma client for backwards compatibility with existing imports
import { prisma } from "./prisma";
export const db = prisma;
export { prisma };
