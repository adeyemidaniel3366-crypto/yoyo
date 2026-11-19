import { withErrorHandler, ok } from "@/lib/api";
import { UnauthorizedError } from "@/lib/errors";
import { verifyFlutterwaveSignature } from "@/lib/payments/flutterwave";
import { recordWebhookEventOnce, settlePaymentByReference } from "@/lib/services/webhooks";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { toKobo } from "@/lib/money";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  const rawBody = await req.text();
  const verifHash = req.headers.get("verif-hash");

  if (!verifyFlutterwaveSignature(verifHash)) {
    await enforceRateLimit(RATE_LIMITS.WEBHOOK_INVALID, getClientIp(req));
    logger.warn({ ip: getClientIp(req) }, "Invalid Flutterwave webhook signature");
    throw new UnauthorizedError("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    data?: {
      id?: number | string;
      tx_ref?: string;
      amount?: number | string;
      status?: string;
    };
  };

  const eventType = payload.event ?? "charge.completed";
  const eventId = `flw:${payload.data?.id ?? payload.data?.tx_ref ?? Date.now()}:${eventType}`;
  logger.info({ eventId, eventType }, "Received Flutterwave webhook");

  const isNew = await recordWebhookEventOnce({
    gateway: "FLUTTERWAVE",
    eventId,
    eventType,
    payload: { event: eventType, tx_ref: payload.data?.tx_ref },
  });

  if (!isNew) {
    return ok({ received: true, duplicate: true }, 200, requestId);
  }

  const reference = payload.data?.tx_ref;
  const amountKobo = toKobo(payload.data?.amount ?? 0);

  if (reference) {
    if (eventType === "charge.completed" && payload.data?.status === "successful") {
      await settlePaymentByReference({
        reference,
        paidAmountKobo: amountKobo,
        gateway: "FLUTTERWAVE",
        gatewayRef: payload.data?.id ? String(payload.data.id) : undefined,
        eventStatus: "PAID",
      });
    } else if (payload.data?.status === "failed") {
      await settlePaymentByReference({
        reference,
        paidAmountKobo: amountKobo,
        gateway: "FLUTTERWAVE",
        eventStatus: "FAILED",
      });
    }
  }

  return ok({ received: true }, 200, requestId);
});
