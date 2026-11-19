import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { getSaleById } from "@/lib/services/sales";
import { SERVICE_CONFIG, PLATFORM_NAME } from "@/lib/constants";

export const GET = withErrorHandler<{ params: { id: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.BUILDERS);
    const sale = await getSaleById(ctx, ServiceSlug.BUILDERS, params.id);
    return ok(
      {
        header: {
          platformName: PLATFORM_NAME,
          serviceName: SERVICE_CONFIG[ServiceSlug.BUILDERS].name,
          printedAt: new Date().toISOString(),
        },
        sale,
      },
      200,
      requestId
    );
  }
);
