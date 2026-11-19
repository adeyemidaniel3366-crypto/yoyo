import { Prisma, Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { updateRoomTypeSchema } from "@/lib/validators/apartments";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { formatNGN } from "@/lib/money";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const GET = withErrorHandler<{ params: { slug: string } }>(
  async (_req, { params }, requestId) => {
    const rt = await prisma.roomType.findFirst({
      where: { OR: [{ slug: params.slug }, { id: params.slug }], isActive: true },
      include: { rooms: true },
    });
    if (!rt) throw new NotFoundError("Room type not found");
    return ok({ ...rt, basePriceDisplay: formatNGN(rt.basePriceKobo) }, 200, requestId);
  }
);

export const PATCH = withErrorHandler<{ params: { slug: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.APARTMENTS);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, updateRoomTypeSchema);

    const existing = await prisma.roomType.findFirst({
      where: { OR: [{ id: params.slug }, { slug: params.slug }] },
    });
    if (!existing) throw new NotFoundError("Room type not found");

    const updated = await prisma.$transaction(async (tx) => {
      const rt = await tx.roomType.update({
        where: { id: existing.id },
        data: {
          ...body,
          ...(body.taxPct !== undefined ? { taxPct: new Prisma.Decimal(body.taxPct) } : {}),
        },
      });
      await logActivity(tx, {
        source: ServiceSlug.APARTMENTS,
        actorId: ctx.user.id,
        action: ActivityAction.ROOM_TYPE_UPDATED,
        entityType: "RoomType",
        entityId: rt.id,
        summary: `Updated room type ${rt.name}`,
      });
      return rt;
    });

    return ok({ ...updated, basePriceDisplay: formatNGN(updated.basePriceKobo) }, 200, requestId);
  }
);
