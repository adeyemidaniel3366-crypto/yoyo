import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema, parseCsvStrings } from "@/lib/validators/common";
import { getDashboardSummary, getTaxReport } from "@/lib/services/reports";

export const GET = withErrorHandler<{ params: { report: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.SPARK);
    const q = parseQuery(req, listQuerySchema);
    if (params.report === "tax") {
      return ok(await getTaxReport(ctx, ServiceSlug.SPARK, q.from, q.to), 200, requestId);
    }
    const data = await getDashboardSummary(ctx, {
      services: [ServiceSlug.SPARK],
      locationIds: parseCsvStrings(q.location),
      from: q.from,
      to: q.to,
    });
    return ok(data, 200, requestId);
  }
);
