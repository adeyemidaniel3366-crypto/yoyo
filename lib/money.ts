// ---------------------------------------------------------------------------
// Zino One — Money Formatting (all amounts stored as integer kobo)
// ---------------------------------------------------------------------------

const fullFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Convert kobo (integer) to naira (decimal).
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Convert naira (decimal) to kobo (integer).
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Format kobo amount as full currency string — ₦1,300.00
 * Best for invoices, receipts, and line items.
 */
export function formatCurrency(amountKobo: number): string {
  return fullFormatter.format(koboToNaira(amountKobo));
}

/**
 * Format kobo amount as compact currency string — ₦834,500
 * Best for dashboard cards and summary stats.
 */
export function formatCurrencyCompact(amountKobo: number): string {
  return compactFormatter.format(koboToNaira(amountKobo));
}
