import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { listQuerySchema, parseCsvServices } from "@/lib/validators/common";
import { getConsolidatedReport, getDashboardSummary } from "@/lib/services/reports";

export const GET = withErrorHandler<{ params: { report: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    const q = parseQuery(req, listQuerySchema);
    if (params.report === "consolidated" || params.report === "pnl") {
      requireRole(ctx, [Role.ACCOUNTANT, Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
      const data = await getConsolidatedReport(ctx, {
        services: parseCsvServices(q.service),
        from: q.from,
        to: q.to,
      });
      return ok(data, 200, requestId);
    }
    const data = await getDashboardSummary(ctx, {
      services: parseCsvServices(q.service),
      from: q.from,
      to: q.to,
    });
    return ok(data, 200, requestId);
  }
);
