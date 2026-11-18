// ---------------------------------------------------------------------------
// Zino One — Platform Constants (Locked Spec)
// ---------------------------------------------------------------------------

export const PLATFORM_NAME =
  process.env.NEXT_PUBLIC_PLATFORM_NAME || "Zino One";

// ---------------------------------------------------------------------------
// Service slugs (Locked)
// ---------------------------------------------------------------------------
export enum ServiceSlug {
  BILLSTACKS = "BILLSTACKS",
  BUILDERS = "BUILDERS",
  SPARK = "SPARK",
  APARTMENTS = "APARTMENTS",
  GALAXY = "GALAXY",
  VISITORS = "VISITORS",
}

// ---------------------------------------------------------------------------
// Service configuration
// ---------------------------------------------------------------------------
export interface ServiceConfigEntry {
  name: string;
  shortName: string;
  color: string;
  tintBg: string;
  darkColor: string;
  icon: string; // Lucide icon name
  publicRoute: string;
  adminRoute: string;
}

export const SERVICE_CONFIG: Record<ServiceSlug, ServiceConfigEntry> = {
  [ServiceSlug.BILLSTACKS]: {
    name: "Billstacks",
    shortName: "Billstacks",
    color: "#28A745",
    tintBg: "#E8F5EE",
    darkColor: "#1b6d2f",
    icon: "Receipt",
    publicRoute: "/billstacks",
    adminRoute: "/admin/billstacks",
  },
  [ServiceSlug.BUILDERS]: {
    name: "Top Builders",
    shortName: "Builders",
    color: "#006B3F",
    tintBg: "#E8F5EE",
    darkColor: "#004d2c",
    icon: "Hammer",
    publicRoute: "/builders",
    adminRoute: "/admin/builders",
  },
  [ServiceSlug.SPARK]: {
    name: "Zino Spark",
    shortName: "Spark",
    color: "#2563EB",
    tintBg: "#E8EEFB",
    darkColor: "#1d4ed8",
    icon: "Cpu",
    publicRoute: "/spark",
    adminRoute: "/admin/spark",
  },
  [ServiceSlug.APARTMENTS]: {
    name: "Zino Apartments",
    shortName: "Apartments",
    color: "#1E3A5F",
    tintBg: "#E8EEF5",
    darkColor: "#13253d",
    icon: "Building2",
    publicRoute: "/apartments",
    adminRoute: "/admin/apartments",
  },
  [ServiceSlug.GALAXY]: {
    name: "Device Galaxy",
    shortName: "Galaxy",
    color: "#E74C3C",
    tintBg: "#FDF2F2",
    darkColor: "#c0392b",
    icon: "Smartphone",
    publicRoute: "/shop",
    adminRoute: "/admin/galaxy",
  },
  [ServiceSlug.VISITORS]: {
    name: "Visitor Management",
    shortName: "Visitors",
    color: "#7C3AED",
    tintBg: "#F3EFFF",
    darkColor: "#5b21b6",
    icon: "UserCheck",
    publicRoute: "/visit",
    adminRoute: "/admin/visitors",
  },
};

// ---------------------------------------------------------------------------
// Locations (Locked seed list from §11.3, §11.4, §14)
// ---------------------------------------------------------------------------
export interface Location {
  id: string;
  name: string;
  shortCode: string;
  type: string;
  services: ServiceSlug[];
  address: string;
}

