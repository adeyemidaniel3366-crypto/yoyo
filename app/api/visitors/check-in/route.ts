import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { checkInTokenSchema, createVisitSchema } from "@/lib/validators/visitors";
import { checkInByToken, walkInCheckIn } from "@/lib/services/visitors";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const raw = await req.clone().json().catch(() => ({}));

  if (raw && typeof raw.token === "string") {
    // Kiosk check-in via single-use token (§9.6)
    await enforceRateLimit(RATE_LIMITS.PUBLIC_FORM, getClientIp(req));
    const body = await parseBody(req, checkInTokenSchema);
    const visit = await checkInByToken(body.token);
    return ok(visit, 200, requestId);
  }

  // Staff walk-in check-in at reception
  const user = await getSessionUser(req);
  if (!user) {
    await enforceRateLimit(RATE_LIMITS.PUBLIC_FORM, getClientIp(req));
  }
  const ctx = {
    user: user ?? {
      id: "KIOSK",
      email: "kiosk@zinoone.local",
      firstName: "Kiosk",
      lastName: "Terminal",
      roles: [Role.RECEPTION],
      serviceAccess: [ServiceSlug.VISITORS],
      locationIds: [],
      isActive: true,
    },
    requestId,
  };

  const body = await parseBody(req, createVisitSchema);
  const visit = await walkInCheckIn(ctx, body);
  return ok(visit, 201, requestId);
});
