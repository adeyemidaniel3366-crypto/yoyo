import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { contactMessageSchema } from "@/lib/validators/apartments";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.PUBLIC_FORM, getClientIp(req));
  const body = await parseBody(req, contactMessageSchema);
  const msg = await prisma.contactMessage.create({
    data: { source: ServiceSlug.APARTMENTS, ...body },
  });
  return ok(msg, 201, requestId);
});
