import { ServiceSlug, PaymentStatus } from "@prisma/client";
import { withErrorHandler, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  generatePaymentReference,
  initializePayment,
  normalizeGateway,
} from "@/lib/payments";
import { getAppBaseUrl } from "@/lib/payments/config";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const email = String(body.email || user?.email || "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new ValidationError("A valid email address is required for online payment receipts");
  }

  const gateway = normalizeGateway(body.gateway);
  const source = Object.values(ServiceSlug).includes(body.source)
    ? (body.source as ServiceSlug)
    : ServiceSlug.BILLSTACKS;
  const reference = generatePaymentReference(source);

  // Only allow redirects back to this application (prevents open-redirect abuse).
  const base = getAppBaseUrl();
  const callbackUrl =
    typeof body.callbackUrl === "string" && body.callbackUrl.trim().startsWith(base)
      ? body.callbackUrl.trim()
      : undefined;

  const result = await initializePayment(
    {
      amountKobo,
      email,
      reference,
      callbackUrl,
      metadata: {
        ...(body.metadata && typeof body.metadata === "object" ? body.metadata : {}),
        source,
      },
    },
    gateway
  );

  // Record the pending Payment row so the callback/webhook can verify & settle it.
  try {
    let contact = await prisma.contact.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: String(body.customerName || "Online Customer").slice(0, 120),
          email,
          sources: [source],
        },
      });
    }

    await prisma.payment.upsert({
      where: { reference: result.reference },
      update: { gateway: result.gateway, gatewayRef: result.gatewayRef ?? undefined },
      create: {
        source,
        contactId: contact.id,
        amountKobo,
        method: "ONLINE",
        reference: result.reference,
        gateway: result.gateway,
        gatewayRef: result.gatewayRef ?? null,
        status: PaymentStatus.PENDING,
        receivedById: user?.id ?? "ONLINE",
        note: String(body.note || `Online ${result.gateway} checkout`).slice(0, 500),
      },
    });
  } catch (err) {
    // Without a Payment row the transaction can never be verified — refuse in production.
    if (process.env.NODE_ENV === "production") {
      throw err;
    }
  }

  return ok(result, 200, requestId);
});
