// ---------------------------------------------------------------------------
// Zino One — NextAuth v5 Configuration & Auth Guards (§6)
// Database-backed sessions with SHA-256 hashed 32-byte tokens.
// Credentials provider only. bcrypt (12 rounds).
// ---------------------------------------------------------------------------

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role, ServiceSlug } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { ActivityAction } from "./activity-actions";
import { logActivity } from "./services/activity";
import { logger } from "./logger";
import type { ServiceContext, SessionUser } from "./scope";
import { isSuperAdmin } from "./scope";

const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_SEC = 8 * 60 * 60; // 8 hours
const SESSION_REMEMBER_AGE_SEC = 30 * 24 * 60 * 60; // 30 days
const SESSION_UPDATE_AGE_SEC = 60 * 60; // 1 hour sliding window

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createDbSession(userId: string, remember = false): Promise<{
  rawToken: string;
  expires: Date;
}> {
  const rawToken = generateSessionToken();
  const hashed = hashSessionToken(rawToken);
  const ttlSec = remember ? SESSION_REMEMBER_AGE_SEC : SESSION_MAX_AGE_SEC;
  const expires = new Date(Date.now() + ttlSec * 1000);

  await prisma.session.create({
    data: {
      sessionToken: hashed,
      userId,
      expires,
      remember,
    },
  });

  return { rawToken, expires };
}

export async function revokeDbSession(rawToken: string): Promise<void> {
  const hashed = hashSessionToken(rawToken);
  await prisma.session.deleteMany({ where: { sessionToken: hashed } });
}

export async function revokeAllUserSessions(userId: string): Promise<number> {
  const res = await prisma.session.deleteMany({ where: { userId } });
  return res.count;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SEC,
    updateAge: SESSION_UPDATE_AGE_SEC,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });

        if (!user || !user.isActive) {
          logger.warn({ email }, "Login failed: user not found or inactive");
          return null;
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
          logger.warn({ email, userId: user.id }, "Login failed: invalid password");
          await logActivity(prisma, {
            source: user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
            actorId: user.id,
            action: ActivityAction.AUTH_LOGIN_FAILED,
            entityType: "User",
            entityId: user.id,
            summary: `Failed login attempt for ${user.email}`,
          }).catch(() => {});
          return null;
        }

        await logActivity(prisma, {
          source: user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
          actorId: user.id,
          action: ActivityAction.AUTH_LOGIN,
          entityType: "User",
          entityId: user.id,
          summary: `${user.firstName} ${user.lastName} signed in`,
        }).catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  jwt: {
    // Store opaque 32-byte random token in cookie, hashed SHA-256 in Prisma Session table (§6.1)
    async encode({ token }) {
      if (!token?.sub) return "";
      // Reuse existing session token if already attached
      if (typeof token.dbSessionToken === "string" && token.dbSessionToken.length > 0) {
        return token.dbSessionToken;
      }
      const remember = Boolean(token.remember);
      const { rawToken } = await createDbSession(token.sub, remember);
      return rawToken;
    },
    async decode({ token }) {
      if (!token) return null;
      const hashed = hashSessionToken(token);
      const session = await prisma.session.findUnique({
        where: { sessionToken: hashed },
        include: { user: true },
      });
      if (!session || !session.user || !session.user.isActive) return null;
      if (session.expires < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }
      // Sliding expiry update if older than updateAge
      const ttlMs = (session.remember ? SESSION_REMEMBER_AGE_SEC : SESSION_MAX_AGE_SEC) * 1000;
      const remaining = session.expires.getTime() - Date.now();
      if (ttlMs - remaining > SESSION_UPDATE_AGE_SEC * 1000) {
        await prisma.session
          .update({
            where: { id: session.id },
            data: { expires: new Date(Date.now() + ttlMs) },
          })
          .catch(() => {});
      }

      return {
        sub: session.user.id,
        email: session.user.email,
        name: `${session.user.firstName} ${session.user.lastName}`,
        dbSessionToken: token,
        roles: session.user.roles,
        serviceAccess: session.user.serviceAccess,
        locationIds: session.user.locationIds,
      };
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        (session.user as unknown as Record<string, unknown>).id = token.sub;
        (session.user as unknown as Record<string, unknown>).roles = token.roles ?? [];
        (session.user as unknown as Record<string, unknown>).serviceAccess =
          token.serviceAccess ?? [];
        (session.user as unknown as Record<string, unknown>).locationIds =
          token.locationIds ?? [];
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.dbSessionToken) {
        await revokeDbSession(String(message.token.dbSessionToken)).catch(() => {});
      }
      if ("token" in message && message.token?.sub) {
        await logActivity(prisma, {
          source: ServiceSlug.BILLSTACKS,
          actorId: String(message.token.sub),
          action: ActivityAction.AUTH_LOGOUT,
          entityType: "User",
          entityId: String(message.token.sub),
          summary: `User signed out`,
        }).catch(() => {});
      }
    },
  },
});

