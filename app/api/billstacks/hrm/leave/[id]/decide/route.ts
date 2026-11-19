import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { decideLeaveSchema } from "@/lib/validators/visitors";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const POST = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BILLSTACKS);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, decideLeaveSchema);

    const updated = await prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.update({
        where: { id: params.id },
        data: { status: body.decision, decidedById: ctx.user.id },
      });
      await logActivity(tx, {
        source: ServiceSlug.BILLSTACKS,
        actorId: ctx.user.id,
        action: ActivityAction.LEAVE_DECIDED,
        entityType: "LeaveRequest",
        entityId: leave.id,
        summary: `Leave request ${leave.id} marked ${body.decision}`,
      });
      return leave;
    });

    return ok(updated, 200, requestId);
  }
);
