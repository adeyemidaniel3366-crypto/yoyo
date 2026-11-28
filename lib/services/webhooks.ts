// ---------------------------------------------------------------------------
// Zino One — Payment Settlement & Webhook Processing (§10.2, §10.3)
// Idempotent settlement, deduplication via WebhookEvent, amount verification.
// ---------------------------------------------------------------------------

import {
  BookingStatus,
  InvoiceStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
  Role,
  ServiceSlug,
} from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError, PaymentError } from "../errors";
import { addKobo, formatNGN } from "../money";
import { deriveInvoiceStatus } from "./invoicing";
import { logActivity } from "./activity";
import { ActivityAction } from "../activity-actions";
import { notify } from "./notifications";
import { sendEmail } from "../email/transporter";
import { renderEmailTemplate } from "../email/templates";
import { normalizeGateway, verifyPayment, type PaymentGateway } from "../payments";
import { isGatewayConfigured, isSandboxAllowed } from "../payments/config";
import { logger } from "../logger";

export async function settlePaymentByReference(params: {
  reference: string;
  paidAmountKobo: number;
  gateway: PaymentGateway;
  gatewayRef?: string;
  eventStatus: "PAID" | "FAILED" | "REFUNDED";
}) {
  const payment = await prisma.payment.findUnique({
    where: { reference: params.reference },
    include: { contact: true, invoice: { include: { payments: true } }, booking: true, order: true },
  });

  if (!payment) {
    logger.warn({ reference: params.reference }, "Webhook payment reference not found");
    return { settled: false, reason: "NOT_FOUND" };
  }

  // Idempotent: already settled (§10.2)
  if (payment.status === PaymentStatus.PAID && params.eventStatus === "PAID") {
    return { settled: true, alreadySettled: true, payment };
  }

  // Reject amount mismatch — never settle a short payment silently (§10.3)
  if (params.eventStatus === "PAID" && params.paidAmountKobo !== payment.amountKobo) {
    await prisma.$transaction(async (tx) => {
      await logActivity(tx, {
        source: payment.source,
        action: ActivityAction.SYSTEM_WEBHOOK_MISMATCH,
        entityType: "Payment",
        entityId: payment.id,
        summary: `Payment amount mismatch for ${params.reference}: expected ${formatNGN(payment.amountKobo)}, gateway sent ${formatNGN(params.paidAmountKobo)}`,
        amountKobo: params.paidAmountKobo,
      });
    });

    void notify({
      roles: [Role.SUPER_ADMIN, Role.ACCOUNTANT],
      source: payment.source,
      title: `Payment Amount Mismatch — ${params.reference}`,
      body: `Expected ${formatNGN(payment.amountKobo)}, received ${formatNGN(params.paidAmountKobo)} via ${params.gateway}. Payment was NOT settled.`,
      entityType: "Payment",
      entityId: payment.id,
      channels: ["IN_APP", "EMAIL"],
      critical: true,
    });

    return { settled: false, reason: "AMOUNT_MISMATCH" };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const nextPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: params.eventStatus as PaymentStatus,
        gateway: params.gateway,
        gatewayRef: params.gatewayRef ?? payment.gatewayRef,
      },
    });

    if (params.eventStatus === "PAID") {
      if (payment.invoiceId && payment.invoice) {
        const prevPaid = payment.invoice.payments
          .filter((p) => p.status === PaymentStatus.PAID && p.id !== payment.id)
          .reduce((a, p) => addKobo(a, p.amountKobo), 0);
        const totalPaid = addKobo(prevPaid, payment.amountKobo);
        const nextInvStatus = deriveInvoiceStatus(
          payment.invoice.totalKobo,
          totalPaid,
          payment.invoice.status
        );
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: nextInvStatus },
        });
      }

      if (payment.bookingId && payment.booking) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            holdExpiresAt: null,
          },
        });
      }

      if (payment.orderId && payment.order) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status:
              payment.order.status === OrderStatus.PENDING
                ? OrderStatus.CONFIRMED
                : payment.order.status,
            paidAt: new Date(),
          },
        });
      }

      await logActivity(tx, {
        source: payment.source,
        action: ActivityAction.PAYMENT_RECORDED,
        entityType: "Payment",
        entityId: payment.id,
        summary: `Online payment of ${formatNGN(payment.amountKobo)} settled via ${params.gateway} (${params.reference})`,
        amountKobo: payment.amountKobo,
      });
    } else if (params.eventStatus === "FAILED") {
      if (payment.orderId) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
      }
      await logActivity(tx, {
        source: payment.source,
        action: ActivityAction.PAYMENT_FAILED,
        entityType: "Payment",
        entityId: payment.id,
        summary: `Online payment failed via ${params.gateway} (${params.reference})`,
        amountKobo: payment.amountKobo,
      });
    }

    return nextPayment;
  });

  if (params.eventStatus === "PAID" && payment.contact.email) {
    const rendered = renderEmailTemplate("payment-receipt", payment.source, {
      contactName: payment.contact.name,
      amountDisplay: formatNGN(payment.amountKobo),
      method: params.gateway,
      reference: params.reference,
    });
    void sendEmail({ to: payment.contact.email, ...rendered });
  }

  if (params.eventStatus === "FAILED") {
    void notify({
      roles: [Role.ACCOUNTANT, Role.SERVICE_MANAGER],
      source: payment.source,
      title: `Payment Failed — ${params.reference}`,
      body: `Payment of ${formatNGN(payment.amountKobo)} via ${params.gateway} failed.`,
      entityType: "Payment",
      entityId: payment.id,
      channels: ["IN_APP"],
    });
  }

  return { settled: params.eventStatus === "PAID", payment: updated };
}

