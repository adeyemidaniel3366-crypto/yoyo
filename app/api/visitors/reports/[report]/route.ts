import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { getVisitorReport } from "@/lib/services/reports";

export const GET = withErrorHandler<{ params: { report: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.VISITORS);
    const q = parseQuery(req, listQuerySchema);
    const report = await getVisitorReport(q.from, q.to);
    return ok(report, 200, requestId);
  }
);
