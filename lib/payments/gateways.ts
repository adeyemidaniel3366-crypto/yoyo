// ---------------------------------------------------------------------------
// Zino One — Additional Multi-Gateway Checkout Connectors (Stripe, PayPal, Razorpay)
// Reads credentials from environment variables or PlatformSetting overrides,
// and gracefully falls back to sandbox mock checkout when keys are not configured.
// ---------------------------------------------------------------------------

import { getEnv } from "../env";
import { PaymentError } from "../errors";
import { fromKoboToString } from "../money";
import type { InitPaymentParams } from "./paystack";

export type ExtendedPaymentGateway =
  | "PAYSTACK"
  | "FLUTTERWAVE"
  | "STRIPE"
  | "PAYPAL"
  | "RAZORPAY";

export interface GatewayCredentialsOverride {
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalSecret?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
}

export async function initializeStripePayment(
  params: InitPaymentParams,
  secretKey?: string
): Promise<{ authorizationUrl: string; reference: string; gateway: "STRIPE" }> {
  const env = getEnv();
  const key = secretKey || process.env.STRIPE_SECRET_KEY || "";

  if (!key || key.includes("••••")) {
    return {
      authorizationUrl: `${env.NEXTAUTH_URL}/payments/mock?gateway=STRIPE&reference=${encodeURIComponent(params.reference)}&amount=${params.amountKobo}`,
      reference: params.reference,
      gateway: "STRIPE",
    };
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set(
    "success_url",
    params.callbackUrl ?? `${env.NEXTAUTH_URL}/payments/callback?gateway=STRIPE&reference=${encodeURIComponent(params.reference)}`
  );
  form.set("cancel_url", `${env.NEXTAUTH_URL}/payments/callback?gateway=STRIPE&reference=${encodeURIComponent(params.reference)}&status=cancelled`);
  form.set("customer_email", params.email);
  form.set("client_reference_id", params.reference);
  form.set("line_items[0][price_data][currency]", "ngn");
  form.set("line_items[0][price_data][unit_amount]", String(params.amountKobo));
  form.set("line_items[0][price_data][product_data][name]", `Zino One Payment (${params.reference})`);
  form.set("line_items[0][quantity]", "1");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.url) {
    throw new PaymentError(data.error?.message ?? "Stripe Checkout initialization failed");
  }

  return {
    authorizationUrl: data.url,
    reference: params.reference,
    gateway: "STRIPE",
  };
}

export async function initializePayPalPayment(
  params: InitPaymentParams,
  creds?: { clientId?: string; secret?: string }
): Promise<{ authorizationUrl: string; reference: string; gateway: "PAYPAL" }> {
  const env = getEnv();
  const clientId = creds?.clientId || process.env.PAYPAL_CLIENT_ID || "";
  const secret = creds?.secret || process.env.PAYPAL_CLIENT_SECRET || "";

  if (!clientId || !secret) {
    return {
      authorizationUrl: `${env.NEXTAUTH_URL}/payments/mock?gateway=PAYPAL&reference=${encodeURIComponent(params.reference)}&amount=${params.amountKobo}`,
      reference: params.reference,
      gateway: "PAYPAL",
    };
  }

  const base =
    process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = (await tokenRes.json().catch(() => ({}))) as { access_token?: string };
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new PaymentError("PayPal OAuth authentication failed");
  }

  const orderRes = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.reference,
          amount: {
            currency_code: "USD",
            value: fromKoboToString(params.amountKobo),
          },
        },
      ],
      application_context: {
        return_url: params.callbackUrl ?? `${env.NEXTAUTH_URL}/payments/callback?gateway=PAYPAL&reference=${encodeURIComponent(params.reference)}`,
        cancel_url: `${env.NEXTAUTH_URL}/payments/callback?gateway=PAYPAL&reference=${encodeURIComponent(params.reference)}&status=cancelled`,
      },
    }),
  });

  const orderData = (await orderRes.json().catch(() => ({}))) as {
    links?: Array<{ rel: string; href: string }>;
    message?: string;
  };
  const approveLink = orderData.links?.find((l) => l.rel === "approve")?.href;
  if (!orderRes.ok || !approveLink) {
    throw new PaymentError(orderData.message ?? "PayPal order creation failed");
  }

  return {
    authorizationUrl: approveLink,
    reference: params.reference,
    gateway: "PAYPAL",
  };
}

export async function initializeRazorpayPayment(
  params: InitPaymentParams,
  creds?: { keyId?: string; keySecret?: string }
): Promise<{ authorizationUrl: string; reference: string; gateway: "RAZORPAY" }> {
  const env = getEnv();
  const keyId = creds?.keyId || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = creds?.keySecret || process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    return {
      authorizationUrl: `${env.NEXTAUTH_URL}/payments/mock?gateway=RAZORPAY&reference=${encodeURIComponent(params.reference)}&amount=${params.amountKobo}`,
      reference: params.reference,
      gateway: "RAZORPAY",
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountKobo,
      currency: "INR",
      reference_id: params.reference,
      description: `Zino One Payment (${params.reference})`,
      customer: { email: params.email },
      callback_url: params.callbackUrl ?? `${env.NEXTAUTH_URL}/payments/callback?gateway=RAZORPAY&reference=${encodeURIComponent(params.reference)}`,
      callback_method: "get",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    short_url?: string;
    error?: { description?: string };
  };
  if (!res.ok || !data.short_url) {
    throw new PaymentError(data.error?.description ?? "Razorpay payment link creation failed");
  }

  return {
    authorizationUrl: data.short_url,
    reference: params.reference,
    gateway: "RAZORPAY",
  };
}
