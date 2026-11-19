import { Role } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { createLocationSchema } from "@/lib/validators/platform";
import { createLocation, listLocations } from "@/lib/services/platform";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  const rows = await listLocations(ctx);
  return ok(rows, 200, requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  requireRole(ctx, [Role.SUPER_ADMIN]);
  const body = await parseBody(req, createLocationSchema);
  const loc = await createLocation(ctx, body);
  return ok(loc, 201, requestId);
});
