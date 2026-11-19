import crypto from "crypto";
import { ServiceSlug } from "@prisma/client";
import { getEnv } from "../env";
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

export type PaymentGateway = "PAYSTACK" | "FLUTTERWAVE";

export function generatePaymentReference(service: ServiceSlug): string {
  const rand = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `Z1-${service}-${rand}`;
}

export async function initializePayment(
  params: InitPaymentParams,
  gateway?: PaymentGateway
): Promise<{ authorizationUrl: string; reference: string; gateway: PaymentGateway }> {
  const chosen = gateway ?? getEnv().PAYMENT_GATEWAY_DEFAULT;
  if (chosen === "FLUTTERWAVE") {
    return initializeFlutterwavePayment(params);
  }
  return initializePaystackPayment(params);
}

export async function verifyPayment(
  reference: string,
  gateway?: PaymentGateway
): Promise<VerifyPaymentResult> {
  const chosen = gateway ?? getEnv().PAYMENT_GATEWAY_DEFAULT;
  if (chosen === "FLUTTERWAVE") {
    return verifyFlutterwavePayment(reference);
  }
  return verifyPaystackPayment(reference);
}
