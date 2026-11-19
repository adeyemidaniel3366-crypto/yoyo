import { withErrorHandler, ok, parseBody } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { NotFoundError } from "@/lib/errors";
import { demoLoginSchema } from "@/lib/validators/auth";
import { createDbSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const DEMO_EMAILS: Record<"admin" | "employee" | "reception", string> = {
  admin: "admin@zinoone.local",
  employee: "employee@zinoone.local",
  reception: "reception@zinoone.local",
};

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  // Returns 404 when DEMO_LOGINS is off (§6.1)
  if (!getEnv().DEMO_LOGINS) {
    throw new NotFoundError("Demo login is disabled");
  }
  await enforceRateLimit(RATE_LIMITS.AUTH, getClientIp(req));
  const body = await parseBody(req, demoLoginSchema);
  const email = DEMO_EMAILS[body.role];

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new NotFoundError("Demo account not seeded");
  }

  const { rawToken, expires } = await createDbSession(user.id, false);
  const res = ok(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      serviceAccess: user.serviceAccess,
    },
    200,
    requestId
  );

  res.cookies.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
  return res;
});
