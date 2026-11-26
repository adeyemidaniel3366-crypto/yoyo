import { ServiceSlug, PaymentStatus } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  generatePaymentReference,
  initializePayment,
} from "@/lib/payments";
import {
  initializePayPalPayment,
  initializeRazorpayPayment,
  initializeStripePayment,
  type ExtendedPaymentGateway,
} from "@/lib/payments/gateways";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req, _ctx, requestId) => {
  await enforceRateLimit(RATE_LIMITS.PUBLIC_FORM, getClientIp(req));
  const user = await getSessionUser(req);

  const body = await req.json().catch(() => null);
  if (!body) {
    throw new ValidationError("Request body is required");
  }

  const amountKobo = Math.trunc(Number(body.amountKobo ?? 0));
  if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
    throw new ValidationError("Positive amountKobo is required");
  }

  const email = String(body.email || user?.email || "client@zinoone.com")
    .trim()
    .toLowerCase();
  const gateway = String(body.gateway || "PAYSTACK").toUpperCase() as ExtendedPaymentGateway;
  const source = Object.values(ServiceSlug).includes(body.source)
    ? (body.source as ServiceSlug)
    : ServiceSlug.BILLSTACKS;
  const reference = String(body.reference || generatePaymentReference(source));
  const callbackUrl =
    typeof body.callbackUrl === "string" && body.callbackUrl.trim()
      ? body.callbackUrl.trim()
      : undefined;

  let result: { authorizationUrl: string; reference: string; gateway: string };

  if (gateway === "STRIPE") {
    result = await initializeStripePayment({
      amountKobo,
      email,
      reference,
      callbackUrl,
      metadata: body.metadata,
    });
  } else if (gateway === "PAYPAL") {
    result = await initializePayPalPayment({
      amountKobo,
      email,
      reference,
      callbackUrl,
      metadata: body.metadata,
    });
  } else if (gateway === "RAZORPAY") {
    result = await initializeRazorpayPayment({
      amountKobo,
      email,
      reference,
      callbackUrl,
      metadata: body.metadata,
    });
  } else {
    result = await initializePayment(
      {
        amountKobo,
        email,
        reference,
        callbackUrl,
        metadata: body.metadata,
      },
      gateway === "FLUTTERWAVE" ? "FLUTTERWAVE" : "PAYSTACK"
    );
  }

  // Optimistically record pending Payment row if DB is reachable
  try {
    let contact = await prisma.contact.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: String(body.customerName || "Online Customer"),
          email,
          sources: [source],
        },
      });
    }

    await prisma.payment.upsert({
      where: { reference },
      update: { gateway: result.gateway },
      create: {
        source,
        contactId: contact.id,
        amountKobo,
        method: "ONLINE",
        reference,
        gateway: result.gateway,
        status: PaymentStatus.PENDING,
        receivedById: user?.id ?? "ONLINE",
        note: body.note || `Online ${result.gateway} checkout`,
      },
    });
  } catch {
    // DB offline / unseeded fallback — gateway initialization still succeeds
  }

  return ok(result, 200, requestId);
});
