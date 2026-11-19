import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { importContactsCsv } from "@/lib/services/imports";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [Role.SERVICE_MANAGER, Role.SUPER_ADMIN]);
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new ValidationError("CSV file is required");
  }
  const csvText = await file.text();
  const source = ctx.user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS;
  const result = await importContactsCsv(ctx, source, csvText);
  return ok(result, 200, requestId);
});
