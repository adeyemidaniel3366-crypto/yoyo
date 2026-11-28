// ---------------------------------------------------------------------------
// Zino One — Stripe, PayPal & Razorpay hosted-checkout connectors
// Credentials come from environment variables only. Every connector supports
// both initialization (redirect URL) and server-side verification so that a
// payment is only ever marked PAID after the gateway itself confirms it.
// ---------------------------------------------------------------------------

import { PaymentError } from "../errors";
import type { InitPaymentParams, VerifyPaymentResult } from "./paystack";
import {
  assertGatewayAvailable,
  buildCallbackUrl,
  buildSandboxUrl,
  getGatewayCurrency,
  koboToGatewayMinor,
  type GatewayId,
} from "./config";

export type ExtendedPaymentGateway = GatewayId;

export interface ExtendedInitResult<G extends GatewayId> {
  authorizationUrl: string;
  reference: string;
  gateway: G;
  /** Gateway-side identifier needed later for verification (session/order/link id). */
  gatewayRef?: string;
}

function minorToKoboOrExpected(
  id: GatewayId,
  paidMinor: number,
  expectedKobo: number
): number {
  // Gateways charging in a foreign currency: if the gateway collected exactly the
  // converted amount we requested, the NGN amount is the expected kobo amount.
  const expectedMinor = koboToGatewayMinor(id, expectedKobo);
  if (paidMinor === expectedMinor) return expectedKobo;
  const { ngnPerUnit } = getGatewayCurrency(id);
  return Math.round(paidMinor * (ngnPerUnit || 1));
}

function requireMinorAmount(id: GatewayId, amountKobo: number): number {
  const minor = koboToGatewayMinor(id, amountKobo);
  if (!minor || minor <= 0) {
    throw new PaymentError(`Amount is too small to be charged via ${id}`);
  }
  return minor;
}

// ── Stripe Checkout ─────────────────────────────────────────────────────────

export async function initializeStripePayment(
  params: InitPaymentParams
): Promise<ExtendedInitResult<"STRIPE">> {
  if (assertGatewayAvailable("STRIPE") === "SANDBOX") {
    return {
      authorizationUrl: buildSandboxUrl("STRIPE", params.reference, params.amountKobo),
      reference: params.reference,
      gateway: "STRIPE",
    };
  }

  const key = process.env.STRIPE_SECRET_KEY as string;
  const { currency } = getGatewayCurrency("STRIPE");
  const unitAmount = requireMinorAmount("STRIPE", params.amountKobo);
  const successUrl = params.callbackUrl ?? buildCallbackUrl("STRIPE", params.reference);

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", successUrl);
  form.set("cancel_url", buildCallbackUrl("STRIPE", params.reference, { status: "cancelled" }));
  form.set("customer_email", params.email);
  form.set("client_reference_id", params.reference);
  form.set("metadata[reference]", params.reference);
  form.set("line_items[0][price_data][currency]", currency.toLowerCase());
  form.set("line_items[0][price_data][unit_amount]", String(unitAmount));
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
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.url || !data.id) {
    throw new PaymentError(data.error?.message ?? "Stripe Checkout initialization failed");
  }

  return { authorizationUrl: data.url, reference: params.reference, gateway: "STRIPE", gatewayRef: data.id };
}

export async function verifyStripePayment(
  sessionId: string | null | undefined,
  expectedKobo: number
): Promise<VerifyPaymentResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new PaymentError("Stripe secret key is not configured");
  if (!sessionId) throw new PaymentError("Stripe checkout session id is missing for this payment");

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    payment_status?: string;
    status?: string;
    amount_total?: number;
    payment_intent?: string;
    error?: { message?: string };
  };
  if (!res.ok) throw new PaymentError(data.error?.message ?? "Stripe verification failed");

  const status: VerifyPaymentResult["status"] =
    data.payment_status === "paid"
      ? "PAID"
      : data.status === "expired"
        ? "FAILED"
        : "PENDING";

  return {
    status,
    amountKobo: minorToKoboOrExpected("STRIPE", Number(data.amount_total || 0), expectedKobo),
    paidAt: status === "PAID" ? new Date() : null,
    gatewayRef: sessionId,
  };
}

// ── PayPal Orders v2 ────────────────────────────────────────────────────────

function paypalBase(): string {
  const mode = (process.env.PAYPAL_MODE || "").toLowerCase();
  const live = mode ? mode === "live" : process.env.NODE_ENV === "production";
  return live ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function paypalToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const secret = process.env.PAYPAL_CLIENT_SECRET || "";
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const tokenRes = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = (await tokenRes.json().catch(() => ({}))) as { access_token?: string };
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new PaymentError("PayPal authentication failed — check PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  }
  return tokenData.access_token;
}

export async function initializePayPalPayment(
  params: InitPaymentParams
): Promise<ExtendedInitResult<"PAYPAL">> {
  if (assertGatewayAvailable("PAYPAL") === "SANDBOX") {
    return {
      authorizationUrl: buildSandboxUrl("PAYPAL", params.reference, params.amountKobo),
      reference: params.reference,
      gateway: "PAYPAL",
    };
  }

  const { currency } = getGatewayCurrency("PAYPAL");
  const minor = requireMinorAmount("PAYPAL", params.amountKobo);
  const token = await paypalToken();

  const orderRes = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.reference,
          custom_id: params.reference,
          amount: { currency_code: currency, value: (minor / 100).toFixed(2) },
        },
      ],
      application_context: {
        return_url: params.callbackUrl ?? buildCallbackUrl("PAYPAL", params.reference),
        cancel_url: buildCallbackUrl("PAYPAL", params.reference, { status: "cancelled" }),
        user_action: "PAY_NOW",
      },
    }),
  });

  const orderData = (await orderRes.json().catch(() => ({}))) as {
    id?: string;
    links?: Array<{ rel: string; href: string }>;
    message?: string;
  };
  const approveLink = orderData.links?.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href;
  if (!orderRes.ok || !approveLink || !orderData.id) {
    throw new PaymentError(orderData.message ?? "PayPal order creation failed");
  }

  return { authorizationUrl: approveLink, reference: params.reference, gateway: "PAYPAL", gatewayRef: orderData.id };
}

