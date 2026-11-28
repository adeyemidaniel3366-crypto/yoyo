// ---------------------------------------------------------------------------
// Zino Luxury Apartments — Master Apartment & Booking Data Model
// ---------------------------------------------------------------------------

import { readProductsStorage } from "./platform-store";
import { ServiceSlug } from "./constants";

export interface ApartmentSuite {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: "Studio" | "1-Bedroom" | "2-Bedroom" | "Penthouse";
  basePriceKobo: number;
  taxPct: number;
  cautionDepositKobo: number;
  adults: number;
  children: number;
  bedrooms: number;
  bathrooms: number;
  bedType: string;
  sizeSqm: number;
  floor: string;
  view: string;
  image: string;
  gallery: string[];
  amenities: string[];
  description: string;
  sleepingArrangements: { room: string; bed: string }[];
  rules: string[];
  availableUnits: number;
  featured?: boolean;
}

export interface ApartmentBooking {
  id: string;
  bookingRef: string;
  suiteId: string;
  suiteName: string;
  suiteImage: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  baseAmountKobo: number;
  taxKobo: number;
  cautionDepositKobo: number;
  totalKobo: number;
  paymentMethod: "PAYSTACK_CARD" | "BANK_TRANSFER" | "PAY_ON_ARRIVAL";
  paymentStatus: "PAID" | "PENDING_ARRIVAL" | "CONFIRMED" | "PENDING_PAYMENT" | "FAILED" | "CANCELLED";
  stayStatus?: "RESERVED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  specialRequests?: string;
  roomNumber?: string;
  createdAt: string;
}

export const APARTMENT_STORAGE_KEYS = {
  SUITES: "zino_custom_apartment_suites_prod_v1",
  BOOKINGS: "zino_apartments_bookings_prod_v1",
};

export const DEFAULT_APARTMENT_SUITES: ApartmentSuite[] = [];

export function getApartmentSuites(): ApartmentSuite[] {
  if (typeof window === "undefined") return DEFAULT_APARTMENT_SUITES;
  try {
    const products = readProductsStorage();
    const storeApartments = products.filter(
      (p) => p.source === ServiceSlug.APARTMENTS && p.status !== "INACTIVE" && p.status !== "ARCHIVED"
    );

    if (storeApartments.length > 0) {
      return storeApartments.map((p) => {
        const cat = (p.name.includes("2-Bedroom")
          ? "2-Bedroom"
          : p.name.includes("1-Bedroom")
          ? "1-Bedroom"
          : p.name.includes("Penthouse")
          ? "Penthouse"
          : "Studio") as ApartmentSuite["category"];
        return {
          id: p.id,
          slug: p.sku ? p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") : p.id,
          name: p.name,
          subtitle: p.label || "Serviced Luxury Apartment",
          category: cat,
          basePriceKobo: p.priceKobo || 3000000,
          taxPct: 10,
          cautionDepositKobo: 2000000,
          adults: cat === "2-Bedroom" ? 4 : 2,
          children: 1,
          bedrooms: cat === "2-Bedroom" ? 2 : 1,
          bathrooms: cat === "2-Bedroom" ? 2 : 1,
          bedType: "1 King-Size Bed (6x6)",
          sizeSqm: 65,
          floor: "2nd Floor",
          view: "Lekki Skyline View",
          image: p.imageUrl || "",
          gallery: p.images && p.images.length > 0 ? p.images : p.imageUrl ? [p.imageUrl] : [],
          amenities: p.amenities || ["Sitout", "AC", "Kitchen", "WiFi", "Bath Heater", "24/7 Power"],
          description: p.description || p.label || "",
          sleepingArrangements: [{ room: "Master Bedroom", bed: "1 King-Size Bed" }],
          rules: ["Check-in: 2:00 PM", "Check-out: 11:00 AM", "Refundable deposit required"],
          availableUnits: p.totalStock || 1,
          featured: p.isFeatured ?? true,
        };
      });
    }

    const raw = localStorage.getItem(APARTMENT_STORAGE_KEYS.SUITES);
    if (!raw) return DEFAULT_APARTMENT_SUITES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}
  return DEFAULT_APARTMENT_SUITES;
}

export function saveApartmentSuite(suite: ApartmentSuite): ApartmentSuite[] {
  if (typeof window === "undefined") return DEFAULT_APARTMENT_SUITES;
  const current = getApartmentSuites();
  const existingIdx = current.findIndex((s) => s.id === suite.id || s.slug === suite.slug);
  let updated: ApartmentSuite[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = suite;
  } else {
    updated = [suite, ...current];
  }
  try {
    localStorage.setItem(APARTMENT_STORAGE_KEYS.SUITES, JSON.stringify(updated));
    window.dispatchEvent(new Event("zino_apartments_update"));
  } catch {}
  return updated;
}

export function deleteApartmentSuite(id: string): ApartmentSuite[] {
  if (typeof window === "undefined") return DEFAULT_APARTMENT_SUITES;
  const current = getApartmentSuites();
  const updated = current.filter((s) => s.id !== id && s.slug !== id);
  try {
    localStorage.setItem(APARTMENT_STORAGE_KEYS.SUITES, JSON.stringify(updated));
    window.dispatchEvent(new Event("zino_apartments_update"));
  } catch {}
  return updated;
}

export function getApartmentBookings(): ApartmentBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APARTMENT_STORAGE_KEYS.BOOKINGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

export function saveApartmentBooking(booking: ApartmentBooking): ApartmentBooking[] {
  if (typeof window === "undefined") return [booking];
  const current = getApartmentBookings();
  const updated = [booking, ...current];
  try {
    localStorage.setItem(APARTMENT_STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event("zino_apartments_bookings_update"));
  } catch {}
  return updated;
}

/** Patches a stored booking by its booking reference. */
export function updateApartmentBooking(
  bookingRef: string,
  patch: Partial<ApartmentBooking>
): ApartmentBooking | null {
  if (typeof window === "undefined" || !bookingRef) return null;
  const current = getApartmentBookings();
  let found: ApartmentBooking | null = null;
  const updated = current.map((b) => {
    if (b.bookingRef === bookingRef) {
      found = { ...b, ...patch };
      return found;
    }
    return b;
  });
  if (!found) return null;
  try {
    localStorage.setItem(APARTMENT_STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event("zino_apartments_bookings_update"));
  } catch {}
  return found;
}

/** Derives the live stay state of a booking for a given day (YYYY-MM-DD). */
export function getBookingStayState(
  b: ApartmentBooking,
  today: string
): "CANCELLED" | "CHECKED_OUT" | "IN_HOUSE" | "ARRIVING_TODAY" | "UPCOMING" | "OVERDUE_CHECKOUT" | "NO_SHOW" {
  if (b.stayStatus === "CANCELLED" || b.paymentStatus === "CANCELLED" || b.paymentStatus === "FAILED") {
    return "CANCELLED";
  }
  if (b.stayStatus === "NO_SHOW") return "NO_SHOW";
  if (b.stayStatus === "CHECKED_OUT") return "CHECKED_OUT";
  if (b.stayStatus === "CHECKED_IN") {
    return b.checkOut < today ? "OVERDUE_CHECKOUT" : "IN_HOUSE";
  }
  if (b.checkIn === today) return "ARRIVING_TODAY";
  if (b.checkIn > today) return "UPCOMING";
  // Past check-in date but never checked in
  return b.checkOut <= today ? "NO_SHOW" : "IN_HOUSE";
}
