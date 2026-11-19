// ---------------------------------------------------------------------------
// Zino One — Visitors, Pre-Registers & Attendance Service (§9.6)
// ---------------------------------------------------------------------------

import crypto from "crypto";
import { ContactType, ServiceSlug, VisitStatus } from "@prisma/client";
import { prisma } from "../prisma";
import {
  BusinessError,
  ConflictError,
  NotFoundError,
} from "../errors";
import { withSourceLabel, type ServiceContext } from "../scope";
import { formatDateOnly, lagosHour, lagosMinute, toDateOnly, toLagosDateString } from "../dates";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";
import { sendSms } from "../sms/termii";
import { getEnv } from "../env";

export async function createPreRegister(
  ctx: ServiceContext,
  input: {
    name: string;
    phone: string;
    email?: string | null;
    hostId?: string | null;
    visitDate: string;
    visitTime?: string | null;
    purpose?: string | null;
  }
) {
  const preReg = await prisma.$transaction(async (tx) => {
    let contact = await tx.contact.findFirst({
      where: {
        OR: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email.toLowerCase() }] : []),
        ],
      },
    });
    if (!contact) {
      contact = await tx.contact.create({
        data: {
          name: input.name,
          phone: input.phone,
          email: input.email?.toLowerCase() ?? null,
          types: [ContactType.VISITOR],
          sources: [ServiceSlug.VISITORS],
        },
      });
    } else if (!contact.sources.includes(ServiceSlug.VISITORS)) {
      contact = await tx.contact.update({
        where: { id: contact.id },
        data: { sources: { push: ServiceSlug.VISITORS } },
      });
    }

    const inviteToken = crypto.randomBytes(20).toString("hex");
    const created = await tx.preRegister.create({
      data: {
        source: ServiceSlug.VISITORS,
        contactId: contact.id,
        hostId: input.hostId ?? null,
        visitDate: toDateOnly(input.visitDate),
        visitTime: input.visitTime ?? null,
        purpose: input.purpose ?? null,
        inviteToken,
        status: VisitStatus.EXPECTED,
      },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.PRE_REGISTER_CREATED,
      entityType: "PreRegister",
      entityId: created.id,
      summary: `Pre-registered visitor ${contact.name} for ${input.visitDate}`,
    });

    return { ...created, contact };
  });

  return withSourceLabel({
    ...preReg,
    visitDate: formatDateOnly(preReg.visitDate),
  });
}

export async function sendPreRegisterInvite(ctx: ServiceContext, id: string) {
  const preReg = await prisma.preRegister.findUnique({ where: { id } });
  if (!preReg) throw new NotFoundError("Pre-registration not found");
  if (preReg.status !== VisitStatus.EXPECTED) {
    throw new BusinessError("Can only send invites for EXPECTED pre-registrations");
  }

  const [contact, host] = await Promise.all([
    prisma.contact.findUnique({ where: { id: preReg.contactId } }),
    preReg.hostId
      ? prisma.employee.findUnique({
          where: { id: preReg.hostId },
          include: { contact: true },
        })
      : null,
  ]);

  const checkInUrl = `${getEnv().NEXTAUTH_URL}/visit?token=${preReg.inviteToken}`;

  if (contact?.email) {
    const rendered = renderEmailTemplate("visitor-invite", ServiceSlug.VISITORS, {
      visitorName: contact.name,
      hostName: host?.contact.name ?? "Zino One Reception",
      visitDate: formatDateOnly(preReg.visitDate),
      checkInUrl,
    });
    void sendEmail({ to: contact.email, ...rendered });
  }
  if (contact?.phone) {
    void sendSms(
      contact.phone,
      `Your Zino One visitor pass for ${formatDateOnly(preReg.visitDate)}: ${checkInUrl}`
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.preRegister.update({
      where: { id },
      data: { inviteSentAt: new Date() },
    });
    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.PRE_REGISTER_INVITED,
      entityType: "PreRegister",
      entityId: id,
      summary: `Sent visitor invite to ${contact?.name ?? preReg.contactId}`,
    });
    return saved;
  });

  return withSourceLabel({ ...updated, checkInUrl });
}

