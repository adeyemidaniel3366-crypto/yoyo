import { withErrorHandler, ok } from "@/lib/api";
import { UnauthorizedError } from "@/lib/errors";
import { verifyPaystackSignature } from "@/lib/payments/paystack";
import { recordWebhookEventOnce, settlePaymentByReference } from "@/lib/services/webhooks";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  // Read RAW body first — never parse JSON before signature verification (§10.3)
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    await enforceRateLimit(RATE_LIMITS.WEBHOOK_INVALID, getClientIp(req));
    logger.warn({ ip: getClientIp(req) }, "Invalid Paystack webhook signature");
    throw new UnauthorizedError("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    data?: {
      id?: number | string;
      reference?: string;
      amount?: number;
    };
  };

  const eventType = payload.event ?? "unknown";
  const eventId = `paystack:${payload.data?.id ?? payload.data?.reference ?? Date.now()}:${eventType}`;
  logger.info({ eventId, eventType }, "Received Paystack webhook");

  const isNew = await recordWebhookEventOnce({
    gateway: "PAYSTACK",
    eventId,
    eventType,
    payload: { event: eventType, reference: payload.data?.reference },
  });

  if (!isNew) {
    return ok({ received: true, duplicate: true }, 200, requestId);
  }

  const reference = payload.data?.reference;
  const amountKobo = Math.trunc(Number(payload.data?.amount ?? 0));

  if (reference) {
    if (eventType === "charge.success") {
      await settlePaymentByReference({
        reference,
        paidAmountKobo: amountKobo,
        gateway: "PAYSTACK",
        gatewayRef: payload.data?.id ? String(payload.data.id) : undefined,
        eventStatus: "PAID",
      });
    } else if (eventType === "charge.failed") {
      await settlePaymentByReference({
        reference,
        paidAmountKobo: amountKobo,
        gateway: "PAYSTACK",
        eventStatus: "FAILED",
      });
    } else if (eventType.startsWith("refund.")) {
      await settlePaymentByReference({
        reference,
        paidAmountKobo: amountKobo,
        gateway: "PAYSTACK",
        eventStatus: "REFUNDED",
      });
    }
  }

  return ok({ received: true }, 200, requestId);
});
