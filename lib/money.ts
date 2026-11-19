// ---------------------------------------------------------------------------
// Zino One — Integer Kobo Money Helpers (§5.2)
// All money is stored and computed as integer kobo (1 NGN = 100 kobo).
// Zero float arithmetic on money.
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
 * Convert a naira numeric or string value to integer kobo without float drift.
 */
export function toKobo(naira: number | string): number {
  const str = typeof naira === "number" ? naira.toFixed(2) : naira.trim();
  const negative = str.startsWith("-");
  const clean = negative ? str.slice(1) : str;
  const [wholePart = "0", fracPart = ""] = clean.split(".");
  const whole = parseInt(wholePart || "0", 10);
  const padded = (fracPart + "00").slice(0, 3);
  const fracTwo = parseInt(padded.slice(0, 2), 10);
  const thirdDigit = parseInt(padded.slice(2, 3) || "0", 10);
  const kobo = whole * 100 + fracTwo + (thirdDigit >= 5 ? 1 : 0);
  return negative ? -kobo : kobo;
}

/**
 * Convert integer kobo to a 2-decimal naira string (safe for gateways like Flutterwave).
 */
export function fromKoboToString(kobo: number): string {
  const int = Math.trunc(kobo);
  const negative = int < 0;
  const abs = Math.abs(int);
  const naira = Math.floor(abs / 100);
  const rem = abs % 100;
  return `${negative ? "-" : ""}${naira}.${String(rem).padStart(2, "0")}`;
}

/**
 * Convert integer kobo to naira number (for display formatting only — never for arithmetic).
 */
export function fromKobo(kobo: number): number {
  return Math.trunc(kobo) / 100;
}

/**
 * Integer-only addition of kobo values.
 */
export function addKobo(...amounts: number[]): number {
  let sum = 0;
  for (const a of amounts) {
    if (!Number.isInteger(a)) {
      throw new Error(`Expected integer kobo, got ${a}`);
    }
    sum += a;
  }
  return sum;
}

/**
 * Integer-only subtraction of kobo values.
 */
export function subKobo(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error(`Expected integer kobo, got ${a}, ${b}`);
  }
  return a - b;
}

/**
 * Scale a fractional quantity (up to 2 decimal places) to an integer (qty * 100).
 */
export function qtyScaled(qty: number | string): number {
  const str = typeof qty === "number" ? qty.toFixed(2) : qty.trim();
  const negative = str.startsWith("-");
  const clean = negative ? str.slice(1) : str;
  const [wholePart = "0", fracPart = ""] = clean.split(".");
  const whole = parseInt(wholePart || "0", 10);
  const frac = parseInt((fracPart + "00").slice(0, 2), 10);
  const scaled = whole * 100 + frac;
  return negative ? -scaled : scaled;
}

/**
 * Multiply integer kobo by a scaled numerator / denominator with half-up integer rounding.
 * Example: mulKobo(130000, 750, 10000) for 7.5% tax.
 */
export function mulKobo(kobo: number, numerator: number, denominator: number): number {
  if (!Number.isInteger(kobo) || !Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new Error("mulKobo requires integer arguments");
  }
  if (denominator <= 0) {
    throw new Error("mulKobo denominator must be positive");
  }
  const prod = BigInt(kobo) * BigInt(numerator);
  const den = BigInt(denominator);
  const half = den / BigInt(2);
  if (prod >= BigInt(0)) {
    return Number((prod + half) / den);
  }
  return Number((prod - half) / den);
}

/**
 * Compute line total in integer kobo from fractional qty and integer unitPriceKobo.
 */
export function lineTotalKobo(qty: number | string, unitPriceKobo: number): number {
  const scaled = qtyScaled(qty);
  return mulKobo(unitPriceKobo, scaled, 100);
}

/**
 * Compute per-line tax in integer kobo from line total and tax percentage (e.g. 7.5 -> 750 / 10000).
 */
export function calcTaxKobo(amountKobo: number, taxPct: number | string): number {
  const pctScaled = qtyScaled(taxPct); // 7.5 -> 750
  if (pctScaled === 0) return 0;
  return mulKobo(amountKobo, pctScaled, 10000);
}

/**
 * Format integer kobo as ₦1,300.00
 */
export function formatNGN(amountKobo: number): string {
  return fullFormatter.format(fromKobo(amountKobo));
}

/**
 * Format integer kobo compactly as ₦834,500
 */
export function formatNGNCompact(amountKobo: number): string {
  return compactFormatter.format(fromKobo(amountKobo));
}

// Backwards-compatible aliases used by existing frontend components
export const koboToNaira = fromKobo;
export const nairaToKobo = toKobo;
export const formatCurrency = formatNGN;
export const formatCurrencyCompact = formatNGNCompact;
