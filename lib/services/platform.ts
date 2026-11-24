// ---------------------------------------------------------------------------
// Zino One — Platform Services (Contacts, Locations, Users, Notifications, Settings, Health)
// ---------------------------------------------------------------------------

import { ContactType, Prisma, Role, ServiceSlug } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../prisma";
import {
  BusinessError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors";
import {
  getEffectiveServices,
  isSuperAdmin,
  withSourceLabels,
  type ServiceContext,
} from "../scope";
import {
  hashPassword,
  revokeAllUserSessions,
  verifyPassword,
} from "../auth";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";
import { getEnv } from "../env";

export async function checkHealth() {
  try {
    const checkPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB health check timeout")), 1500)
    );
    await Promise.race([checkPromise, timeoutPromise]);
    return { ok: true, db: "up", time: new Date().toISOString() };
  } catch (err) {
    return {
      ok: false,
      db: "down",
      error: err instanceof Error ? err.message : "Database connection failed",
      time: new Date().toISOString(),
    };
  }
}

// ---------- Contacts ----------

export async function listContacts(
  ctx: ServiceContext,
  params: {
    page: number;
    perPage: number;
    q?: string;
    services?: ServiceSlug[];
    type?: string;
  }
) {
  const allowed = getEffectiveServices(ctx.user, params.services);
  const where: Prisma.ContactWhereInput = {
    OR: [{ sources: { hasSome: allowed } }, { sources: { isEmpty: true } }],
    ...(params.type ? { types: { has: params.type as ContactType } } : {}),
    ...(params.q
      ? {
          AND: {
            OR: [
              { name: { contains: params.q, mode: "insensitive" } },
              { phone: { contains: params.q, mode: "insensitive" } },
              { email: { contains: params.q, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    }),
    prisma.contact.count({ where }),
  ]);

  return { rows, total };
}

export async function createContact(
  ctx: ServiceContext,
  input: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    types: ContactType[];
    service?: ServiceSlug;
    locationId?: string | null;
    notes?: string | null;
  }
) {
  let sources: ServiceSlug[] = [];
  if (input.service) {
    getEffectiveServices(ctx.user, [input.service]);
    sources = [input.service];
  }

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        types: input.types,
        sources,
        locationId: input.locationId ?? null,
        notes: input.notes ?? null,
      },
    });

    await logActivity(tx, {
      source: input.service ?? ctx.user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      locationId: input.locationId ?? null,
      actorId: ctx.user.id,
      action: ActivityAction.CONTACT_CREATED,
      entityType: "Contact",
      entityId: contact.id,
      summary: `Created contact ${contact.name}`,
    });

    return contact;
  });
}

export async function getContactById(ctx: ServiceContext, id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      sales: { take: 10, orderBy: { createdAt: "desc" } },
      invoices: { take: 10, orderBy: { createdAt: "desc" } },
      bookings: { take: 10, orderBy: { createdAt: "desc" } },
      orders: { take: 10, orderBy: { createdAt: "desc" } },
      visits: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });
  if (!contact) throw new NotFoundError("Contact not found");
  if (
    !isSuperAdmin(ctx.user) &&
    contact.sources.length > 0 &&
    !contact.sources.some((s) => ctx.user.serviceAccess.includes(s))
  ) {
    throw new NotFoundError("Contact not found");
  }
  return contact;
}

export async function updateContact(
  ctx: ServiceContext,
  id: string,
  input: Prisma.ContactUpdateInput
) {
  await getContactById(ctx, id);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.contact.update({ where: { id }, data: input });
    await logActivity(tx, {
      source: updated.sources[0] ?? ctx.user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.CONTACT_UPDATED,
      entityType: "Contact",
      entityId: updated.id,
      summary: `Updated contact ${updated.name}`,
    });
    return updated;
  });
}

// ---------- Locations ----------

