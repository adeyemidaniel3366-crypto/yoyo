import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.APARTMENTS);
  const rooms = await prisma.room.findMany({
    include: { roomType: true },
    orderBy: { number: "asc" },
  });
  return ok(rooms, 200, requestId);
});
