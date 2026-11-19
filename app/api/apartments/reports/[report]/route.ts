import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseQuery } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { getConsolidatedReport } from "@/lib/services/reports";

export const GET = withErrorHandler<{ params: { report: string } }>(
  async (req, _ctx, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.APARTMENTS);
    const q = parseQuery(req, listQuerySchema);
    const data = await getConsolidatedReport(ctx, {
      services: [ServiceSlug.APARTMENTS],
      from: q.from,
      to: q.to,
    });
    return ok(data, 200, requestId);
  }
);