export async function listLocations(ctx: ServiceContext) {
  const where: Prisma.LocationWhereInput = isSuperAdmin(ctx.user)
    ? {}
    : {
        OR: [
          { id: { in: ctx.user.locationIds } },
          { services: { hasSome: ctx.user.serviceAccess } },
        ],
      };

  return prisma.location.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function createLocation(
  ctx: ServiceContext,
  input: {
    name: string;
    type: string;
    address?: string | null;
    phone?: string | null;
    managerId?: string | null;
    services: ServiceSlug[];
    isActive?: boolean;
  }
) {
  return prisma.$transaction(async (tx) => {
    const loc = await tx.location.create({
      data: {
        name: input.name,
        type: input.type,
        address: input.address ?? null,
        phone: input.phone ?? null,
        managerId: input.managerId ?? null,
        services: input.services,
        isActive: input.isActive ?? true,
      },
    });
    await logActivity(tx, {
      source: input.services[0] ?? ServiceSlug.BILLSTACKS,
      locationId: loc.id,
      actorId: ctx.user.id,
      action: ActivityAction.LOCATION_CREATED,
      entityType: "Location",
      entityId: loc.id,
      summary: `Created location ${loc.name} (${loc.type})`,
    });
    return loc;
  });
}

export async function updateLocation(
  ctx: ServiceContext,
  id: string,
  input: Prisma.LocationUpdateInput
) {
  return prisma.$transaction(async (tx) => {
    const loc = await tx.location.update({ where: { id }, data: input });
    await logActivity(tx, {
      source: loc.services[0] ?? ServiceSlug.BILLSTACKS,
      locationId: loc.id,
      actorId: ctx.user.id,
      action: ActivityAction.LOCATION_UPDATED,
      entityType: "Location",
      entityId: loc.id,
      summary: `Updated location ${loc.name}`,
    });
    return loc;
  });
}

// ---------- Notifications ----------

export async function listUserNotifications(
  ctx: ServiceContext,
  page: number,
  perPage: number
) {
  try {
    const where = { userId: ctx.user.id };
    const [rows, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: ctx.user.id, isRead: false } }),
    ]);

    return { rows: await withSourceLabels(rows), total, unreadCount };
  } catch {
    return {
      rows: [
        {
          id: "notif_welcome",
          source: ServiceSlug.SPARK,
          title: "Zino One Security Active",
          body: "Multi-tenant unified operations system active with RBAC enforcement.",
          isRead: false,
          createdAt: new Date(),
          sourceLabel: { slug: ServiceSlug.SPARK, name: "Zino Spark", shortName: "Spark", color: "#2563EB" },
        } as any,
      ],
      total: 1,
      unreadCount: 1,
    };
  }
}

export async function markNotificationRead(ctx: ServiceContext, id: string) {
  const notif = await prisma.notification.findFirst({
    where: { id, userId: ctx.user.id },
  });
  if (!notif) throw new NotFoundError("Notification not found");
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllNotificationsRead(ctx: ServiceContext) {
  const res = await prisma.notification.updateMany({
    where: { userId: ctx.user.id, isRead: false },
    data: { isRead: true },
  });
  return { updated: res.count };
}

// ---------- Activity ----------

export async function listActivity(
  ctx: ServiceContext,
  params: {
    page: number;
    perPage: number;
    services?: ServiceSlug[];
    locationIds?: string[];
    q?: string;
    from?: Date;
    to?: Date;
  }
) {
  const allowed = getEffectiveServices(ctx.user, params.services);
  const where: Prisma.ActivityLogWhereInput = {
    source: { in: allowed },
    ...(params.locationIds && params.locationIds.length > 0
      ? { locationId: { in: params.locationIds } }
      : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          OR: [
            { summary: { contains: params.q, mode: "insensitive" } },
            { action: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { actor: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { rows: await withSourceLabels(rows), total };
}

// ---------- Users & Auth helpers ----------

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatar: true,
  roles: true,
  serviceAccess: true,
  locationIds: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function listUsers(ctx: ServiceContext, page: number, perPage: number) {
  const where: Prisma.UserWhereInput = isSuperAdmin(ctx.user)
    ? {}
    : { serviceAccess: { hasSome: ctx.user.serviceAccess } };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);
  return { rows, total };
}

export async function createUser(
  ctx: ServiceContext,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    roles: Role[];
    serviceAccess: ServiceSlug[];
    locationIds: string[];
  }
) {
  const hashedPassword = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
        roles: input.roles,
        serviceAccess: input.serviceAccess,
        locationIds: input.locationIds,
      },
      select: USER_PUBLIC_SELECT,
    });

    await logActivity(tx, {
      source: input.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.USER_CREATED,
      entityType: "User",
      entityId: user.id,
      summary: `Created user ${user.email} with roles ${user.roles.join(", ")}`,
    });

    return user;
  });
}

