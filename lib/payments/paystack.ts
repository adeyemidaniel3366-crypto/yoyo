// ---------------------------------------------------------------------------
// Zino One — Paystack Payment Gateway (§10)
// Amounts in integer kobo. HMAC-SHA512 webhook signature verification.
// ---------------------------------------------------------------------------

import crypto from "crypto";
import { getEnv } from "../env";
import { PaymentError } from "../errors";
import { assertGatewayAvailable, buildCallbackUrl, buildSandboxUrl } from "./config";

export interface InitPaymentParams {
  amountKobo: number;
  email: string;
  reference: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}

export interface InitPaymentResult {
  authorizationUrl: string;
  reference: string;
  gateway: "PAYSTACK";
}

export interface VerifyPaymentResult {
  status: "PAID" | "FAILED" | "PENDING";
  amountKobo: number;
  paidAt: Date | null;
  gatewayRef?: string;
}

export async function initializePaystackPayment(
  params: InitPaymentParams
): Promise<InitPaymentResult> {
  const env = getEnv();
  if (!env.PAYSTACK_SECRET_KEY) {
    // Sandbox checkout is only permitted outside production; production throws.
    assertGatewayAvailable("PAYSTACK");
    return {
      authorizationUrl: buildSandboxUrl("PAYSTACK", params.reference, params.amountKobo),
      reference: params.reference,
      gateway: "PAYSTACK",
    };
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo, // Paystack uses integer kobo directly
      reference: params.reference,
      callback_url: params.callbackUrl ?? buildCallbackUrl("PAYSTACK", params.reference),
      metadata: params.metadata ?? {},
    }),
  });

  const body = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; reference: string };
  };

  if (!res.ok || !body.status || !body.data?.authorization_url) {
    throw new PaymentError(body.message ?? "Paystack initialization failed");
  }

  return {
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference,
    gateway: "PAYSTACK",
  };
}

export async function verifyPaystackPayment(
  reference: string
): Promise<VerifyPaymentResult> {
  const env = getEnv();
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new PaymentError("Paystack secret key is not configured");
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const body = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: {
      status: string;
      amount: number;
      paid_at?: string;
      id?: number | string;
    };
  };

  if (!res.ok || !body.status || !body.data) {
    throw new PaymentError(body.message ?? "Paystack verification failed");
  }

  const mappedStatus =
    body.data.status === "success"
      ? "PAID"
      : body.data.status === "failed" || body.data.status === "abandoned"
        ? "FAILED"
        : "PENDING";

  return {
    status: mappedStatus,
    amountKobo: Math.trunc(body.data.amount),
    paidAt: body.data.paid_at ? new Date(body.data.paid_at) : null,
    gatewayRef: body.data.id ? String(body.data.id) : undefined,
  };
}

export function verifyPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  const env = getEnv();
  if (!signatureHeader || !env.PAYSTACK_SECRET_KEY) return false;
  const expected = crypto
    .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
