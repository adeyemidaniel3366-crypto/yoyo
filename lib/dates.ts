// ---------------------------------------------------------------------------
// Zino One — Date Formatting Helpers
// ---------------------------------------------------------------------------

import {
  format,
  formatDistanceToNowStrict,
  isValid,
  parseISO,
} from "date-fns";

/**
 * Safely coerce a value to a Date.
 */
function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date(value);
  }
  return new Date(value);
}

/**
 * Short date — 18/11/2026
 */
export function formatShortDate(value: Date | string | number): string {
  return format(toDate(value), "dd/MM/yyyy");
}

/**
 * Long date — Wed, 18 Nov 2026
 */
export function formatLongDate(value: Date | string | number): string {
  return format(toDate(value), "EEE, dd MMM yyyy");
}

/**
 * Relative time — 2 min ago, 128 days ago
 */
export function formatRelative(value: Date | string | number): string {
  return formatDistanceToNowStrict(toDate(value), { addSuffix: true });
}

/**
 * Date + time — 18 Nov 2026, 10:42 AM
 */
export function formatDateTime(value: Date | string | number): string {
  return format(toDate(value), "dd MMM yyyy, hh:mm a");
}

/**
 * Time only — 10:42 AM
 */
export function formatTime(value: Date | string | number): string {
  return format(toDate(value), "hh:mm a");
}
