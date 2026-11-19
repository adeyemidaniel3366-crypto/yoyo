import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (_req, _ctx, requestId) => {
  const rows = await prisma.fAQ.findMany({
    where: { source: ServiceSlug.APARTMENTS, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return ok(rows, 200, requestId);
});
