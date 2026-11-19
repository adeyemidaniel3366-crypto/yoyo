import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { newsletterSchema } from "@/lib/validators/apartments";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.PUBLIC_FORM, getClientIp(req));
  const body = await parseBody(req, newsletterSchema);
  const sub = await prisma.newsletterSubscriber.upsert({
    where: { source_email: { source: ServiceSlug.APARTMENTS, email: body.email } },
    update: { isActive: true },
    create: { source: ServiceSlug.APARTMENTS, email: body.email },
  });
  return ok(sub, 201, requestId);
});
