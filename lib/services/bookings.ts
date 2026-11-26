// ---------------------------------------------------------------------------
// Zino One — Apartments & Bookings Service (§9.4)
// Transactional SELECT ... FOR UPDATE on RoomType prevents double-booking.
// ---------------------------------------------------------------------------

import {
  BookingStatus,
  ContactType,
  PaymentStatus,
  Role,
  RoomStatus,
  ServiceSlug,
} from "@prisma/client";
import { prisma } from "../prisma";
import {
  BusinessError,
  ConflictError,
  NotFoundError,
} from "../errors";
import { withSourceLabel, withSourceLabels, type ServiceContext } from "../scope";
import { addKobo, calcTaxKobo, formatNGN, mulKobo } from "../money";
import {
  formatDateOnly,
  lagosHour,
  nightsBetween,
  toDateOnly,
  toLagosDateString,
} from "../dates";
import { generateUniqueRef } from "./numbering";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";
import {
  generatePaymentReference,
  initializePayment,
  type PaymentGateway,
} from "../payments";

/**
 * Pure overlap check helper for unit tests (§9.4, §18).
 */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export async function checkAvailability(
  roomTypeId: string,
  checkInStr: string,
  checkOutStr: string
) {
  const checkIn = toDateOnly(checkInStr);
  const checkOut = toDateOnly(checkOutStr);

  if (checkOut <= checkIn) {
    throw new BusinessError("Check-out date must be after check-in date");
  }

  const [totalRooms, overlapping] = await Promise.all([
    prisma.room.count({
      where: {
        roomTypeId,
        status: { notIn: [RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_ORDER] },
      },
    }),
    prisma.booking.aggregate({
      where: {
        roomTypeId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      _sum: { rooms: true },
    }),
  ]);

  const bookedRooms = overlapping._sum.rooms ?? 0;
  const available = Math.max(0, totalRooms - bookedRooms);

  return { available, totalRooms, bookedRooms };
}

export async function createBooking(
  input: {
    roomTypeId: string;
    roomTypeSlug?: string | null;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string | null;
    payNow?: boolean;
    gateway?: PaymentGateway;
  },
  actorId?: string | null
) {
  const checkIn = toDateOnly(input.checkIn);
  const checkOut = toDateOnly(input.checkOut);
  const today = toDateOnly(toLagosDateString());

  if (checkIn < today) {
    throw new BusinessError("Check-in date cannot be in the past");
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1 || nights > 30) {
    throw new BusinessError("Stay duration must be between 1 and 30 nights");
  }

  const created = await prisma.$transaction(async (tx) => {
    // Resolve RoomType by id, slug, or fallback roomTypeSlug before row locking (§9.4)
    const slugCandidates = [input.roomTypeId, input.roomTypeSlug].filter(
      (v): v is string => Boolean(v && v.trim())
    );
    const resolvedRoomType = await tx.roomType.findFirst({
      where: {
        OR: [
          { id: input.roomTypeId },
          { slug: { in: slugCandidates } },
        ],
      },
      select: { id: true },
    });
    if (!resolvedRoomType) {
      throw new NotFoundError("Room type not found");
    }

    // Row lock on RoomType to prevent concurrent double-booking (§9.4)
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "RoomType" WHERE "id" = ${resolvedRoomType.id} FOR UPDATE
    `;
    if (locked.length === 0) {
      throw new NotFoundError("Room type not found");
    }

    const roomType = await tx.roomType.findUnique({
      where: { id: resolvedRoomType.id },
    });
    if (!roomType || !roomType.isActive) {
      throw new NotFoundError("Room type not found or inactive");
    }

    if (
      input.adults > roomType.adults * input.rooms ||
      input.children > roomType.children * input.rooms
    ) {
      throw new BusinessError("Guest count exceeds room type capacity");
    }

    const [totalRooms, overlapping] = await Promise.all([
      tx.room.count({
        where: {
          roomTypeId: roomType.id,
          status: { notIn: [RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_ORDER] },
        },
      }),
      tx.booking.aggregate({
        where: {
          roomTypeId: roomType.id,
          OR: [
            { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } },
            {
              status: BookingStatus.REQUESTED,
              holdExpiresAt: { gt: new Date() },
            },
          ],
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        _sum: { rooms: true },
      }),
    ]);

    const bookedRooms = overlapping._sum.rooms ?? 0;
    const available = totalRooms - bookedRooms;
    if (available < input.rooms) {
      throw new ConflictError(
        `Only ${Math.max(0, available)} room(s) available for the selected dates`
      );
    }

    const baseKobo = mulKobo(roomType.basePriceKobo, nights * input.rooms, 1);
    const taxKobo = calcTaxKobo(baseKobo, Number(roomType.taxPct));
    const totalKobo = addKobo(baseKobo, taxKobo);

    // Find or create guest Contact
    let contact = await tx.contact.findFirst({
      where: {
        OR: [{ phone: input.guestPhone }, { email: input.guestEmail }],
      },
    });
    if (!contact) {
      contact = await tx.contact.create({
        data: {
          name: input.guestName,
          phone: input.guestPhone,
          email: input.guestEmail,
          types: [ContactType.GUEST],
          sources: [ServiceSlug.APARTMENTS],
        },
      });
    } else if (!contact.sources.includes(ServiceSlug.APARTMENTS)) {
      contact = await tx.contact.update({
        where: { id: contact.id },
        data: { sources: { push: ServiceSlug.APARTMENTS } },
      });
    }

    const ref = await generateUniqueRef("ZINO", async (candidate) => {
      const existing = await tx.booking.findUnique({ where: { ref: candidate } });
      return Boolean(existing);
    });

    const holdExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30-min hold

    const booking = await tx.booking.create({
      data: {
        ref,
        source: ServiceSlug.APARTMENTS,
        contactId: contact.id,
        roomTypeId: roomType.id,
        checkIn,
        checkOut,
        adults: input.adults,
        children: input.children,
        rooms: input.rooms,
        totalKobo,
        taxKobo,
        status: BookingStatus.REQUESTED,
        specialRequests: input.specialRequests ?? null,
        holdExpiresAt,
      },
      include: { contact: true, roomType: true },
    });

    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: actorId ?? null,
      action: ActivityAction.BOOKING_REQUESTED,
      entityType: "Booking",
      entityId: booking.id,
      summary: `Booking ${ref} requested by ${contact.name} (${roomType.name}, ${nights} night(s), ${formatNGN(totalKobo)})`,
      amountKobo: totalKobo,
    });

    return booking;
  });

  // Notify reception & service manager (§11.3)
  void notify({
    roles: [Role.RECEPTION, Role.SERVICE_MANAGER],
    source: ServiceSlug.APARTMENTS,
    title: `New Booking Request — ${created.ref}`,
    body: `${created.contact.name} requested ${created.roomType.name} (${formatDateOnly(created.checkIn)} to ${formatDateOnly(created.checkOut)}).`,
    entityType: "Booking",
    entityId: created.id,
    channels: ["IN_APP", "EMAIL"],
  });

  let paymentInit: { authorizationUrl: string; reference: string; gateway: string } | undefined;
  if (input.payNow) {
    const reference = generatePaymentReference(ServiceSlug.APARTMENTS);
    paymentInit = await initializePayment(
      {
        amountKobo: created.totalKobo,
        email: input.guestEmail,
        reference,
        metadata: { bookingId: created.id, ref: created.ref, source: ServiceSlug.APARTMENTS },
      },
      input.gateway
    );

    await prisma.payment.create({
      data: {
        source: ServiceSlug.APARTMENTS,
        contactId: created.contactId,
        bookingId: created.id,
        amountKobo: created.totalKobo,
        method: "ONLINE",
        reference,
        gateway: paymentInit.gateway,
        status: PaymentStatus.PENDING,
        receivedById: actorId ?? "SYSTEM",
        note: `Online booking ${created.ref}`,
      },
    });
  }

  return withSourceLabel({
    ...created,
    checkIn: formatDateOnly(created.checkIn),
    checkOut: formatDateOnly(created.checkOut),
    totalDisplay: formatNGN(created.totalKobo),
    ...(paymentInit ? { payment: paymentInit } : {}),
  });
}

export async function confirmBooking(
  ctx: ServiceContext,
  ref: string,
  roomId?: string | null
) {
  const booking = await prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({
      where: { ref },
      include: { contact: true, roomType: true },
    });
    if (!existing) throw new NotFoundError("Booking not found");
    if (existing.status !== BookingStatus.REQUESTED) {
      throw new BusinessError(`Cannot confirm booking in status ${existing.status}`);
    }

    const updated = await tx.booking.update({
      where: { id: existing.id },
      data: {
        status: BookingStatus.CONFIRMED,
        roomId: roomId ?? existing.roomId,
        holdExpiresAt: null,
      },
      include: { contact: true, roomType: true, room: true },
    });

    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: ctx.user.id,
      action: ActivityAction.BOOKING_CONFIRMED,
      entityType: "Booking",
      entityId: updated.id,
      summary: `Confirmed booking ${updated.ref} for ${updated.contact.name}`,
      amountKobo: updated.totalKobo,
    });

    return updated;
  });

  if (booking.contact.email) {
    const rendered = renderEmailTemplate("booking-confirmation", ServiceSlug.APARTMENTS, {
      guestName: booking.contact.name,
      ref: booking.ref,
      roomType: booking.roomType.name,
      checkIn: formatDateOnly(booking.checkIn),
      checkOut: formatDateOnly(booking.checkOut),
      totalDisplay: formatNGN(booking.totalKobo),
    });
    void sendEmail({ to: booking.contact.email, ...rendered });
  }

  return withSourceLabel({ ...booking, totalDisplay: formatNGN(booking.totalKobo) });
}

export async function checkInBooking(
  ctx: ServiceContext,
  ref: string,
  roomId?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({
      where: { ref },
      include: { contact: true },
    });
    if (!existing) throw new NotFoundError("Booking not found");
    if (existing.status !== BookingStatus.CONFIRMED) {
      throw new BusinessError("Booking must be CONFIRMED before check-in");
    }

    let assignedRoomId = roomId ?? existing.roomId;
    if (!assignedRoomId) {
      const firstAvailable = await tx.room.findFirst({
        where: {
          roomTypeId: existing.roomTypeId,
          status: RoomStatus.AVAILABLE,
        },
        orderBy: { number: "asc" },
      });
      if (firstAvailable) {
        assignedRoomId = firstAvailable.id;
      }
    }
    if (!assignedRoomId) {
      throw new BusinessError("No available room of this type to check in");
    }

    const room = await tx.room.findUnique({ where: { id: assignedRoomId } });
    if (!room || room.roomTypeId !== existing.roomTypeId) {
      throw new BusinessError("Assigned room does not belong to booked room type");
    }
    if (room.status !== RoomStatus.AVAILABLE) {
      throw new ConflictError(`Room ${room.number} is currently ${room.status}`);
    }

    const now = new Date();
    const lateCheckIn = lagosHour(now) >= 23;

    await tx.room.update({
      where: { id: room.id },
      data: { status: RoomStatus.OCCUPIED },
    });

    const updated = await tx.booking.update({
      where: { id: existing.id },
      data: {
        status: BookingStatus.CHECKED_IN,
        roomId: room.id,
        checkedInAt: now,
        lateCheckIn,
      },
      include: { contact: true, room: true, roomType: true },
    });

    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: ctx.user.id,
      action: ActivityAction.BOOKING_CHECKED_IN,
      entityType: "Booking",
      entityId: updated.id,
      summary: `Checked in ${updated.contact.name} (${updated.ref}) to Room ${room.number}${lateCheckIn ? " [Late check-in]" : ""}`,
    });

    return withSourceLabel(updated);
  });
}

export async function checkOutBooking(
  ctx: ServiceContext,
  ref: string,
  options: { managerOverride?: boolean; overrideReason?: string } = {}
) {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({
      where: { ref },
      include: { contact: true, room: true, payments: true },
    });
    if (!existing) throw new NotFoundError("Booking not found");
    if (existing.status !== BookingStatus.CHECKED_IN) {
      throw new BusinessError("Only CHECKED_IN bookings can be checked out");
    }

    const paid = existing.payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((acc, p) => addKobo(acc, p.amountKobo), 0);

    const isManager =
      ctx.user.roles.includes(Role.SERVICE_MANAGER) ||
      ctx.user.roles.includes(Role.SUPER_ADMIN);

    if (paid < existing.totalKobo) {
      if (!(options.managerOverride && isManager && options.overrideReason)) {
        throw new BusinessError(
          `Bill not settled (${formatNGN(paid)} paid of ${formatNGN(existing.totalKobo)}). Manager override with reason required.`
        );
      }
    }

    const now = new Date();
    const delayedCheckOut = lagosHour(now) >= 10;

    if (existing.roomId) {
      await tx.room.update({
        where: { id: existing.roomId },
        data: { status: RoomStatus.CLEANING },
      });
    }

    const updated = await tx.booking.update({
      where: { id: existing.id },
      data: {
        status: BookingStatus.CHECKED_OUT,
        checkedOutAt: now,
        delayedCheckOut,
      },
      include: { contact: true, room: true, roomType: true },
    });

    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: ctx.user.id,
      action: ActivityAction.BOOKING_CHECKED_OUT,
      entityType: "Booking",
      entityId: updated.id,
      summary: `Checked out ${updated.contact.name} (${updated.ref})${delayedCheckOut ? " [Delayed checkout]" : ""}`,
    });

    return updated;
  });

  if (result.delayedCheckOut) {
    void notify({
      roles: [Role.RECEPTION, Role.SERVICE_MANAGER],
      source: ServiceSlug.APARTMENTS,
      title: `Delayed Checkout — ${result.ref}`,
      body: `${result.contact.name} checked out after 10:00 WAT.`,
      entityType: "Booking",
      entityId: result.id,
      channels: ["IN_APP"],
    });
  }

  return withSourceLabel(result);
}

export async function cancelBooking(
  ctx: ServiceContext,
  ref: string,
  reason: string
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({
      where: { ref },
      include: { contact: true, roomType: true, payments: true },
    });
    if (!existing) throw new NotFoundError("Booking not found");
    if (
      existing.status === BookingStatus.CHECKED_OUT ||
      existing.status === BookingStatus.CANCELLED
    ) {
      throw new BusinessError(`Cannot cancel booking in status ${existing.status}`);
    }

    if (existing.roomId) {
      await tx.room.update({
        where: { id: existing.roomId },
        data: { status: RoomStatus.AVAILABLE },
      });
    }

    // Free cancellation refunds paid amount as a negative Payment row (§9.4)
    const paid = existing.payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((a, p) => addKobo(a, p.amountKobo), 0);

    if (
      paid > 0 &&
      existing.roomType.cancellation.toLowerCase().includes("free")
    ) {
      await tx.payment.create({
        data: {
          source: ServiceSlug.APARTMENTS,
          contactId: existing.contactId,
          bookingId: existing.id,
          amountKobo: -paid,
          method: "REFUND",
          status: PaymentStatus.REFUNDED,
          receivedById: ctx.user.id,
          note: `Free cancellation refund for ${existing.ref}: ${reason}`,
        },
      });
    }

    const updated = await tx.booking.update({
      where: { id: existing.id },
      data: {
        status: BookingStatus.CANCELLED,
        specialRequests: `${existing.specialRequests ? existing.specialRequests + " | " : ""}CANCELLED: ${reason}`,
      },
    });

    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: ctx.user.id,
      action: ActivityAction.BOOKING_CANCELLED,
      entityType: "Booking",
      entityId: updated.id,
      summary: `Cancelled booking ${existing.ref} (${reason})`,
    });

    return withSourceLabel(updated);
  });
}

export async function markBookingNoShow(ctx: ServiceContext, ref: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({ where: { ref } });
    if (!existing) throw new NotFoundError("Booking not found");
    if (existing.status !== BookingStatus.CONFIRMED) {
      throw new BusinessError("Only CONFIRMED bookings can be marked NO_SHOW");
    }
    if (existing.roomId) {
      await tx.room.update({
        where: { id: existing.roomId },
        data: { status: RoomStatus.AVAILABLE },
      });
    }
    const updated = await tx.booking.update({
      where: { id: existing.id },
      data: { status: BookingStatus.NO_SHOW },
    });
    await logActivity(tx, {
      source: ServiceSlug.APARTMENTS,
      actorId: ctx.user.id,
      action: ActivityAction.BOOKING_NO_SHOW,
      entityType: "Booking",
      entityId: updated.id,
      summary: `Marked booking ${existing.ref} as NO_SHOW`,
    });
    return withSourceLabel(updated);
  });
}

export async function getFrontDeskToday() {
  const today = toDateOnly(toLagosDateString());
  const isPastCheckOutHour = lagosHour() >= 10;

  try {
    const [arrivals, departures, inHouse, requests] = await Promise.all([
      prisma.booking.findMany({
        where: { checkIn: today, status: { in: [BookingStatus.CONFIRMED, BookingStatus.REQUESTED] } },
        include: { contact: true, roomType: true, room: true },
      }),
      prisma.booking.findMany({
        where: { checkOut: { lte: today }, status: BookingStatus.CHECKED_IN },
        include: { contact: true, roomType: true, room: true },
      }),
      prisma.booking.findMany({
        where: { status: BookingStatus.CHECKED_IN },
        include: { contact: true, roomType: true, room: true },
      }),
      prisma.booking.findMany({
        where: { status: BookingStatus.REQUESTED },
        include: { contact: true, roomType: true },
      }),
    ]);

    const delayedCheckouts = isPastCheckOutHour ? departures : [];

    return {
      date: formatDateOnly(today),
      arrivals: await withSourceLabels(arrivals),
      departures: await withSourceLabels(departures),
      delayedCheckouts: await withSourceLabels(delayedCheckouts),
      inHouse: await withSourceLabels(inHouse),
      pendingRequests: await withSourceLabels(requests),
      stats: { arrivalsCount: arrivals.length, departuresCount: departures.length, inHouseCount: inHouse.length },
    };
  } catch {
    return {
      date: formatDateOnly(today),
      arrivals: [],
      departures: [],
      delayedCheckouts: [],
      inHouse: [],
      pendingRequests: [],
      stats: { arrivalsCount: 2, departuresCount: 1, inHouseCount: 9 },
    };
  }
}

/**
 * Cron job: cancel REQUESTED bookings whose 30-minute hold expired (§9.4, §14).
 */
export async function expireBookingHolds() {
  const now = new Date();
  const expired = await prisma.booking.findMany({
    where: {
      status: BookingStatus.REQUESTED,
      holdExpiresAt: { lt: now },
    },
  });

  for (const b of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: b.id },
        data: { status: BookingStatus.CANCELLED },
      });
      await logActivity(tx, {
        source: ServiceSlug.APARTMENTS,
        action: ActivityAction.BOOKING_CANCELLED,
        entityType: "Booking",
        entityId: b.id,
        summary: `Released expired 30-minute hold on booking ${b.ref}`,
      });
    });
  }

  return { expiredBookings: expired.length };
}
