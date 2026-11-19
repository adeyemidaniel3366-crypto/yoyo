import { withErrorHandler, ok } from "@/lib/api";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { checkAvailability } from "@/lib/services/bookings";

export const GET = withErrorHandler<{ params: { slug: string } }>(
  async (req, { params }, requestId) => {
    const url = new URL(req.url);
    const checkIn = url.searchParams.get("checkIn");
    const checkOut = url.searchParams.get("checkOut");
    if (!checkIn || !checkOut) {
      throw new ValidationError("checkIn and checkOut query parameters are required");
    }

    const rt = await prisma.roomType.findFirst({
      where: { OR: [{ slug: params.slug }, { id: params.slug }], isActive: true },
    });
    if (!rt) throw new NotFoundError("Room type not found");

    const availability = await checkAvailability(rt.id, checkIn, checkOut);
    return ok({ roomTypeId: rt.id, slug: rt.slug, ...availability }, 200, requestId);
  }
);