export async function verifyPayPalPayment(
  orderId: string | null | undefined,
  expectedKobo: number
): Promise<VerifyPaymentResult> {
  if (!orderId) throw new PaymentError("PayPal order id is missing for this payment");
  const token = await paypalToken();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  type PayPalOrder = {
    status?: string;
    purchase_units?: Array<{
      amount?: { value?: string };
      payments?: { captures?: Array<{ id?: string; status?: string; amount?: { value?: string } }> };
    }>;
    message?: string;
  };

  const getRes = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers });
  let order = (await getRes.json().catch(() => ({}))) as PayPalOrder;
  if (!getRes.ok) throw new PaymentError(order.message ?? "PayPal order lookup failed");

  // Buyer approved but funds not yet captured — capture now (idempotent on PayPal side).
  if (order.status === "APPROVED") {
    const capRes = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: { ...headers, "PayPal-Request-Id": `capture-${orderId}` },
    });
    order = (await capRes.json().catch(() => ({}))) as PayPalOrder;
    if (!capRes.ok) throw new PaymentError(order.message ?? "PayPal capture failed");
  }

  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
  const value = capture?.amount?.value ?? order.purchase_units?.[0]?.amount?.value ?? "0";
  const paidMinor = Math.round(parseFloat(value) * 100);
  const status: VerifyPaymentResult["status"] =
    order.status === "COMPLETED" && (!capture || capture.status === "COMPLETED")
      ? "PAID"
      : order.status === "VOIDED"
        ? "FAILED"
        : "PENDING";

  return {
    status,
    amountKobo: minorToKoboOrExpected("PAYPAL", paidMinor, expectedKobo),
    paidAt: status === "PAID" ? new Date() : null,
    gatewayRef: orderId,
  };
}

// ── Razorpay Payment Links ──────────────────────────────────────────────────

function razorpayAuth(): string {
  return Buffer.from(`${process.env.RAZORPAY_KEY_ID || ""}:${process.env.RAZORPAY_KEY_SECRET || ""}`).toString(
    "base64"
  );
}

export async function initializeRazorpayPayment(
  params: InitPaymentParams
): Promise<ExtendedInitResult<"RAZORPAY">> {
  if (assertGatewayAvailable("RAZORPAY") === "SANDBOX") {
    return {
      authorizationUrl: buildSandboxUrl("RAZORPAY", params.reference, params.amountKobo),
      reference: params.reference,
      gateway: "RAZORPAY",
    };
  }

  const { currency } = getGatewayCurrency("RAZORPAY");
  const minor = requireMinorAmount("RAZORPAY", params.amountKobo);

  const res = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${razorpayAuth()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: minor,
      currency,
      reference_id: params.reference,
      description: `Zino One Payment (${params.reference})`,
      customer: { email: params.email },
      callback_url: params.callbackUrl ?? buildCallbackUrl("RAZORPAY", params.reference),
      callback_method: "get",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    short_url?: string;
    error?: { description?: string };
  };
  if (!res.ok || !data.short_url || !data.id) {
    throw new PaymentError(data.error?.description ?? "Razorpay payment link creation failed");
  }

  return { authorizationUrl: data.short_url, reference: params.reference, gateway: "RAZORPAY", gatewayRef: data.id };
}

export async function verifyRazorpayPayment(
  linkId: string | null | undefined,
  expectedKobo: number
): Promise<VerifyPaymentResult> {
  if (!linkId) throw new PaymentError("Razorpay payment link id is missing for this payment");
  const res = await fetch(`https://api.razorpay.com/v1/payment_links/${encodeURIComponent(linkId)}`, {
    headers: { Authorization: `Basic ${razorpayAuth()}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    amount_paid?: number;
    error?: { description?: string };
  };
  if (!res.ok) throw new PaymentError(data.error?.description ?? "Razorpay verification failed");

  const status: VerifyPaymentResult["status"] =
    data.status === "paid"
      ? "PAID"
      : data.status === "cancelled" || data.status === "expired"
        ? "FAILED"
        : "PENDING";

  return {
    status,
    amountKobo: minorToKoboOrExpected("RAZORPAY", Number(data.amount_paid || 0), expectedKobo),
    paidAt: status === "PAID" ? new Date() : null,
    gatewayRef: linkId,
  };
}
