import { Prisma, Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { createRoomTypeSchema } from "@/lib/validators/apartments";
import { prisma } from "@/lib/prisma";
import { formatNGN } from "@/lib/money";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const GET = withErrorHandler(async (_req, _ctx, requestId) => {
  const rows = await prisma.roomType.findMany({
    where: { isActive: true },
    include: { _count: { select: { rooms: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return ok(
    rows.map((r) => ({ ...r, basePriceDisplay: formatNGN(r.basePriceKobo) })),
    200,
    requestId
  );
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.APARTMENTS);
  requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const body = await parseBody(req, createRoomTypeSchema);

  const created = await prisma.$transaction(async (tx) => {
    const rt = await tx.roomType.create({
      data: {
        ...body,
        taxPct: new Prisma.Decimal(body.taxPct),
      },
    });
    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: ctx.user.id,
      action: ActivityAction.ROOM_TYPE_CREATED,
      entityType: "RoomType",
      entityId: rt.id,
      summary: `Created room type ${rt.name} (${formatNGN(rt.basePriceKobo)}/night)`,
      amountKobo: rt.basePriceKobo,
    });
    return rt;
  });

  return ok({ ...created, basePriceDisplay: formatNGN(created.basePriceKobo) }, 201, requestId);
});
