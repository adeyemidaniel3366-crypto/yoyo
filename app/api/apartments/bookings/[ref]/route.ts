import { ServiceSlug } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { requireAuth, requireService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { withSourceLabel } from "@/lib/scope";
import { formatNGN } from "@/lib/money";
import { formatDateOnly } from "@/lib/dates";

export const GET = withErrorHandler<{ params: { ref: string } }>(
  async (req, { params }, requestId) => {
    const ctx = await requireAuth(req, requestId);
    await requireService(ctx, ServiceSlug.APARTMENTS);
    const booking = await prisma.booking.findUnique({
      where: { ref: params.ref },
      include: { contact: true, roomType: true, room: true, payments: true },
    });
    if (!booking) throw new NotFoundError("Booking not found");
    return ok(
      await withSourceLabel({
        ...booking,
        checkIn: formatDateOnly(booking.checkIn),
        checkOut: formatDateOnly(booking.checkOut),
        totalDisplay: formatNGN(booking.totalKobo),
      }),
      200,
      requestId
    );
  }
);
