import { withErrorHandler, ok, requireCronSecret } from "@/lib/api";
import { expirePreRegisters } from "@/lib/services/visitors";
import { expireBookingHolds } from "@/lib/services/bookings";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  requireCronSecret(req);
  const [preRegs, bookings] = await Promise.all([
    expirePreRegisters(),
    expireBookingHolds(),
  ]);
  return ok({ ...preRegs, ...bookings }, 200, requestId);
});

export const GET = POST;
