import { BookingStatus, ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok, okList, buildPaginationMeta, parseBody, parseQuery, withIdempotency, hashPayload } from "@/lib/api";
import { getSessionUser, requireAuth, requireService } from "@/lib/auth";
import { listQuerySchema } from "@/lib/validators/common";
import { createBookingSchema } from "@/lib/validators/apartments";
import { createBooking } from "@/lib/services/bookings";
import { prisma } from "@/lib/prisma";
import { withSourceLabels } from "@/lib/scope";
import { formatNGN } from "@/lib/money";
import { formatDateOnly } from "@/lib/dates";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const GET = withErrorHandler(async (req, _ctx, requestId) => {
  const ctx = await requireAuth(req, requestId);
  await requireService(ctx, ServiceSlug.APARTMENTS);
  const q = parseQuery(req, listQuerySchema);
  const where = {
    source: ServiceSlug.APARTMENTS,
    ...(q.status ? { status: q.status as BookingStatus } : {}),
    ...(q.q
      ? {
          OR: [
            { ref: { contains: q.q, mode: "insensitive" as const } },
            { contact: { name: { contains: q.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { contact: true, roomType: true, room: true, payments: true },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    }),
    prisma.booking.count({ where }),
  ]);

  const enriched = await withSourceLabels(
    rows.map((b) => ({
      ...b,
      checkIn: formatDateOnly(b.checkIn),
      checkOut: formatDateOnly(b.checkOut),
      totalDisplay: formatNGN(b.totalKobo),
    }))
  );
  return okList(enriched, buildPaginationMeta(q.page, q.perPage, total), requestId);
});

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.PUBLIC_FORM, getClientIp(req));
  const user = await getSessionUser(req);
  const body = await parseBody(req, createBookingSchema);

  const result = await withIdempotency(req, hashPayload(body), async () => {
    const booking = await createBooking(body, user?.id ?? null);
    return { status: 201, data: booking };
  });

  return ok(result.data, result.status, requestId);
});
