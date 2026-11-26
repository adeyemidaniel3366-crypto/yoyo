// ---------------------------------------------------------------------------
// Zino One — Hybrid API Sync & Circuit-Breaker Engine
// Bridges browser localStorage store (usePlatformStore) with Next.js API & PostgreSQL
// ---------------------------------------------------------------------------

import { UnifiedInvoiceActivity, UnifiedProduct, UnifiedVisitorLog } from "./platform-store";
import { ServiceSlug } from "./constants";

export interface BackendHealthStatus {
  ok: boolean;
  db: "up" | "down";
  latencyMs?: number;
  lastChecked: string;
}

let cachedHealth: BackendHealthStatus | null = null;
let lastCheckTimestamp = 0;
const HEALTH_CACHE_TTL_MS = 15000; // 15 seconds cache

/**
 * Fast circuit-breaker health check with a 1,500ms timeout.
 * Prevents UI freezes when PostgreSQL or backend is offline.
 */
export async function probeBackendHealth(): Promise<BackendHealthStatus> {
  const now = Date.now();
  if (cachedHealth && now - lastCheckTimestamp < HEALTH_CACHE_TTL_MS) {
    return cachedHealth;
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch("/api/health", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);
    const isUp = res.ok && json?.ok && json?.data?.db === "up";

    cachedHealth = {
      ok: isUp,
      db: isUp ? "up" : "down",
      latencyMs: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    cachedHealth = {
      ok: false,
      db: "down",
      latencyMs: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  }

  lastCheckTimestamp = Date.now();
  return cachedHealth;
}

/**
 * Computes live financial aggregates directly from store collections.
 * Used as an instant fallback when PostgreSQL / API is unavailable.
 */
export function computeStoreFinancialTotals(
  invoices: UnifiedInvoiceActivity[],
  products: UnifiedProduct[],
  visitors: UnifiedVisitorLog[] = [],
  serviceFilter: ServiceSlug | "ALL" = "ALL"
) {
  const filteredInvoices = serviceFilter === "ALL"
    ? invoices
    : invoices.filter((inv) => inv.source === serviceFilter);

  let totalSalesKobo = 0;
  let totalExpenseKobo = 0;
  let bookingsCount = 0;

  for (const inv of filteredInvoices) {
    const amt = inv.amountKobo || 0;
    if (inv.activityType === "SALE" || inv.activityType === "ORDER") {
      totalSalesKobo += amt;
    } else if (inv.activityType === "BOOKING") {
      totalSalesKobo += amt;
      bookingsCount += 1;
    } else if (inv.activityType === "EXPENSE") {
      totalExpenseKobo += amt;
    } else if (inv.activityType === "INVOICE" && inv.status === "PAID") {
      totalSalesKobo += amt;
    }
  }

  const netProfitKobo = Math.max(0, totalSalesKobo - totalExpenseKobo);

  // Compute live active visitor count
  const activeVisitors = visitors.filter((v) => v.status === "CHECKED_IN").length;

  return {
    totalRevenueKobo: totalSalesKobo,
    totalExpenseKobo,
    netProfitKobo,
    bookingsCount,
    visitorsCount: activeVisitors,
    lowStockCount: products.filter((p) => p.totalStock <= p.lowStockAt).length,
  };
}

/**
 * Background optimistic sync for products
 */
export async function syncProductToBackend(product: Partial<UnifiedProduct>): Promise<boolean> {
  try {
    const health = await probeBackendHealth();
    if (!health.ok) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Background optimistic sync for deleting products
 */
export async function deleteProductFromBackend(idOrSku: string): Promise<boolean> {
  try {
    const health = await probeBackendHealth();
    if (!health.ok) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/products/${encodeURIComponent(idOrSku)}`, {
      method: "DELETE",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Background optimistic sync for platform transactions/sales
 */
export async function syncTransactionToBackend(tx: Partial<UnifiedInvoiceActivity>): Promise<boolean> {
  try {
    const health = await probeBackendHealth();
    if (!health.ok) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}