export async function checkInByToken(token: string) {
  const visit = await prisma.$transaction(async (tx) => {
    const preReg = await tx.preRegister.findUnique({
      where: { inviteToken: token },
      include: { visits: true },
    });
    if (!preReg) {
      throw new NotFoundError("Invalid visitor check-in token");
    }
    if (preReg.status !== VisitStatus.EXPECTED || preReg.visits.length > 0) {
      throw new ConflictError("This visitor check-in token has already been used or cancelled");
    }

    const today = toDateOnly(toLagosDateString());
    if (preReg.visitDate < today) {
      await tx.preRegister.update({
        where: { id: preReg.id },
        data: { status: VisitStatus.EXPIRED },
      });
      throw new BusinessError("This visitor check-in token has expired");
    }

    const created = await tx.visit.create({
      data: {
        source: ServiceSlug.VISITORS,
        contactId: preReg.contactId,
        hostId: preReg.hostId,
        purpose: preReg.purpose,
        checkInAt: new Date(),
        status: VisitStatus.CHECKED_IN,
        preRegisterId: preReg.id,
      },
      include: { contact: true, host: { include: { contact: true } } },
    });

    await tx.preRegister.update({
      where: { id: preReg.id },
      data: { status: VisitStatus.CHECKED_IN },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      action: ActivityAction.VISIT_CHECKED_IN,
      entityType: "Visit",
      entityId: created.id,
      summary: `Visitor ${created.contact.name} checked in via kiosk pass`,
    });

    return created;
  });

  // Notify host employee (§9.6, §11.3)
  if (visit.host?.contact.email) {
    const hostUser = await prisma.user.findFirst({
      where: { email: { equals: visit.host.contact.email, mode: "insensitive" } },
    });
    if (hostUser) {
      void notify({
        userIds: [hostUser.id],
        source: ServiceSlug.VISITORS,
        title: `Visitor Arrived — ${visit.contact.name}`,
        body: `${visit.contact.name} has checked in at reception (${visit.purpose ?? "Visit"}).`,
        entityType: "Visit",
        entityId: visit.id,
        channels: ["IN_APP", "EMAIL"],
        templateKey: "visitor-arrival",
        templateVars: {
          hostName: visit.host.contact.name,
          visitorName: visit.contact.name,
          purpose: visit.purpose ?? "Visit",
        },
      });
    }
  }

  return withSourceLabel(visit);
}

export async function walkInCheckIn(
  ctx: ServiceContext,
  input: {
    name: string;
    phone: string;
    email?: string | null;
    hostId?: string | null;
    purpose?: string | null;
  }
) {
  const visit = await prisma.$transaction(async (tx) => {
    let contact = await tx.contact.findFirst({
      where: {
        OR: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email.toLowerCase() }] : []),
        ],
      },
    });
    if (!contact) {
      contact = await tx.contact.create({
        data: {
          name: input.name,
          phone: input.phone,
          email: input.email?.toLowerCase() ?? null,
          types: [ContactType.VISITOR],
          sources: [ServiceSlug.VISITORS],
        },
      });
    }

    const created = await tx.visit.create({
      data: {
        source: ServiceSlug.VISITORS,
        contactId: contact.id,
        hostId: input.hostId ?? null,
        purpose: input.purpose ?? null,
        checkInAt: new Date(),
        status: VisitStatus.CHECKED_IN,
      },
      include: { contact: true, host: { include: { contact: true } } },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.VISIT_CHECKED_IN,
      entityType: "Visit",
      entityId: created.id,
      summary: `Checked in walk-in visitor ${contact.name}`,
    });

    return created;
  });

  return withSourceLabel(visit);
}

export async function checkOutVisit(ctx: ServiceContext, visitId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.visit.findUnique({
      where: { id: visitId },
      include: { contact: true },
    });
    if (!existing) throw new NotFoundError("Visit not found");
    if (existing.status !== VisitStatus.CHECKED_IN) {
      throw new BusinessError("Only CHECKED_IN visits can be checked out");
    }

    const updated = await tx.visit.update({
      where: { id: visitId },
      data: {
        status: VisitStatus.CHECKED_OUT,
        checkOutAt: new Date(),
      },
      include: { contact: true },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.VISIT_CHECKED_OUT,
      entityType: "Visit",
      entityId: updated.id,
      summary: `Checked out visitor ${existing.contact.name}`,
    });

    return withSourceLabel(updated);
  });
}

