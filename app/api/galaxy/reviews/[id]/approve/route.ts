import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { approveReviewSchema } from "@/lib/validators/galaxy";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";

export const PATCH = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.GALAXY);
    requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
    const body = await parseBody(req, approveReviewSchema).catch(() => ({ isApproved: true }));

    const review = await prisma.$transaction(async (tx) => {
      const saved = await tx.review.update({
        where: { id: params.id },
        data: { isApproved: body.isApproved },
      });
      await logActivity(tx, {
        source: ServiceSlug.GALAXY,
        actorId: ctx.user.id,
        action: ActivityAction.REVIEW_APPROVED,
        entityType: "Review",
        entityId: saved.id,
        summary: `${body.isApproved ? "Approved" : "Rejected"} product review ${saved.id}`,
      });
      return saved;
    });

    return ok(review, 200, requestId);
  }
);
