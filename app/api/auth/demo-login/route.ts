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

  let user: any = null;
  let rawToken = "demo-mock-session-" + Date.now();
  let expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    user = await prisma.user.findUnique({ where: { email } });
    if (user && user.isActive) {
      const sess = await createDbSession(user.id, false);
      rawToken = sess.rawToken;
      expires = sess.expires;
    }
  } catch {
    // Graceful offline fallback in development
  }

  if (!user || !user.isActive) {
    user = {
      id: `demo-${body.role}`,
      email,
      firstName: body.role === "admin" ? "Super" : body.role === "employee" ? "John" : "Reception",
      lastName: body.role === "admin" ? "Admin" : body.role === "employee" ? "Doe" : "Desk",
      roles: body.role === "admin" ? ["SUPER_ADMIN"] : body.role === "employee" ? ["EMPLOYEE"] : ["RECEPTION"],
      serviceAccess: ["BILLSTACKS", "BUILDERS", "SPARK", "APARTMENTS", "GALAXY", "VISITORS"],
    };
  }

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
    httpOnly: false, // accessible for dev
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
  return res;
});
