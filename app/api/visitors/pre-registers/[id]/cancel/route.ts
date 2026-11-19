import { ServiceSlug, VisitStatus } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.VISITORS);
    const existing = await prisma.preRegister.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError("Pre-registration not found");

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.preRegister.update({
        where: { id: params.id },
        data: { status: VisitStatus.CANCELLED },
      });
      await logActivity(tx, {
        source: ServiceSlug.VISITORS,
        actorId: ctx.user.id,
        action: ActivityAction.PRE_REGISTER_CANCELLED,
        entityType: "PreRegister",
        entityId: p.id,
        summary: `Cancelled pre-registration for visitor pass ${p.id}`,
      });
      return p;
    });

    return ok(updated, 200, requestId);
  }
);