async function resolveEmployeeForUser(ctx: ServiceContext) {
  const contact = await prisma.contact.findFirst({
    where: { email: { equals: ctx.user.email, mode: "insensitive" } },
    include: { employee: true },
  });
  if (contact?.employee) return contact.employee;

  // Auto-provision Employee record for authenticated staff if missing
  const createdContact =
    contact ??
    (await prisma.contact.create({
      data: {
        name: `${ctx.user.firstName} ${ctx.user.lastName}`,
        email: ctx.user.email,
        types: [ContactType.EMPLOYEE],
        sources: [ServiceSlug.VISITORS],
      },
    }));

  return prisma.employee.create({
    data: { contactId: createdContact.id, isActive: true },
  });
}

export async function clockIn(ctx: ServiceContext) {
  const employee = await resolveEmployeeForUser(ctx);
  const today = toDateOnly(toLagosDateString());

  return prisma.$transaction(async (tx) => {
    const existing = await tx.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });
    if (existing && !existing.clockOutAt) {
      throw new ConflictError("You are already clocked in for today");
    }
    if (existing) {
      throw new ConflictError("Attendance already recorded for today");
    }

    const now = new Date();
    // Default office start time 09:00 WAT
    const isLate = lagosHour(now) > 9 || (lagosHour(now) === 9 && lagosMinute(now) > 0);
    const status = isLate ? "LATE" : "PRESENT";

    const row = await tx.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        clockInAt: now,
        status,
      },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.ATTENDANCE_CLOCK_IN,
      entityType: "Attendance",
      entityId: row.id,
      summary: `${ctx.user.firstName} ${ctx.user.lastName} clocked in (${status})`,
    });

    return { ...row, date: formatDateOnly(row.date) };
  });
}

export async function clockOut(ctx: ServiceContext) {
  const employee = await resolveEmployeeForUser(ctx);
  const today = toDateOnly(toLagosDateString());

  return prisma.$transaction(async (tx) => {
    const existing = await tx.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });
    if (!existing || !existing.clockInAt) {
      throw new BusinessError("No active clock-in found for today");
    }
    if (existing.clockOutAt) {
      throw new ConflictError("You have already clocked out for today");
    }

    const now = new Date();
    const hoursWorked = Number(
      ((now.getTime() - existing.clockInAt.getTime()) / 3600_000).toFixed(2)
    );

    const row = await tx.attendance.update({
      where: { id: existing.id },
      data: { clockOutAt: now },
    });

    await logActivity(tx, {
      source: ServiceSlug.VISITORS,
      actorId: ctx.user.id,
      action: ActivityAction.ATTENDANCE_CLOCK_OUT,
      entityType: "Attendance",
      entityId: row.id,
      summary: `${ctx.user.firstName} ${ctx.user.lastName} clocked out (${hoursWorked}h worked)`,
    });

    return { ...row, date: formatDateOnly(row.date), hoursWorked };
  });
}

/**
 * Cron job: expire past EXPECTED pre-registrations (§14).
 */
export async function expirePreRegisters() {
  const today = toDateOnly(toLagosDateString());
  const expired = await prisma.preRegister.findMany({
    where: {
      status: VisitStatus.EXPECTED,
      visitDate: { lt: today },
    },
  });

  for (const pr of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.preRegister.update({
        where: { id: pr.id },
        data: { status: VisitStatus.EXPIRED },
      });
      await logActivity(tx, {
        source: ServiceSlug.VISITORS,
        action: ActivityAction.PRE_REGISTER_EXPIRED,
        entityType: "PreRegister",
        entityId: pr.id,
        summary: `Pre-registration ${pr.id} expired`,
      });
    });
  }

  return { expiredPreRegisters: expired.length };
}
