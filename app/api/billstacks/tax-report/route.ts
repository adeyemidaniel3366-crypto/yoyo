import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireRole, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { getTaxReport } from "@/lib/services/reports";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.BILLSTACKS);
  requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const q = parseQuery(req, listQuerySchema);
  const report = await getTaxReport(ctx, ServiceSlug.BILLSTACKS, q.from, q.to);
  return ok(report, 200, requestId);
});
