// ---------------------------------------------------------------------------
// Zino One — Date & Africa/Lagos Timezone Helpers (§7.2, §9.8)
// ---------------------------------------------------------------------------

import {
  format,
  formatDistanceToNowStrict,
  isValid,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInCalendarDays,
} from "date-fns";

export const APP_TIMEZONE = "Africa/Lagos"; // UTC+1 (no DST)
const WAT_OFFSET_MS = 60 * 60 * 1000;

function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date(value);
  }
  return new Date(value);
}

/**
 * Convert a YYYY-MM-DD date string (in Africa/Lagos) to UTC start-of-day Date.
 */
export function lagosStartOfDayUTC(dateInput: Date | string): Date {
  const dateStr =
    typeof dateInput === "string"
      ? dateInput.slice(0, 10)
      : toLagosDateString(dateInput);
  // 00:00:00 WAT = previous day 23:00:00 UTC
  return new Date(`${dateStr}T00:00:00+01:00`);
}

/**
 * Convert a YYYY-MM-DD date string (in Africa/Lagos) to UTC end-of-day Date (23:59:59.999 WAT).
 */
export function lagosEndOfDayUTC(dateInput: Date | string): Date {
  const dateStr =
    typeof dateInput === "string"
      ? dateInput.slice(0, 10)
      : toLagosDateString(dateInput);
  return new Date(`${dateStr}T23:59:59.999+01:00`);
}

/**
 * Get YYYY-MM-DD string in Africa/Lagos timezone.
 */
export function toLagosDateString(date: Date = new Date()): string {
  const shifted = new Date(date.getTime() + WAT_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get current hour (0-23) in Africa/Lagos timezone.
 */
export function lagosHour(date: Date = new Date()): number {
  const shifted = new Date(date.getTime() + WAT_OFFSET_MS);
  return shifted.getUTCHours();
}

/**
 * Get current minutes (0-59) in Africa/Lagos timezone.
 */
export function lagosMinute(date: Date = new Date()): number {
  const shifted = new Date(date.getTime() + WAT_OFFSET_MS);
  return shifted.getUTCMinutes();
}

/**
 * Convert a YYYY-MM-DD string to a UTC midnight Date for Prisma @db.Date columns.
 */
export function toDateOnly(dateInput: Date | string): Date {
  const str =
    typeof dateInput === "string"
      ? dateInput.slice(0, 10)
      : dateInput.toISOString().slice(0, 10);
  return new Date(`${str}T00:00:00.000Z`);
}

/**
 * Serialize a @db.Date column as YYYY-MM-DD.
 */
export function formatDateOnly(date: Date | string): string {
  const d = toDate(date);
  return d.toISOString().slice(0, 10);
}

/**
 * Advance a recurring invoice date by frequency.
 */
export function advanceRecurringDate(date: Date, frequency: string): Date {
  switch (frequency.toUpperCase()) {
    case "DAILY":
      return addDays(date, 1);
    case "WEEKLY":
      return addWeeks(date, 1);
    case "BIWEEKLY":
      return addWeeks(date, 2);
    case "MONTHLY":
      return addMonths(date, 1);
    case "QUARTERLY":
      return addMonths(date, 3);
    case "YEARLY":
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return differenceInCalendarDays(checkOut, checkIn);
}

// Existing frontend display helpers
export function formatShortDate(value: Date | string | number): string {
  return format(toDate(value), "dd/MM/yyyy");
}

export function formatLongDate(value: Date | string | number): string {
  return format(toDate(value), "EEE, dd MMM yyyy");
}

export function formatRelative(value: Date | string | number): string {
  return formatDistanceToNowStrict(toDate(value), { addSuffix: true });
}

export function formatDateTime(value: Date | string | number): string {
  return format(toDate(value), "dd MMM yyyy, hh:mm a");
}

export function formatTime(value: Date | string | number): string {
  return format(toDate(value), "hh:mm a");
}
