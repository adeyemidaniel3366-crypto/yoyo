// ---------------------------------------------------------------------------
// Zino One — Flutterwave Payment Gateway (§10)
// Sends 2-decimal naira strings (never floats). Verifies verif-hash header.
// ---------------------------------------------------------------------------

import crypto from "crypto";
import { getEnv } from "../env";
import { fromKoboToString, toKobo } from "../money";
import { PaymentError } from "../errors";
import type { InitPaymentParams, VerifyPaymentResult } from "./paystack";

export interface FlwInitPaymentResult {
  authorizationUrl: string;
  reference: string;
  gateway: "FLUTTERWAVE";
}

export async function initializeFlutterwavePayment(
  params: InitPaymentParams
): Promise<FlwInitPaymentResult> {
  const env = getEnv();
  if (!env.FLUTTERWAVE_SECRET_KEY) {
    return {
      authorizationUrl: `${env.NEXTAUTH_URL}/payments/mock?gateway=FLUTTERWAVE&reference=${encodeURIComponent(params.reference)}`,
      reference: params.reference,
      gateway: "FLUTTERWAVE",
    };
  }

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.reference,
      amount: fromKoboToString(params.amountKobo),
      currency: "NGN",
      redirect_url: params.callbackUrl ?? `${env.NEXTAUTH_URL}/payments/callback`,
      customer: { email: params.email },
      meta: params.metadata ?? {},
    }),
  });

  const body = (await res.json()) as {
    status: string;
    message?: string;
    data?: { link: string };
  };

  if (!res.ok || body.status !== "success" || !body.data?.link) {
    throw new PaymentError(body.message ?? "Flutterwave initialization failed");
  }

  return {
    authorizationUrl: body.data.link,
    reference: params.reference,
    gateway: "FLUTTERWAVE",
  };
}

export async function verifyFlutterwavePayment(
  reference: string
): Promise<VerifyPaymentResult> {
  const env = getEnv();
  if (!env.FLUTTERWAVE_SECRET_KEY) {
    throw new PaymentError("Flutterwave secret key is not configured");
  }

  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );

  const body = (await res.json()) as {
    status: string;
    message?: string;
    data?: {
      status: string;
      amount: number | string;
      created_at?: string;
      id?: number | string;
    };
  };

  if (!res.ok || body.status !== "success" || !body.data) {
    throw new PaymentError(body.message ?? "Flutterwave verification failed");
  }

  const mappedStatus =
    body.data.status === "successful"
      ? "PAID"
      : body.data.status === "failed"
        ? "FAILED"
        : "PENDING";

  return {
    status: mappedStatus,
    amountKobo: toKobo(body.data.amount),
    paidAt: body.data.created_at ? new Date(body.data.created_at) : null,
    gatewayRef: body.data.id ? String(body.data.id) : undefined,
  };
}

export function verifyFlutterwaveSignature(verifHashHeader: string | null): boolean {
  const env = getEnv();
  if (!verifHashHeader || !env.FLUTTERWAVE_WEBHOOK_SECRET_HASH) return false;
  const a = Buffer.from(env.FLUTTERWAVE_WEBHOOK_SECRET_HASH, "utf8");
  const b = Buffer.from(verifHashHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
