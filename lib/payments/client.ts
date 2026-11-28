"use client";

// ---------------------------------------------------------------------------
// Zino One — Browser-side online payment orchestration
// 1. Reads which gateways are live from the server (/api/payments/config)
// 2. Starts a hosted checkout via /api/payments/initialize and redirects
// 3. Remembers what the payment was for, so /payments/callback can mark the
//    exact order / booking / invoice as PAID only after server verification.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { ServiceSlug } from "@/lib/constants";
import { recordPlatformTransaction, updatePlatformInvoiceStatus } from "@/lib/platform-store";
import { updateApartmentBooking } from "@/lib/apartments-data";

export type ClientGatewayId = "PAYSTACK" | "FLUTTERWAVE" | "STRIPE" | "PAYPAL" | "RAZORPAY";

export interface ClientGatewayInfo {
  id: ClientGatewayId;
  name: string;
  methods: string;
  currency: string;
  live: boolean;
  enabled: boolean;
}

export interface ClientPaymentConfig {
  gateways: ClientGatewayInfo[];
  defaultGateway: ClientGatewayId | null;
  sandbox: boolean;
  anyLive: boolean;
}

export type PendingPaymentKind =
  | "GALAXY_ORDER"
  | "APARTMENT_BOOKING"
  | "BILLSTACKS_INVOICE"
  | "BILLSTACKS_SUBSCRIPTION"
  | "GENERIC";

export interface PendingPayment {
  reference: string;
  gateway: string;
  kind: PendingPaymentKind;
  source: ServiceSlug;
  amountKobo: number;
  customerName: string;
  /** Ledger invoice number recorded in the platform store (order no / booking ref). */
  invoiceNo?: string;
  bookingRef?: string;
  /** Internal id of the paid entity (e.g. Billstacks invoice id). */
  targetId?: string;
  title?: string;
  returnPath?: string;
  createdAt: string;
  settledStatus?: "PAID" | "FAILED" | "CANCELLED";
}

const PENDING_KEY = "zino_pending_payments_prod_v1";
const SETTLED_KEY = "zino_settled_payments_prod_v1";

const EMPTY_CONFIG: ClientPaymentConfig = {
  gateways: [],
  defaultGateway: null,
  sandbox: false,
  anyLive: false,
};

function readMap(key: string): Record<string, PendingPayment> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(key: string, value: Record<string, PendingPayment>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function savePendingPayment(p: PendingPayment) {
  const map = readMap(PENDING_KEY);
  map[p.reference] = p;
  writeMap(PENDING_KEY, map);
}

export function getPendingPayment(reference: string): PendingPayment | null {
  return readMap(PENDING_KEY)[reference] ?? null;
}

export async function fetchPaymentConfig(): Promise<ClientPaymentConfig> {
  try {
    const res = await fetch("/api/payments/config", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok && json.data) return json.data as ClientPaymentConfig;
  } catch {}
  return EMPTY_CONFIG;
}

export function usePaymentConfig(): { config: ClientPaymentConfig; loading: boolean } {
  const [config, setConfig] = useState<ClientPaymentConfig>(EMPTY_CONFIG);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetchPaymentConfig().then((c) => {
      if (!alive) return;
      setConfig(c);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { config, loading };
}

/** Saves context for a server-initialized payment and redirects to the gateway. */
export function redirectToGateway(
  authorizationUrl: string,
  pending: Omit<PendingPayment, "createdAt">
) {
  savePendingPayment({ ...pending, createdAt: new Date().toISOString() });
  window.location.assign(authorizationUrl);
}

export interface StartPaymentOptions {
  gateway?: ClientGatewayId | null;
  source: ServiceSlug;
  amountKobo: number;
  email: string;
  customerName: string;
  note?: string;
  metadata?: Record<string, unknown>;
  pending: Omit<PendingPayment, "reference" | "gateway" | "createdAt" | "source" | "amountKobo" | "customerName">;
}

/**
 * Initializes a hosted checkout and redirects the browser to it.
 * Throws an Error with a user-facing message if the gateway cannot be started.
 */
export async function startOnlinePayment(opts: StartPaymentOptions): Promise<void> {
  const res = await fetch("/api/payments/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gateway: opts.gateway || undefined,
      source: opts.source,
      amountKobo: Math.round(opts.amountKobo),
      email: opts.email,
      customerName: opts.customerName,
      note: opts.note,
      metadata: opts.metadata,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok || !json?.data?.authorizationUrl) {
    throw new Error(json?.error?.message || "Unable to start online payment. Please try again.");
  }
  redirectToGateway(json.data.authorizationUrl, {
    ...opts.pending,
    reference: json.data.reference,
    gateway: json.data.gateway,
    source: opts.source,
    amountKobo: Math.round(opts.amountKobo),
    customerName: opts.customerName,
  });
}

/**
 * Called by /payments/callback after the SERVER has verified the payment.
 * Applies the confirmed result to the local ledger / booking records.
 */
export function finalizePendingPayment(
  reference: string,
  status: "PAID" | "FAILED" | "CANCELLED"
): PendingPayment | null {
  const pendingMap = readMap(PENDING_KEY);
  const pending = pendingMap[reference];
  if (!pending) return null;

  const ledgerStatus = status === "PAID" ? "PAID" : status === "CANCELLED" ? "CANCELLED" : "FAILED";

  if (pending.invoiceNo) {
    updatePlatformInvoiceStatus(pending.invoiceNo, ledgerStatus);
  }

  if (pending.kind === "APARTMENT_BOOKING" && pending.bookingRef) {
    updateApartmentBooking(pending.bookingRef, {
      paymentStatus: status === "PAID" ? "PAID" : status === "CANCELLED" ? "CANCELLED" : "FAILED",
    });
  }

  if (
    status === "PAID" &&
    (pending.kind === "BILLSTACKS_INVOICE" || pending.kind === "BILLSTACKS_SUBSCRIPTION")
  ) {
    recordPlatformTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "PAYMENT",
      activitySummary: `${pending.title || "Billstacks payment"} paid via ${pending.gateway} (Ref: ${reference})`,
      invoiceNo: reference,
      customer: pending.customerName || "Customer",
      amountKobo: pending.amountKobo,
      location: "Billstacks Cloud",
      status: "PAID",
    });
  }

  // Hand settled Billstacks payments to the Billstacks workspace on next load.
  if (pending.kind === "BILLSTACKS_INVOICE" || pending.kind === "BILLSTACKS_SUBSCRIPTION") {
    const settled = readMap(SETTLED_KEY);
    settled[reference] = { ...pending, settledStatus: status };
    writeMap(SETTLED_KEY, settled);
  }

  delete pendingMap[reference];
  writeMap(PENDING_KEY, pendingMap);
  return { ...pending, settledStatus: status };
}

/** Returns and clears settled payments of the given kinds. */
export function consumeSettledPayments(kinds: PendingPaymentKind[]): PendingPayment[] {
  const settled = readMap(SETTLED_KEY);
  const out: PendingPayment[] = [];
  for (const [ref, p] of Object.entries(settled)) {
    if (kinds.includes(p.kind)) {
      out.push(p);
      delete settled[ref];
    }
  }
  if (out.length) writeMap(SETTLED_KEY, settled);
  return out;
}