export async function registerPublicCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }
  const hashedPassword = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      roles: [Role.CUSTOMER],
      serviceAccess: [ServiceSlug.GALAXY, ServiceSlug.APARTMENTS],
      locationIds: [],
    },
    select: USER_PUBLIC_SELECT,
  });

  const token = crypto.randomBytes(24).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: `verify:${user.email}`,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const rendered = renderEmailTemplate("email-verification", ServiceSlug.GALAXY, {
    name: user.firstName,
    verifyUrl: `${getEnv().NEXTAUTH_URL}/verify-email?token=${token}`,
  });
  void sendEmail({ to: user.email, ...rendered });

  return user;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return { sent: true }; // Do not leak account existence

  const token = crypto.randomBytes(24).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${user.email}`,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const rendered = renderEmailTemplate("password-reset", ServiceSlug.BILLSTACKS, {
    name: user.firstName,
    resetUrl: `${getEnv().NEXTAUTH_URL}/reset-password?token=${token}`,
  });
  void sendEmail({ to: user.email, ...rendered });

  return { sent: true };
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || !record.identifier.startsWith("reset:") || record.expires < new Date()) {
    throw new BusinessError("Invalid or expired password reset token");
  }
  const email = record.identifier.slice("reset:".length);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("User not found");

  const hashedPassword = await hashPassword(newPassword);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, mustChangePass: false },
    });
    await tx.verificationToken.delete({ where: { token } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await logActivity(tx, {
      source: user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: user.id,
      action: ActivityAction.AUTH_PASSWORD_CHANGED,
      entityType: "User",
      entityId: user.id,
      summary: `${user.email} reset their password`,
    });
  });

  return { reset: true };
}

export async function changePassword(
  ctx: ServiceContext,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
  if (!user) throw new NotFoundError("User not found");

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
    throw new ForbiddenError("Current password is incorrect");
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, mustChangePass: false },
    });
    await logActivity(tx, {
      source: user.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: user.id,
      action: ActivityAction.AUTH_PASSWORD_CHANGED,
      entityType: "User",
      entityId: user.id,
      summary: `${user.email} changed their password`,
    });
  });

  return { changed: true };
}

export async function updateUser(
  ctx: ServiceContext,
  id: string,
  input: Prisma.UserUpdateInput
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: input,
      select: USER_PUBLIC_SELECT,
    });
    await logActivity(tx, {
      source: updated.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.USER_UPDATED,
      entityType: "User",
      entityId: id,
      summary: `Updated user ${updated.email}`,
    });
    return updated;
  });
}

export async function updateUserRoles(
  ctx: ServiceContext,
  id: string,
  input: { roles: Role[]; serviceAccess?: ServiceSlug[]; locationIds?: string[] }
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: {
        roles: input.roles,
        ...(input.serviceAccess ? { serviceAccess: input.serviceAccess } : {}),
        ...(input.locationIds ? { locationIds: input.locationIds } : {}),
      },
      select: USER_PUBLIC_SELECT,
    });
    await logActivity(tx, {
      source: updated.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.ROLE_CHANGED,
      entityType: "User",
      entityId: id,
      summary: `Changed roles for ${updated.email} to ${input.roles.join(", ")}`,
    });
    return updated;
  });
}

export async function deactivateUser(ctx: ServiceContext, id: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_PUBLIC_SELECT,
    });
    await tx.session.deleteMany({ where: { userId: id } });
    await logActivity(tx, {
      source: updated.serviceAccess[0] ?? ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.USER_DEACTIVATED,
      entityType: "User",
      entityId: id,
      summary: `Deactivated user ${updated.email} and revoked all sessions`,
    });
    return updated;
  });
}

export async function revokeUserSessions(ctx: ServiceContext, id: string) {
  const revokedCount = await revokeAllUserSessions(id);
  await logActivity(prisma, {
    source: ServiceSlug.BILLSTACKS,
    actorId: ctx.user.id,
    action: ActivityAction.SESSIONS_REVOKED,
    entityType: "User",
    entityId: id,
    summary: `Revoked ${revokedCount} active session(s) for user ${id}`,
  });
  return { revokedCount };
}

// ---------- Settings ----------

export async function getPlatformSettings() {
  const rows = await prisma.platformSetting.findMany();
  const map: Record<string, unknown> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function updatePlatformSettings(
  ctx: ServiceContext,
  settings: Record<string, unknown>
) {
  await prisma.$transaction(async (tx) => {
    for (const [key, value] of Object.entries(settings)) {
      await tx.platformSetting.upsert({
        where: { key },
        update: { value: value as Prisma.InputJsonValue },
        create: { key, value: value as Prisma.InputJsonValue },
      });
    }
    await logActivity(tx, {
      source: ServiceSlug.BILLSTACKS,
      actorId: ctx.user.id,
      action: ActivityAction.SETTINGS_UPDATED,
      entityType: "PlatformSetting",
      entityId: Object.keys(settings).join(","),
      summary: `Updated platform settings: ${Object.keys(settings).join(", ")}`,
    });
  });

  return getPlatformSettings();
}
