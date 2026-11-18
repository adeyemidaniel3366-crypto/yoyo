// ---------------------------------------------------------------------------
// Zino One — Core TypeScript Types & Interfaces
// ---------------------------------------------------------------------------

import type {
  ServiceSlug as ServiceSlugEnum,
  Role as RoleEnum,
  InvoiceStatus,
  SaleStatus,
  BookingStatus,
  OrderStatus,
  VisitStatus,
  PaymentStatus,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Re-export enum types as union types for convenience
// ---------------------------------------------------------------------------
export type ServiceSlug = `${ServiceSlugEnum}`;
export type Role = `${RoleEnum}`;

// ---------------------------------------------------------------------------
// User / Auth
// ---------------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  serviceSlug: ServiceSlug | null;
  locationId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Contact (Customer / Supplier / Vendor)
// ---------------------------------------------------------------------------
export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  type: "CUSTOMER" | "SUPPLIER" | "VENDOR";
  serviceSlug: ServiceSlug | null;
  locationId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Product / Inventory
// ---------------------------------------------------------------------------
export interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unitPriceKobo: number;
  costPriceKobo: number;
  stockQty: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  serviceSlug: ServiceSlug;
  locationId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Sale
// ---------------------------------------------------------------------------
export interface SaleLineItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  contactId: string | null;
  contactName: string | null;
  serviceSlug: ServiceSlug;
  locationId: string;
  status: `${SaleStatus}`;
  subtotalKobo: number;
  discountKobo: number;
  taxKobo: number;
  totalKobo: number;
  paidKobo: number;
  paymentMethod: string | null;
  items: SaleLineItem[];
  soldById: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------
export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contactId: string;
  contactName: string;
  serviceSlug: ServiceSlug;
  locationId: string;
  status: `${InvoiceStatus}`;
  subtotalKobo: number;
  discountKobo: number;
  taxKobo: number;
  totalKobo: number;
  paidKobo: number;
  dueDate: Date;
  items: InvoiceLineItem[];
  issuedById: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------
export interface Payment {
  id: string;
  referenceNumber: string;
  contactId: string | null;
  contactName: string | null;
  invoiceId: string | null;
  saleId: string | null;
  bookingId: string | null;
  orderId: string | null;
  serviceSlug: ServiceSlug;
  locationId: string;
  status: `${PaymentStatus}`;
  amountKobo: number;
  method: "CASH" | "CARD" | "TRANSFER" | "POS" | "ONLINE" | "MOBILE_MONEY";
  gateway: string | null;
  gatewayRef: string | null;
  receivedById: string | null;
  notes: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Expense
// ---------------------------------------------------------------------------
export interface Expense {
  id: string;
  description: string;
  category: string;
  amountKobo: number;
  serviceSlug: ServiceSlug;
  locationId: string;
  vendorName: string | null;
  receiptUrl: string | null;
  approvedById: string | null;
  submittedById: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  expenseDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Booking (Apartments)
// ---------------------------------------------------------------------------
export interface Booking {
  id: string;
  bookingNumber: string;
  contactId: string;
  contactName: string;
  roomId: string;
  roomName: string;
  locationId: string;
  status: `${BookingStatus}`;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  ratePerNightKobo: number;
  totalKobo: number;
  paidKobo: number;
  guestCount: number;
  specialRequests: string | null;
  bookedById: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Order (Galaxy Kitchen/Bar)
// ---------------------------------------------------------------------------
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
  notes: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  contactId: string | null;
  contactName: string | null;
  locationId: string;
  tableNumber: string | null;
  status: `${OrderStatus}`;
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  subtotalKobo: number;
  discountKobo: number;
  taxKobo: number;
  totalKobo: number;
  paidKobo: number;
  items: OrderItem[];
  servedById: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Visit (Visitors)
// ---------------------------------------------------------------------------
export interface Visit {
  id: string;
  visitorName: string;
  visitorEmail: string | null;
  visitorPhone: string | null;
  visitorCompany: string | null;
  purpose: string;
  hostId: string;
  hostName: string;
  locationId: string;
  status: `${VisitStatus}`;
  badgeNumber: string | null;
  photoUrl: string | null;
  expectedAt: Date | null;
  checkedInAt: Date | null;
  checkedOutAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------
export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  locationId: string;
  clockIn: Date;
  clockOut: Date | null;
  hoursWorked: number | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "HALF_DAY";
  notes: string | null;
  date: Date;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------
export interface DashboardStatCard {
  label: string;
  valueKobo?: number;
  valueCount?: number;
  valueFormatted: string;
  change: number; // percentage change, e.g. 12.5 means +12.5%
  changeLabel: string;
  icon: string;
  color: string;
  tintBg: string;
}

export interface DashboardStats {
  cards: DashboardStatCard[];
  revenueChart: ChartDataPoint[];
  recentActivity: ActivityLog[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

// ---------------------------------------------------------------------------
// Activity Log
// ---------------------------------------------------------------------------
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  action: string;
  description: string;
  entityType: string;
  entityId: string;
  serviceSlug: ServiceSlug | null;
  locationId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  actionUrl: string | null;
  serviceSlug: ServiceSlug | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ---------------------------------------------------------------------------
// Table Filter / Sort Types
// ---------------------------------------------------------------------------
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

export interface FilterConfig {
  column: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";
  value: string | number | boolean | string[];
}

export interface TableState {
  page: number;
  pageSize: number;
  search: string;
  sort: SortConfig | null;
  filters: FilterConfig[];
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}