export async function recordWebhookEventOnce(params: {
  gateway: PaymentGateway;
  eventId: string;
  eventType: string;
  payload: unknown;
}): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({
      data: {
        gateway: params.gateway,
        eventId: params.eventId,
        eventType: params.eventType,
        payload: params.payload as Prisma.InputJsonValue,
        processedAt: new Date(),
      },
    });
    return true;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return false; // Duplicate event — already processed
    }
    throw err;
  }
}

export async function verifyAndSettlePayment(
  reference: string,
  mockStatus?: string
) {
  let payment = null;
  try {
    payment = await prisma.payment.findUnique({ where: { reference } });
  } catch {
    // DB offline fallback for sandbox mock checkouts
    if (process.env.NODE_ENV !== "production" && mockStatus === "PAID") {
      return {
        reference,
        status: PaymentStatus.PAID,
        amountKobo: 0,
        amountDisplay: formatNGN(0),
        sandbox: true,
      };
    }
    throw new NotFoundError("Payment reference not found");
  }

  if (!payment) {
    if (process.env.NODE_ENV !== "production" && mockStatus === "PAID") {
      return {
        reference,
        status: PaymentStatus.PAID,
        amountKobo: 0,
        amountDisplay: formatNGN(0),
        sandbox: true,
      };
    }
    throw new NotFoundError("Payment reference not found");
  }
  if (payment.status === PaymentStatus.PAID) {
    return {
      reference,
      status: payment.status,
      amountKobo: payment.amountKobo,
      amountDisplay: formatNGN(payment.amountKobo),
      alreadySettled: true,
    };
  }

  const gateway = normalizeGateway(payment.gateway);
  const hasGatewayKey = isGatewayConfigured(gateway);

  // Allow sandbox mock settlement ONLY when not in production and keys aren't configured
  if (!hasGatewayKey && isSandboxAllowed() && mockStatus === "PAID") {
    const res = await settlePaymentByReference({
      reference,
      paidAmountKobo: payment.amountKobo,
      gateway,
      gatewayRef: `MOCK-${Date.now()}`,
      eventStatus: "PAID",
    });
    return {
      reference,
      status: res.settled ? PaymentStatus.PAID : PaymentStatus.PENDING,
      amountKobo: payment.amountKobo,
      amountDisplay: formatNGN(payment.amountKobo),
      sandbox: true,
    };
  }

  if (!hasGatewayKey) {
    // Live keys missing and sandbox not requested/allowed: nothing can be verified.
    return {
      reference,
      status: payment.status,
      amountKobo: payment.amountKobo,
      amountDisplay: formatNGN(payment.amountKobo),
    };
  }

  const verification = await verifyPayment(reference, gateway, {
    gatewayRef: payment.gatewayRef,
    expectedKobo: payment.amountKobo,
  });

  if (verification.status === "FAILED") {
    await settlePaymentByReference({
      reference,
      paidAmountKobo: verification.amountKobo,
      gateway,
      gatewayRef: verification.gatewayRef,
      eventStatus: "FAILED",
    });
  }

  if (verification.status === "PAID") {
    const res = await settlePaymentByReference({
      reference,
      paidAmountKobo: verification.amountKobo,
      gateway,
      gatewayRef: verification.gatewayRef,
      eventStatus: "PAID",
    });
    if (!res.settled) {
      throw new PaymentError(`Payment verification failed: ${res.reason}`);
    }
    return {
      reference,
      status: PaymentStatus.PAID,
      amountKobo: payment.amountKobo,
      amountDisplay: formatNGN(payment.amountKobo),
    };
  }

  return {
    reference,
    status: verification.status,
    amountKobo: payment.amountKobo,
    amountDisplay: formatNGN(payment.amountKobo),
  };
}