/**
 * Retrieve the currently authenticated user from the database session cookie
 * (or Authorization: Bearer <token> header for API/test clients).
 */
export async function getSessionUser(req?: Request): Promise<SessionUser | null> {
  let rawToken: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      rawToken = authHeader.slice(7).trim();
    }
    if (!rawToken) {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const match = cookieHeader.match(
        /(?:^|;\s*)(?:__Secure-)?authjs\.session-token=([^;]+)/
      );
      if (match) rawToken = decodeURIComponent(match[1]);
    }
  } else {
    try {
      const cookieStore = cookies();
      rawToken =
        cookieStore.get("__Secure-authjs.session-token")?.value ??
        cookieStore.get("authjs.session-token")?.value;
    } catch {
      // Outside Next request context
    }
  }

  if (!rawToken) return null;

  const hashed = hashSessionToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { sessionToken: hashed },
    include: { user: true },
  });

  if (!session || !session.user || !session.user.isActive) return null;
  if (session.expires < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    roles: u.roles,
    serviceAccess: u.serviceAccess,
    locationIds: u.locationIds,
    isActive: u.isActive,
  };
}

export async function requireAuth(req?: Request, requestId?: string): Promise<ServiceContext> {
  const user = await getSessionUser(req);
  if (!user) {
    throw new UnauthorizedError();
  }
  return { user, requestId };
}

export function requireRole(ctx: ServiceContext, allowedRoles: Role[]): void {
  if (isSuperAdmin(ctx.user)) return;
  const hasAny = allowedRoles.some((r) => ctx.user.roles.includes(r));
  if (!hasAny) {
    void logActivity(prisma, {
      source: ctx.user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.AUTH_DENIED,
      entityType: "RoleGuard",
      entityId: allowedRoles.join(","),
      summary: `${ctx.user.email} denied access (requires one of: ${allowedRoles.join(", ")})`,
    }).catch(() => {});
    throw new ForbiddenError();
  }
}

export async function requireService(ctx: ServiceContext, service: ServiceSlug): Promise<void> {
  if (isSuperAdmin(ctx.user)) return;
  if (!ctx.user.serviceAccess.includes(service)) {
    await logActivity(prisma, {
      source: ctx.user.serviceAccess[0] ?? service,
      actorId: ctx.user.id,
      action: ActivityAction.AUTH_DENIED,
      entityType: "ServiceGuard",
      entityId: service,
      summary: `${ctx.user.email} denied access to service ${service}`,
    }).catch(() => {});
    throw new ForbiddenError(`No access to service ${service}`);
  }
  const svc = await prisma.service.findUnique({ where: { slug: service } });
  if (svc && !svc.isEnabled) {
    throw new ForbiddenError(`Service ${service} is disabled`);
  }
}

export function requireLocation(ctx: ServiceContext, locationId: string): void {
  if (isSuperAdmin(ctx.user)) return;
  if (!ctx.user.locationIds.includes(locationId)) {
    void logActivity(prisma, {
      source: ctx.user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      locationId,
      actorId: ctx.user.id,
      action: ActivityAction.AUTH_DENIED,
      entityType: "LocationGuard",
      entityId: locationId,
      summary: `${ctx.user.email} denied access to location ${locationId}`,
    }).catch(() => {});
    throw new ForbiddenError(`No access to location ${locationId}`);
  }
}
