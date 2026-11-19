import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateSettingsSchema } from "@/lib/validators/platform";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/services/platform";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [Role.SUPER_ADMIN]);
  const data = await getPlatformSettings();
  return ok(data, 200, requestId);
});

export const PATCH = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [Role.SUPER_ADMIN]);
  const body = await parseBody(req, updateSettingsSchema);
  const data = await updatePlatformSettings(ctx, body.settings);
  return ok(data, 200, requestId);
});
