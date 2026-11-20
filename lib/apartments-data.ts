// ---------------------------------------------------------------------------
// Zino Luxury Apartments — Master Apartment & Booking Data Model
// ---------------------------------------------------------------------------

export interface ApartmentSuite {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: "Studio" | "1-Bedroom" | "2-Bedroom" | "Penthouse";
  basePriceKobo: number; // Nightly rate in Kobo (e.g. 5000000 = ₦50,000)
  taxPct: number; // Default 10%
  cautionDepositKobo: number; // Default ₦20,000
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
  paymentStatus: "PAID" | "PENDING_ARRIVAL" | "CONFIRMED";
  specialRequests?: string;
  roomNumber?: string;
  createdAt: string;
}

export const APARTMENT_STORAGE_KEYS = {
  SUITES: "zino_custom_apartment_suites",
  BOOKINGS: "zino_apartments_bookings",
};

export const DEFAULT_APARTMENT_SUITES: ApartmentSuite[] = [
  {
    id: "apt_luxury_2br",
    slug: "luxury-2-bedroom",
    name: "Luxury 2-Bedroom Executive Apartment",
    subtitle: "Premier Serviced Suite with Private Balcony Sitout & Chef Kitchen",
    category: "2-Bedroom",
    basePriceKobo: 5000000, // ₦50,000 / night
    taxPct: 10,
    cautionDepositKobo: 2000000, // ₦20,000
    adults: 4,
    children: 2,
    bedrooms: 2,
    bathrooms: 2,
    bedType: "2 King-Size Beds (6x6 Orthopedic)",
    sizeSqm: 115,
    floor: "3rd Floor, West Wing",
    view: "Lekki Lagoon & Skyline View",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
    ],
    amenities: [
      "Sitout",
      "AC",
      "Kitchen",
      "Bath Heater",
      "Fiber WiFi",
      "24/7 Power",
      "55\" Smart TV",
      "Free Parking",
      "Housekeeping",
    ],
    description:
      "Designed for executives, families, and long-stay travelers demanding unmatched luxury and privacy. Features two lavish master bedrooms with en-suite baths, an open-plan lounge with plush seating, dining area, a private outdoor sitout balcony overlooking Lekki, and a fully fitted gourmet kitchen with high-end appliances.",
    sleepingArrangements: [
      { room: "Master Bedroom 1", bed: "1 King-Size Bed (6x6) with Ensuite Bath" },
      { room: "Master Bedroom 2", bed: "1 King-Size Bed (6x6) with Ensuite Bath" },
      { room: "Living Area", bed: "1 Convertible Plush Sofa Bed" },
    ],
    rules: [
      "Standard Check-in: From 2:00 PM (14:00)",
      "Standard Check-out: By 11:00 AM (11:00)",
      "No smoking indoors (permitted on private balcony)",
      "Refundable caution deposit of ₦20,000 required at check-in",
      "Quiet hours observed from 10:00 PM to 7:00 AM",
    ],
    availableUnits: 4,
    featured: true,
  },
  {
    id: "apt_deluxe_studio",
    slug: "deluxe-studio",
    name: "Deluxe Studio Suite",
    subtitle: "Modern Open-Plan Living with Fitted Kitchenette & 4K Smart TV",
    category: "Studio",
    basePriceKobo: 3000000, // ₦30,000 / night
    taxPct: 10,
    cautionDepositKobo: 1500000, // ₦15,000
    adults: 2,
    children: 1,
    bedrooms: 1,
    bathrooms: 1,
    bedType: "1 King-Size Bed (6x6)",
    sizeSqm: 55,
    floor: "2nd Floor, Garden Wing",
    view: "Courtyard & Garden View",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80",
    ],
    amenities: [
      "AC",
      "Kitchen",
      "Bath Heater",
      "Fiber WiFi",
      "24/7 Power",
      "50\" Smart TV",
      "Work Desk",
    ],
    description:
      "Our most popular studio suite combines aesthetic Scandinavian minimalism with high-grade hospitality comforts. Enjoy a King bed, ergonomic workstation, high-speed fiber internet, private kitchenette, and seamless 24/7 industrial generator power.",
    sleepingArrangements: [
      { room: "Studio Bedroom", bed: "1 King Bed (6x6)" },
      { room: "Living Nook", bed: "1 Reading Lounge Chair" },
    ],
    rules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "Strictly non-smoking suite",
      "Maximum occupancy: 2 Adults + 1 Child",
      "Refundable caution deposit of ₦15,000",
    ],
    availableUnits: 5,
    featured: true,
  },
  {
    id: "apt_exec_1br",
    slug: "executive-1-bedroom",
    name: "Executive 1-Bedroom Apartment",
    subtitle: "Spacious Dedicated Bedroom with Separate Lounge & Private Sitout",
    category: "1-Bedroom",
    basePriceKobo: 4000000, // ₦40,000 / night
    taxPct: 10,
    cautionDepositKobo: 2000000, // ₦20,000
    adults: 2,
    children: 2,
    bedrooms: 1,
    bathrooms: 1,
    bedType: "1 Super King Bed (6x6)",
    sizeSqm: 80,
    floor: "4th Floor, Skyline Wing",
    view: "Lekki Phase 1 Cityscape",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
    ],
    amenities: [
      "Sitout",
      "AC",
      "Kitchen",
      "Bath Heater",
      "Fiber WiFi",
      "24/7 Power",
      "Smart TV",
      "Washing Machine",
    ],
    description:
      "A generous 1-bedroom suite featuring a distinct separation between private sleeping quarters and living/dining room. Includes private sitout terrace, washer/dryer, executive workspace, and full culinary kitchen.",
    sleepingArrangements: [
      { room: "Master Bedroom", bed: "1 Super King Bed (6x6)" },
      { room: "Lounge", bed: "1 Double Pull-Out Sofa" },
    ],
    rules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "Non-smoking indoors",
      "Refundable caution deposit of ₦20,000",
    ],
    availableUnits: 3,
    featured: true,
  },
  {
    id: "apt_classic_studio",
    slug: "classic-studio",
    name: "Classic Studio Apartment",
    subtitle: "Cozy & Efficient Accommodation for Solo Professionals",
    category: "Studio",
    basePriceKobo: 1000000, // ₦10,000 / night
    taxPct: 10,
    cautionDepositKobo: 1000000, // ₦10,000
    adults: 1,
    children: 0,
    bedrooms: 1,
    bathrooms: 1,
    bedType: "1 Queen Bed (4.5x6)",
    sizeSqm: 35,
    floor: "1st Floor, East Wing",
    view: "Quiet Internal Courtyard",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
    ],
    amenities: [
      "AC",
      "Bath Heater",
      "Fiber WiFi",
      "24/7 Power",
      "Work Desk",
      "En-suite Bath",
    ],
    description:
      "An essential, clean, and private studio engineered for solo business travellers needing guaranteed high-speed internet, silent air conditioning, reliable hot water, and 24/7 uninterrupted electricity in Lekki.",
    sleepingArrangements: [
      { room: "Studio Bedroom", bed: "1 Queen Bed" },
    ],
    rules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "Strict single occupancy",
      "Refundable caution deposit of ₦10,000",
    ],
    availableUnits: 4,
    featured: false,
  },
  {
    id: "apt_compact_studio",
    slug: "compact-studio",
    name: "Compact Studio Apartment",
    subtitle: "Smart City Living with Microwave, Fridge & Fiber WiFi",
    category: "Studio",
    basePriceKobo: 2000000, // ₦20,000 / night
    taxPct: 10,
    cautionDepositKobo: 1500000, // ₦15,000
    adults: 2,
    children: 1,
    bedrooms: 1,
    bathrooms: 1,
    bedType: "1 Double Bed (5x6)",
    sizeSqm: 45,
    floor: "2nd Floor, West Wing",
    view: "City Street View",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
    ],
    amenities: [
      "AC",
      "Kitchen",
      "Bath Heater",
      "Fiber WiFi",
      "24/7 Power",
      "Smart TV",
    ],
    description:
      "A smart, compact serviced studio featuring personal food-prep kitchen, microwave, mini-fridge, double bed, smart TV, and hot water heater.",
    sleepingArrangements: [
      { room: "Studio Bedroom", bed: "1 Double Bed (5x6)" },
    ],
    rules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "Non-smoking suite",
      "Refundable caution deposit of ₦15,000",
    ],
    availableUnits: 3,
    featured: false,
  },
];

// Helper functions to read & write suites with fallback to localStorage
export function getApartmentSuites(): ApartmentSuite[] {
  if (typeof window === "undefined") return DEFAULT_APARTMENT_SUITES;
  try {
    const raw = localStorage.getItem(APARTMENT_STORAGE_KEYS.SUITES);
    if (!raw) return DEFAULT_APARTMENT_SUITES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
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

// Bookings Storage Helpers
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
