import { Role, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import {
  SESSION_COOKIE_NAME,
  createDbSession,
  verifyPassword,
} from "@/lib/auth";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity";
import { ActivityAction } from "@/lib/activity-actions";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.AUTH, getClientIp(req));

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const remember = Boolean(body?.remember);

  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  let dbUser: Awaited<ReturnType<typeof prisma.user.findFirst>> = null;
  let dbReachable = true;

  try {
    dbUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
  } catch {
    dbReachable = false;
  }

  // 1. Primary DB-backed authentication
  if (dbReachable && dbUser) {
    if (!dbUser.isActive) {
      throw new UnauthorizedError("Account is deactivated. Contact Super Admin.");
    }

    const valid = await verifyPassword(password, dbUser.password);
    if (!valid) {
      await logActivity(prisma, {
        source: dbUser.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
        actorId: dbUser.id,
        action: ActivityAction.AUTH_LOGIN_FAILED,
        entityType: "User",
        entityId: dbUser.id,
        summary: `Failed login attempt for ${dbUser.email}`,
      }).catch(() => {});
      throw new UnauthorizedError("Invalid email or password.");
    }

    const { rawToken, expires } = await createDbSession(dbUser.id, remember);

    await logActivity(prisma, {
      source: dbUser.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: dbUser.id,
      action: ActivityAction.AUTH_LOGIN,
      entityType: "User",
      entityId: dbUser.id,
      summary: `${dbUser.firstName} ${dbUser.lastName} signed in`,
    }).catch(() => {});

    const userData = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      roles: dbUser.roles,
      serviceAccess: dbUser.serviceAccess,
      locationIds: dbUser.locationIds,
    };

    const res = ok(userData, 200, requestId);
    res.cookies.set(SESSION_COOKIE_NAME, rawToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      expires,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  }

  // 2. Offline / Demo-mode fallback ONLY when DEMO_LOGINS=true and DB is down or unseeded
  if (process.env.DEMO_LOGINS === "true" && !dbReachable) {
    const isAdmin =
      email === "admin@zinoone.com" ||
      email === "admin@zinoone.local" ||
      email === "admin@zino.com";
    const validDemoPass = password === "Admin2026!" || password === "Demo1234!";

    if (isAdmin && validDemoPass) {
      const rawToken = `demo-admin-${Date.now()}`;
      const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
      const userData = {
        id: "demo-admin",
        email: "admin@zinoone.local",
        firstName: "Super",
        lastName: "Admin",
        roles: [Role.SUPER_ADMIN],
        serviceAccess: [
          ServiceSlug.BILLSTACKS,
          ServiceSlug.BUILDERS,
          ServiceSlug.SPARK,
          ServiceSlug.APARTMENTS,
          ServiceSlug.GALAXY,
          ServiceSlug.VISITORS,
        ],
        locationIds: [],
      };

      const res = ok(userData, 200, requestId);
      res.cookies.set(SESSION_COOKIE_NAME, rawToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        expires,
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }
  }

  throw new UnauthorizedError("Invalid email or password.");
});
