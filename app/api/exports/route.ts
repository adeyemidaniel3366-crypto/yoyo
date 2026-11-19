import { withErrorHandler, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { exportRequestSchema } from "@/lib/validators/platform";
import { generateExport } from "@/lib/services/exports";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const body = await parseBody(req, exportRequestSchema);
  const { buffer, contentType, filename } = await generateExport(ctx, body);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "x-request-id": requestId,
    },
  });
});
