import crypto from "crypto";
import { ServiceSlug } from "@prisma/client";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
  type InitPaymentParams,
  type VerifyPaymentResult,
} from "./paystack";
import {
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
} from "./flutterwave";
import {
  initializePayPalPayment,
  initializeRazorpayPayment,
  initializeStripePayment,
  verifyPayPalPayment,
  verifyRazorpayPayment,
  verifyStripePayment,
} from "./gateways";
import { getDefaultGateway, type GatewayId } from "./config";

export type PaymentGateway = GatewayId;

export interface InitializedPayment {
  authorizationUrl: string;
  reference: string;
  gateway: PaymentGateway;
  gatewayRef?: string;
}

export function generatePaymentReference(service: ServiceSlug): string {
  const rand = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `Z1-${service}-${rand}`;
}

export function normalizeGateway(value: unknown): PaymentGateway {
  const v = String(value || "").toUpperCase();
  if (v === "FLUTTERWAVE" || v === "STRIPE" || v === "PAYPAL" || v === "RAZORPAY" || v === "PAYSTACK") {
    return v;
  }
  return getDefaultGateway() ?? "PAYSTACK";
}

export async function initializePayment(
  params: InitPaymentParams,
  gateway?: PaymentGateway | null
): Promise<InitializedPayment> {
  const chosen = normalizeGateway(gateway);
  switch (chosen) {
    case "FLUTTERWAVE":
      return initializeFlutterwavePayment(params);
    case "STRIPE":
      return initializeStripePayment(params);
    case "PAYPAL":
      return initializePayPalPayment(params);
    case "RAZORPAY":
      return initializeRazorpayPayment(params);
    default:
      return initializePaystackPayment(params);
  }
}

export async function verifyPayment(
  reference: string,
  gateway?: PaymentGateway | null,
  opts?: { gatewayRef?: string | null; expectedKobo?: number }
): Promise<VerifyPaymentResult> {
  const chosen = normalizeGateway(gateway);
  const expectedKobo = opts?.expectedKobo ?? 0;
  switch (chosen) {
    case "FLUTTERWAVE":
      return verifyFlutterwavePayment(reference);
    case "STRIPE":
      return verifyStripePayment(opts?.gatewayRef, expectedKobo);
    case "PAYPAL":
      return verifyPayPalPayment(opts?.gatewayRef, expectedKobo);
    case "RAZORPAY":
      return verifyRazorpayPayment(opts?.gatewayRef, expectedKobo);
    default:
      return verifyPaystackPayment(reference);
  }
}