export const LOCATIONS: Location[] = [
  {
    id: "loc_spark_adepele",
    name: "Zino Spark Adepele",
    shortCode: "ADE",
    type: "Shop",
    services: [ServiceSlug.SPARK],
    address: "Adepele Street, Computer Village, Ikeja, Lagos",
  },
  {
    id: "loc_spark_medical",
    name: "Zino Spark Medical Road",
    shortCode: "MED",
    type: "Shop",
    services: [ServiceSlug.SPARK],
    address: "Medical Road, Computer Village, Ikeja, Lagos",
  },
  {
    id: "loc_spark_olayeni",
    name: "Zino Spark Olayeni Shop",
    shortCode: "OLA",
    type: "Shop",
    services: [ServiceSlug.SPARK],
    address: "Olayeni Street, Computer Village, Ikeja, Lagos",
  },
  {
    id: "loc_spark_wh",
    name: "Warehouse — Asset Corps Plaza Computer Village",
    shortCode: "WH",
    type: "Warehouse",
    services: [ServiceSlug.SPARK],
    address: "Asset Corps Plaza, Computer Village, Ikeja, Lagos",
  },
  {
    id: "loc_spark_oga",
    name: "Oga's Office (Olayeni)",
    shortCode: "OGA",
    type: "Office",
    services: [ServiceSlug.SPARK],
    address: "Olayeni Street, Ikeja, Lagos",
  },
  {
    id: "loc_apartments_main",
    name: "Zino Service Apartment — MAIN",
    shortCode: "APT",
    type: "Property",
    services: [ServiceSlug.APARTMENTS],
    address: "Plot 12, Lekki Phase 1, Lagos",
  },
  {
    id: "loc_galaxy_online",
    name: "Galaxy Online",
    shortCode: "ONL",
    type: "Online",
    services: [ServiceSlug.GALAXY],
    address: "Virtual Warehouse / E-commerce Hub",
  },
  {
    id: "loc_builders_yard",
    name: "Top Builders Yard",
    shortCode: "YRD",
    type: "Yard",
    services: [ServiceSlug.BUILDERS],
    address: "Alaba Rago / LASU Gate Corridor, Ojo, Lagos",
  },
];

// ---------------------------------------------------------------------------
// Roles (Locked §9.2)
// ---------------------------------------------------------------------------
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  SERVICE_MANAGER = "SERVICE_MANAGER",
  ACCOUNTANT = "ACCOUNTANT",
  CASHIER = "CASHIER",
  RECEPTION = "RECEPTION",
  STOREKEEPER = "STOREKEEPER",
  EMPLOYEE = "EMPLOYEE",
  CUSTOMER = "CUSTOMER",
}

// ---------------------------------------------------------------------------
// Status Enums (Aligned with Prisma Schema)
// ---------------------------------------------------------------------------
export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  PART_PAID = "PART_PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum SaleStatus {
  PAID = "PAID",
  PART_PAID = "PART_PAID",
  UNPAID = "UNPAID",
  RETURNED = "RETURNED",
  VOID = "VOID",
}

export enum BookingStatus {
  REQUESTED = "REQUESTED",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum VisitStatus {
  EXPECTED = "EXPECTED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIAL = "PARTIAL",
}

// ---------------------------------------------------------------------------
// Status → color mapping
// ---------------------------------------------------------------------------
interface StatusColor {
  bg: string;
  text: string;
  dot: string;
  label?: string;
}

const STATUS_COLORS: Record<string, StatusColor> = {
  // Paid / Confirmed / Active / Checked in / Delivered (Success Green)
  PAID: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Paid" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Confirmed" },
  CHECKED_IN: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Checked-in" },
  CHECKED_OUT: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: "Checked-out" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Delivered" },
  SHIPPED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Shipped" },
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  AVAILABLE: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Available" },
  PRESENT: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Present" },

  // Warnings / Pending / Part paid (Yellow/Amber)
  PART_PAID: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Part paid" },
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  REQUESTED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Requested" },
  PROCESSING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Processing" },
  EXPECTED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Expected" },
  LOW_STOCK: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Low stock" },
  LATE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Late" },

  // Danger / Unpaid / Overdue / Cancelled (Red)
  UNPAID: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Unpaid" },
  OVERDUE: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Overdue" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Cancelled" },
  RETURNED: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Returned" },
  VOID: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Void" },
  FAILED: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Failed" },
  NO_SHOW: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "No Show" },
  OUT_OF_STOCK: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Out of stock" },
  ABSENT: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Absent" },

  // Grey / Draft / Neutral
  DRAFT: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: "Draft" },
  SENT: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Sent" },
  ARCHIVED: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: "Archived" },
  OCCUPIED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Occupied" },
  CLEANING: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", label: "Cleaning" },
  MAINTENANCE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Maintenance" },
};

const DEFAULT_STATUS_COLOR: StatusColor = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  dot: "bg-gray-400",
  label: "Unknown",
};

export function getStatusColor(status: string): StatusColor {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return STATUS_COLORS[normalized] ?? {
    ...DEFAULT_STATUS_COLOR,
    label: status,
  };
}
