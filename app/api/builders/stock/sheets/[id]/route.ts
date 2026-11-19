import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { withSourceLabel } from "@/lib/scope";

export const GET = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BUILDERS);
    const sheet = await prisma.stockSheet.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true }, orderBy: { itemNo: "asc" } } },
    });
    if (!sheet || sheet.source !== ServiceSlug.BUILDERS) throw new NotFoundError("Stock sheet not found");
    return ok(await withSourceLabel(sheet), 200, requestId);
  }
);
