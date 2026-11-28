// ---------------------------------------------------------------------------
// Zino One — Server-side Payment Gateway Configuration
// Single source of truth for which online gateways are live on this server.
// Secrets are read ONLY from environment variables (never from the browser).
// ---------------------------------------------------------------------------

import { PaymentError } from "../errors";

export type GatewayId = "PAYSTACK" | "FLUTTERWAVE" | "STRIPE" | "PAYPAL" | "RAZORPAY";

export const ALL_GATEWAYS: GatewayId[] = ["PAYSTACK", "FLUTTERWAVE", "STRIPE", "PAYPAL", "RAZORPAY"];

export const GATEWAY_LABELS: Record<GatewayId, string> = {
  PAYSTACK: "Paystack",
  FLUTTERWAVE: "Flutterwave",
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
  RAZORPAY: "Razorpay",
};

export const GATEWAY_METHODS: Record<GatewayId, string> = {
  PAYSTACK: "Card, Bank Transfer, USSD",
  FLUTTERWAVE: "Card, Bank Transfer, USSD, Mobile Money",
  STRIPE: "International Cards, Apple Pay, Google Pay",
  PAYPAL: "PayPal Balance & Linked Cards",
  RAZORPAY: "Cards, UPI, Netbanking",
};

function env(name: string): string {
  return (process.env[name] || "").trim();
}

/** Currency + NGN conversion rate used for gateways that cannot charge NGN directly. */
export function getGatewayCurrency(id: GatewayId): { currency: string; ngnPerUnit: number } {
  switch (id) {
    case "STRIPE": {
      const currency = (env("STRIPE_CURRENCY") || "NGN").toUpperCase();
      return { currency, ngnPerUnit: currency === "NGN" ? 1 : Number(env("STRIPE_NGN_RATE")) || 0 };
    }
    case "PAYPAL": {
      const currency = (env("PAYPAL_CURRENCY") || "USD").toUpperCase();
      return { currency, ngnPerUnit: currency === "NGN" ? 1 : Number(env("PAYPAL_NGN_RATE")) || 0 };
    }
    case "RAZORPAY": {
      const currency = (env("RAZORPAY_CURRENCY") || "INR").toUpperCase();
      return { currency, ngnPerUnit: currency === "NGN" ? 1 : Number(env("RAZORPAY_NGN_RATE")) || 0 };
    }
    default:
      return { currency: "NGN", ngnPerUnit: 1 };
  }
}

/** Converts integer kobo to the gateway currency's minor unit (cents, paise...). */
export function koboToGatewayMinor(id: GatewayId, amountKobo: number): number {
  const { ngnPerUnit } = getGatewayCurrency(id);
  if (!ngnPerUnit) return 0;
  return Math.round(amountKobo / ngnPerUnit);
}

export function isGatewayConfigured(id: GatewayId): boolean {
  switch (id) {
    case "PAYSTACK":
      return Boolean(env("PAYSTACK_SECRET_KEY"));
    case "FLUTTERWAVE":
      return Boolean(env("FLUTTERWAVE_SECRET_KEY"));
    case "STRIPE":
      return Boolean(env("STRIPE_SECRET_KEY")) && getGatewayCurrency("STRIPE").ngnPerUnit > 0;
    case "PAYPAL":
      return (
        Boolean(env("PAYPAL_CLIENT_ID")) &&
        Boolean(env("PAYPAL_CLIENT_SECRET")) &&
        getGatewayCurrency("PAYPAL").ngnPerUnit > 0
      );
    case "RAZORPAY":
      return (
        Boolean(env("RAZORPAY_KEY_ID")) &&
        Boolean(env("RAZORPAY_KEY_SECRET")) &&
        getGatewayCurrency("RAZORPAY").ngnPerUnit > 0
      );
    default:
      return false;
  }
}

/**
 * Sandbox (simulated) checkout is ONLY ever allowed outside production.
 * In production an unconfigured gateway is rejected — payments are never faked.
 */
export function isSandboxAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function assertGatewayAvailable(id: GatewayId): "LIVE" | "SANDBOX" {
  if (isGatewayConfigured(id)) return "LIVE";
  if (isSandboxAllowed()) return "SANDBOX";
  throw new PaymentError(
    `${GATEWAY_LABELS[id]} payments are not configured on this server. Please choose another payment method or contact support.`
  );
}

export function getAppBaseUrl(): string {
  return (env("NEXTAUTH_URL") || env("NEXT_PUBLIC_APP_URL") || "http://localhost:3000").replace(/\/$/, "");
}

export function buildCallbackUrl(id: GatewayId, reference: string, extra?: Record<string, string>): string {
  const qs = new URLSearchParams({ gateway: id, reference, ...(extra || {}) });
  return `${getAppBaseUrl()}/payments/callback?${qs.toString()}`;
}

export function buildSandboxUrl(id: GatewayId, reference: string, amountKobo: number): string {
  const qs = new URLSearchParams({ gateway: id, reference, amount: String(amountKobo) });
  return `${getAppBaseUrl()}/payments/mock?${qs.toString()}`;
}

export function getDefaultGateway(): GatewayId | null {
  const preferred = (env("PAYMENT_GATEWAY_DEFAULT") || "PAYSTACK").toUpperCase() as GatewayId;
  if (ALL_GATEWAYS.includes(preferred) && isGatewayConfigured(preferred)) return preferred;
  const firstLive = ALL_GATEWAYS.find((g) => isGatewayConfigured(g));
  if (firstLive) return firstLive;
  return isSandboxAllowed() ? (ALL_GATEWAYS.includes(preferred) ? preferred : "PAYSTACK") : null;
}

export interface PublicGatewayInfo {
  id: GatewayId;
  name: string;
  methods: string;
  currency: string;
  live: boolean;
  enabled: boolean;
}

export interface PublicPaymentConfig {
  gateways: PublicGatewayInfo[];
  defaultGateway: GatewayId | null;
  sandbox: boolean;
  anyLive: boolean;
}

/** Safe-to-expose gateway status (no secrets). */
export function getPublicPaymentConfig(): PublicPaymentConfig {
  const sandbox = isSandboxAllowed();
  const gateways = ALL_GATEWAYS.map((id) => {
    const live = isGatewayConfigured(id);
    return {
      id,
      name: GATEWAY_LABELS[id],
      methods: GATEWAY_METHODS[id],
      currency: getGatewayCurrency(id).currency,
      live,
      // In development every gateway is usable through the sandbox checkout.
      enabled: live || sandbox,
    };
  });
  return {
    gateways,
    defaultGateway: getDefaultGateway(),
    sandbox,
    anyLive: gateways.some((g) => g.live),
  };
}
