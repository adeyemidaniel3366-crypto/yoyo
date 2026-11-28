"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceSlug } from "./constants";
import { formatCurrency } from "./money";
import {
  deleteProductFromBackend,
  syncProductToBackend,
  syncTransactionToBackend,
} from "./api-sync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnifiedProduct {
  id: string;
  source: ServiceSlug;
  sku: string;
  name: string;
  label: string;
  description: string;
  priceKobo: number;
  costKobo?: number;
  priceDisplay: string;
  imageUrl: string;
  images: string[];
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "PROMO" | "INACTIVE" | "ARCHIVED";
  totalStock: number;
  lowStockAt: number;
  isFeatured?: boolean;
  isNew?: boolean;
  capacity?: string;
  amenities?: string[];
  createdAt?: string;
}

export interface UnifiedVisitorLog {
  id: string;
  badgeNo: string;
  name: string;
  phone: string;
  email?: string;
  hostEmployee: string;
  purpose: string;
  visitDate: string;
  visitTime: string;
  appointmentDate?: string;
  appointmentTime?: string;
  checkIn: string;
  checkOut: string | null;
  status: "CHECKED_IN" | "CHECKED_OUT";
}

export interface UnifiedInvoiceActivity {
  id: string;
  source: ServiceSlug;
  activityType: "SALE" | "BOOKING" | "ORDER" | "INVOICE" | "EXPENSE" | "VISIT" | "PAYMENT";
  activitySummary: string;
  invoiceNo: string;
  customer: string;
  amountKobo: number;
  amountDisplay: string;
  status: string;
  location: string;
  createdAt: string;
}

export interface UnifiedActivityLogItem {
  id: string;
  source: ServiceSlug;
  time: string;
  actor: string;
  action: string;
  amount: string | null;
  location: string | null;
}

export interface UnifiedPaymentDue {
  id: string;
  type: "SALES" | "PURCHASE";
  source: ServiceSlug;
  partyName: string;
  referenceNo: string;
  dueAmountKobo: number;
}

export interface UnifiedCartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceKobo: number;
  qty: number;
  image: string;
}

export interface UnifiedPaymentSettings {
  paystack: {
    enabled: boolean;
    publishKey: string;
    secretKey: string;
  };
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
  };
  stripe: {
    enabled: boolean;
    publishKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    merchantAccount: string;
  };
}

export interface UnifiedMonthlyTargets {
  salesTargetKobo: number;
  expenseBudgetKobo: number;
  bookingsTarget: number;
  visitorsTarget: number;
}

// ---------------------------------------------------------------------------
// Clean Production Initial State (Zero Demo Seed Data)
// ---------------------------------------------------------------------------

export const DEFAULT_UNIFIED_PRODUCTS: UnifiedProduct[] = [];
export const DEFAULT_UNIFIED_INVOICES: UnifiedInvoiceActivity[] = [];
export const DEFAULT_UNIFIED_ACTIVITIES: UnifiedActivityLogItem[] = [];
export const DEFAULT_PAYMENT_DUES: UnifiedPaymentDue[] = [];

export const DEFAULT_MONTHLY_TARGETS: UnifiedMonthlyTargets = {
  salesTargetKobo: 0,
  expenseBudgetKobo: 0,
  bookingsTarget: 0,
  visitorsTarget: 0,
};

export const DEFAULT_CART_ITEMS: UnifiedCartItem[] = [];
export const DEFAULT_VISITORS: UnifiedVisitorLog[] = [];
export const DEFAULT_ROOM_STATUSES: Record<string, "AVAILABLE" | "OCCUPIED" | "CLEANING"> = {};

export const DEFAULT_PAYMENT_SETTINGS: UnifiedPaymentSettings = {
  paystack: {
    enabled: false,
    publishKey: "",
    secretKey: "",
  },
  razorpay: {
    enabled: false,
    keyId: "",
    keySecret: "",
  },
  stripe: {
    enabled: false,
    publishKey: "",
    secretKey: "",
  },
  paypal: {
    enabled: false,
    merchantAccount: "",
  },
};

// ---------------------------------------------------------------------------
// Storage Keys & Event Sync
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  PRODUCTS: "zino_unified_catalog_prod_v1",
  DELETED_PRODUCTS: "zino_deleted_product_ids_prod_v1",
  INVOICES: "zino_unified_invoices_prod_v1",
  ACTIVITIES: "zino_unified_activities_prod_v1",
  DUES: "zino_unified_dues_prod_v1",
  TARGETS: "zino_unified_targets_prod_v1",
  CART: "zino_unified_cart_prod_v1",
  VISITORS: "zino_unified_visitors_prod_v1",
  ROOM_STATUSES: "zino_unified_room_statuses_prod_v1",
  GLOBAL_SERVICE_FILTER: "zino_global_service_filter_prod_v1",
  GLOBAL_LOCATION_FILTER: "zino_global_location_filter_prod_v1",
  PAYMENT_SETTINGS: "zino_payment_settings_prod_v1",
};

const STORE_EVENT = "zino-platform-store-sync";

export function readProductsStorage(): UnifiedProduct[] {
  if (typeof window === "undefined") return DEFAULT_UNIFIED_PRODUCTS;
  try {
    const deletedList = readStorage<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
    const deletedSet = new Set(deletedList.map((d) => String(d).toLowerCase()));

    const raw = window.localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as UnifiedProduct[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (p) => !deletedSet.has(p.id.toLowerCase()) && !deletedSet.has(p.sku.toLowerCase())
    );
  } catch {
    return DEFAULT_UNIFIED_PRODUCTS;
  }
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { key } }));
  } catch {
    // Quota or SSR
  }
}

// ---------------------------------------------------------------------------
// Direct Imperative Helpers (callable from any page or handler)
// ---------------------------------------------------------------------------

export function recordPlatformTransaction(params: {
  source: ServiceSlug;
  activityType: UnifiedInvoiceActivity["activityType"];
  activitySummary: string;
  invoiceNo?: string;
  customer: string;
  amountKobo: number;
  status?: string;
  location?: string;
  actor?: string;
  createdAt?: string;
}) {
  const prefixMap: Record<ServiceSlug, string> = {
    [ServiceSlug.SPARK]: "SPK",
    [ServiceSlug.BUILDERS]: "INV",
    [ServiceSlug.APARTMENTS]: "ZINO",
    [ServiceSlug.GALAXY]: "DG",
    [ServiceSlug.BILLSTACKS]: "INV",
    [ServiceSlug.VISITORS]: "VIS",
  };
  const invoiceNo =
    params.invoiceNo ||
    `${prefixMap[params.source]}-${Math.floor(100000 + Math.random() * 900000)}`;
  const amountDisplay =
    params.amountKobo > 0 ? formatCurrency(params.amountKobo) : "Pass Issued";
  const txDate = params.createdAt || new Date().toISOString().slice(0, 10);

  const newInvoice: UnifiedInvoiceActivity = {
    id: `inv_${Date.now()}`,
    source: params.source,
    activityType: params.activityType,
    activitySummary: params.activitySummary,
    invoiceNo,
    customer: params.customer,
    amountKobo: params.amountKobo,
    amountDisplay,
    status: params.status || "PAID",
    location: params.location || "Main Location",
    createdAt: txDate,
  };

  const currentInvoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES);
  writeStorage(STORAGE_KEYS.INVOICES, [newInvoice, ...currentInvoices]);

  const newActivity: UnifiedActivityLogItem = {
    id: `act_${Date.now()}`,
    source: params.source,
    time: params.createdAt ? params.createdAt : "Just now",
    actor: params.actor || params.customer,
    action: `${params.activitySummary} (${invoiceNo})`,
    amount: params.amountKobo > 0 ? amountDisplay : null,
    location: params.location || "Main Location",
  };

  const currentActivities = readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES);
  writeStorage(STORAGE_KEYS.ACTIVITIES, [newActivity, ...currentActivities.slice(0, 29)]);

  // Background optimistic sync to backend API when online
  void syncTransactionToBackend(newInvoice);

  return newInvoice;
}

export function recordVisitorCheckIn(params: {
  badgeNo?: string;
  name: string;
  phone: string;
  email?: string;
  hostEmployee: string;
  purpose: string;
  visitDate?: string;
  visitTime?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}) {
  const badgeNo = params.badgeNo || `VIS-${Math.floor(10000 + Math.random() * 90000)}`;
  const visitDate = params.visitDate || new Date().toISOString().slice(0, 10);
  const appointmentDate = params.appointmentDate || visitDate;
  const now = new Date();
  const fallbackTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const visitTime = params.visitTime || fallbackTime;
  const appointmentTime = params.appointmentTime || visitTime;
  const checkIn = `${visitDate}, ${visitTime}${appointmentTime ? ` (Appt: ${appointmentDate} ${appointmentTime})` : ""}`;

  const newVisitor: UnifiedVisitorLog = {
    id: `vis_${Date.now()}`,
    badgeNo,
    name: params.name,
    phone: params.phone,
    email: params.email,
    hostEmployee: params.hostEmployee,
    purpose: params.purpose,
    visitDate,
    visitTime,
    appointmentDate,
    appointmentTime,
    checkIn,
    checkOut: null,
    status: "CHECKED_IN",
  };

  const currentVisitors = readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
  writeStorage(STORAGE_KEYS.VISITORS, [newVisitor, ...currentVisitors]);

  recordPlatformTransaction({
    source: ServiceSlug.VISITORS,
    activityType: "VISIT",
    activitySummary: `Visitor Check-In (${params.purpose} with ${params.hostEmployee}) — Visit: ${visitDate} ${visitTime} / Appt: ${appointmentDate} ${appointmentTime}`,
    invoiceNo: badgeNo,
    customer: params.name,
    amountKobo: 0,
    location: "HQ Reception Kiosk",
    status: "CHECKED_IN",
    actor: "Front Desk Kiosk",
    createdAt: visitDate,
  });

  return newVisitor;
}

// ---------------------------------------------------------------------------
// React Hook for Unified Platform State
// ---------------------------------------------------------------------------

export function usePlatformStore() {
  const [products, setProducts] = useState<UnifiedProduct[]>(DEFAULT_UNIFIED_PRODUCTS);
  const [invoices, setInvoices] = useState<UnifiedInvoiceActivity[]>(DEFAULT_UNIFIED_INVOICES);
  const [activities, setActivities] = useState<UnifiedActivityLogItem[]>(DEFAULT_UNIFIED_ACTIVITIES);
  const [paymentDues, setPaymentDues] = useState<UnifiedPaymentDue[]>(DEFAULT_PAYMENT_DUES);
  const [targets, setTargets] = useState<UnifiedMonthlyTargets>(DEFAULT_MONTHLY_TARGETS);
  const [cartItems, setCartItems] = useState<UnifiedCartItem[]>(DEFAULT_CART_ITEMS);
  const [visitors, setVisitors] = useState<UnifiedVisitorLog[]>(DEFAULT_VISITORS);
  const [roomStatuses, setRoomStatuses] = useState<Record<string, "AVAILABLE" | "OCCUPIED" | "CLEANING">>(DEFAULT_ROOM_STATUSES);
  const [paymentSettings, setPaymentSettings] = useState<UnifiedPaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [globalServiceFilter, setGlobalServiceFilter] = useState<ServiceSlug | "ALL">("ALL");
  const [globalLocationFilter, setGlobalLocationFilter] = useState<string>("ALL");

  const syncFromStorage = useCallback(() => {
    setProducts(readProductsStorage());
    setInvoices(readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES));
    setActivities(readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES));
    setPaymentDues(readStorage(STORAGE_KEYS.DUES, DEFAULT_PAYMENT_DUES));
    setTargets(readStorage(STORAGE_KEYS.TARGETS, DEFAULT_MONTHLY_TARGETS));
    setCartItems(readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS));
    setVisitors(readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS));
    setRoomStatuses(readStorage(STORAGE_KEYS.ROOM_STATUSES, DEFAULT_ROOM_STATUSES));
    setPaymentSettings(readStorage(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS));
    setGlobalServiceFilter(readStorage(STORAGE_KEYS.GLOBAL_SERVICE_FILTER, "ALL"));
    setGlobalLocationFilter(readStorage(STORAGE_KEYS.GLOBAL_LOCATION_FILTER, "ALL"));
  }, []);

  useEffect(() => {
    syncFromStorage();
    const handleStorage = () => syncFromStorage();
    window.addEventListener(STORE_EVENT, handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(STORE_EVENT, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncFromStorage]);

  const saveProduct = useCallback(
    (product: Partial<UnifiedProduct> & { name: string; source: ServiceSlug }) => {
      const current = readProductsStorage();
      const isExisting = Boolean(product.id && current.some((p) => p.id === product.id));

      // If user adds or re-saves a product, remove its ID/SKU from the deletion blacklist
      const deletedList = readStorage<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
      if (deletedList.length > 0) {
        const idLower = (product.id || "").toLowerCase();
        const skuLower = (product.sku || "").toLowerCase();
        const filteredDeleted = deletedList.filter(
          (d) => d.toLowerCase() !== idLower && d.toLowerCase() !== skuLower
        );
        if (filteredDeleted.length !== deletedList.length) {
          writeStorage(STORAGE_KEYS.DELETED_PRODUCTS, filteredDeleted);
        }
      }

      // Synchronize priceKobo with priceDisplay edits from admin form
      const rawDigits = Number(String(product.priceDisplay || "").replace(/[^0-9]/g, ""));
      const priceKobo =
        rawDigits > 0
          ? rawDigits * 100
          : typeof product.priceKobo === "number" && product.priceKobo > 0
          ? product.priceKobo
          : 0;
      const priceDisplay =
        product.priceDisplay && product.priceDisplay.trim()
          ? product.priceDisplay
          : formatCurrency(priceKobo);
      const primaryImage =
        (product.imageUrl && product.imageUrl.trim()) ||
        (product.images?.[0] && product.images[0].trim()) ||
        "";

      const cleanImages = (product.images || []).filter((img) => Boolean(img && img.trim()));

      const normalized: UnifiedProduct = {
        id: isExisting ? product.id! : `p_${Date.now()}`,
        source: product.source,
        sku: product.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: product.name,
        label: product.label || product.description || "Featured",
        description: product.description || product.label || "",
        priceKobo,
        costKobo: product.costKobo ?? Math.round(priceKobo * 0.75),
        priceDisplay,
        imageUrl: primaryImage,
        images: cleanImages.length > 0 ? cleanImages : primaryImage ? [primaryImage] : [],
        status: product.status || "ACTIVE",
        totalStock: typeof product.totalStock === "number" ? product.totalStock : 15,
        lowStockAt: typeof product.lowStockAt === "number" ? product.lowStockAt : 5,
        isFeatured: product.isFeatured ?? true,
        isNew: product.isNew ?? false,
        capacity: product.capacity,
        amenities: product.amenities,
        createdAt: product.createdAt || new Date().toISOString().slice(0, 10),
      };

      const updated = isExisting
        ? current.map((p) => (p.id === normalized.id ? normalized : p))
        : [normalized, ...current];

      writeStorage(STORAGE_KEYS.PRODUCTS, updated);

      // Also log activity
      const currentActs = readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES);
      const actItem: UnifiedActivityLogItem = {
        id: `act_${Date.now()}`,
        source: normalized.source,
        time: "Just now",
        actor: "Super Admin",
        action: `${isExisting ? "updated" : "added"} product/service "${normalized.name}" (${normalized.label})`,
        amount: normalized.priceDisplay,
        location: "Admin Dashboard",
      };
      writeStorage(STORAGE_KEYS.ACTIVITIES, [actItem, ...currentActs.slice(0, 29)]);

      // Background optimistic sync to backend API when online
      void syncProductToBackend(normalized);

      return normalized;
    },
    []
  );

  const deleteProduct = useCallback((id: string) => {
    const current = readProductsStorage();
    const target = current.find((p) => p.id === id);
    const updated = current.filter((p) => p.id !== id);

    // Permanently record ID and SKU in deletion blacklist
    const deletedList = readStorage<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
    const newDeleted = new Set(deletedList.map((d) => String(d).toLowerCase()));
    newDeleted.add(id.toLowerCase());
    if (target?.sku) {
      newDeleted.add(target.sku.toLowerCase());
    }
    writeStorage(STORAGE_KEYS.DELETED_PRODUCTS, Array.from(newDeleted));

    writeStorage(STORAGE_KEYS.PRODUCTS, updated);

    // Background optimistic sync to backend API when online
    void deleteProductFromBackend(target?.sku || id);

    if (target) {
      const currentActs = readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES);
      writeStorage(STORAGE_KEYS.ACTIVITIES, [
        {
          id: `act_${Date.now()}`,
          source: target.source,
          time: "Just now",
          actor: "Super Admin",
          action: `removed product/service "${target.name}" from website`,
          amount: null,
          location: "Admin Dashboard",
        },
        ...currentActs.slice(0, 29),
      ]);
    }
  }, []);

  const restockProduct = useCallback((id: string, addedQty = 25) => {
    const current = readProductsStorage();
    const updated = current.map((p) => {
      if (p.id !== id) return p;
      const newStock = (p.totalStock || 0) + addedQty;
      return {
        ...p,
        totalStock: newStock,
        status: "ACTIVE" as const,
      };
    });
    writeStorage(STORAGE_KEYS.PRODUCTS, updated);

    const target = current.find((p) => p.id === id);
    if (target) {
      recordPlatformTransaction({
        source: target.source,
        activityType: "EXPENSE",
        activitySummary: `Inventory Restock (+${addedQty} units) — ${target.name}`,
        customer: "Warehouse Restock",
        amountKobo: (target.costKobo || Math.round(target.priceKobo * 0.7)) * addedQty,
        status: "RECEIVED",
        location: "Central Warehouse",
        actor: "Storekeeper / Admin",
      });
    }
  }, []);

  const settlePaymentDue = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.DUES, DEFAULT_PAYMENT_DUES);
    const due = current.find((d) => d.id === id);
    if (!due) return;

    const remaining = current.filter((d) => d.id !== id);
    writeStorage(STORAGE_KEYS.DUES, remaining);

    // Update matching invoice if present
    const currentInvoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES);
    const updatedInvoices = currentInvoices.map((inv) =>
      inv.invoiceNo === due.referenceNo ? { ...inv, status: "PAID" } : inv
    );
    writeStorage(STORAGE_KEYS.INVOICES, updatedInvoices);

    recordPlatformTransaction({
      source: due.source,
      activityType: due.type === "SALES" ? "SALE" : "EXPENSE",
      activitySummary: `${due.type === "SALES" ? "Debtor Payment Received" : "Supplier Balance Settled"} — Ref ${due.referenceNo}`,
      invoiceNo: `${due.referenceNo}-PAY`,
      customer: due.partyName,
      amountKobo: due.dueAmountKobo,
      status: "PAID",
      location: "Accounts Desk",
      actor: "Accountant / Admin",
    });
  }, []);

  const updateTargets = useCallback((newTargets: UnifiedMonthlyTargets) => {
    writeStorage(STORAGE_KEYS.TARGETS, newTargets);
  }, []);

  const updateGlobalServiceFilter = useCallback((service: ServiceSlug | "ALL") => {
    writeStorage(STORAGE_KEYS.GLOBAL_SERVICE_FILTER, service);
  }, []);

  const updateGlobalLocationFilter = useCallback((locationId: string) => {
    writeStorage(STORAGE_KEYS.GLOBAL_LOCATION_FILTER, locationId);
  }, []);

  const addToCart = useCallback(
    (item: { productId: string; name: string; sku: string; priceKobo: number; qty?: number; image: string }) => {
      const current = readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
      const existing = current.find((c) => c.productId === item.productId || c.sku === item.sku);
      const qtyToAdd = item.qty || 1;

      let updated: UnifiedCartItem[];
      if (existing) {
        updated = current.map((c) =>
          c.id === existing.id ? { ...c, qty: c.qty + qtyToAdd } : c
        );
      } else {
        const newItem: UnifiedCartItem = {
          id: `cart_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          priceKobo: item.priceKobo,
          qty: qtyToAdd,
          image: item.image,
        };
        updated = [...current, newItem];
      }
      writeStorage(STORAGE_KEYS.CART, updated);
      return updated;
    },
    []
  );

  const updateCartQty = useCallback((id: string, qty: number) => {
    const current = readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
    if (qty <= 0) {
      const filtered = current.filter((c) => c.id !== id);
      writeStorage(STORAGE_KEYS.CART, filtered);
      return filtered;
    }
    const updated = current.map((c) => (c.id === id ? { ...c, qty } : c));
    writeStorage(STORAGE_KEYS.CART, updated);
    return updated;
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
    const filtered = current.filter((c) => c.id !== id);
    writeStorage(STORAGE_KEYS.CART, filtered);
    return filtered;
  }, []);

  const clearCart = useCallback(() => {
    writeStorage(STORAGE_KEYS.CART, []);
  }, []);

  const addVisitor = useCallback(
    (params: {
      badgeNo?: string;
      name: string;
      phone: string;
      email?: string;
      hostEmployee: string;
      purpose: string;
      visitDate?: string;
      visitTime?: string;
      appointmentDate?: string;
      appointmentTime?: string;
    }) => {
      return recordVisitorCheckIn(params);
    },
    []
  );

  const checkoutVisitor = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const outTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updated = current.map((v) =>
      v.id === id ? { ...v, status: "CHECKED_OUT" as const, checkOut: outTime } : v
    );
    writeStorage(STORAGE_KEYS.VISITORS, updated);
  }, []);

  const deleteVisitor = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    writeStorage(
      STORAGE_KEYS.VISITORS,
      current.filter((v) => v.id !== id)
    );
  }, []);

  const setRoomStatus = useCallback((roomId: string, status: "AVAILABLE" | "OCCUPIED" | "CLEANING") => {
    const current = readStorage(STORAGE_KEYS.ROOM_STATUSES, DEFAULT_ROOM_STATUSES);
    const updated = { ...current, [roomId]: status };
    writeStorage(STORAGE_KEYS.ROOM_STATUSES, updated);
  }, []);

  const toggleRoomStatus = useCallback((roomId: string) => {
    const current = readStorage(STORAGE_KEYS.ROOM_STATUSES, DEFAULT_ROOM_STATUSES);
    const curr = current[roomId] || "AVAILABLE";
    const next = curr === "AVAILABLE" ? "OCCUPIED" : curr === "OCCUPIED" ? "CLEANING" : "AVAILABLE";
    const updated = { ...current, [roomId]: next };
    writeStorage(STORAGE_KEYS.ROOM_STATUSES, updated);
    return next;
  }, []);

  const updatePaymentSettings = useCallback((updated: Partial<UnifiedPaymentSettings>) => {
    const current = readStorage(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS);
    const next: UnifiedPaymentSettings = {
      paystack: { ...current.paystack, ...(updated.paystack || {}) },
      razorpay: { ...current.razorpay, ...(updated.razorpay || {}) },
      stripe: { ...current.stripe, ...(updated.stripe || {}) },
      paypal: { ...current.paypal, ...(updated.paypal || {}) },
    };
    writeStorage(STORAGE_KEYS.PAYMENT_SETTINGS, next);
    setPaymentSettings(next);
    return next;
  }, []);

  return {
    products,
    invoices,
    activities,
    paymentDues,
    targets,
    cartItems,
    visitors,
    roomStatuses,
    paymentSettings,
    globalServiceFilter,
    globalLocationFilter,
    saveProduct,
    deleteProduct,
    restockProduct,
    settlePaymentDue,
    updateTargets,
    updateGlobalServiceFilter,
    updateGlobalLocationFilter,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    addVisitor,
    checkoutVisitor,
    deleteVisitor,
    setRoomStatus,
    toggleRoomStatus,
    updatePaymentSettings,
    recordTransaction: recordPlatformTransaction,
  };
}

export function getPlatformCart(): UnifiedCartItem[] {
  return readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
}

/** Non-hook read of the unified transaction ledger (for helpers & callbacks). */
export function readInvoicesStorage(): UnifiedInvoiceActivity[] {
  return readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES);
}

/**
 * Updates the status of a ledger entry (e.g. PENDING → PAID once the payment
 * gateway confirms settlement). Returns true when an entry was updated.
 */
export function updatePlatformInvoiceStatus(invoiceNo: string, status: string): boolean {
  if (!invoiceNo) return false;
  const current = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES);
  let changed = false;
  const next = current.map((inv) => {
    if (inv.invoiceNo === invoiceNo && inv.status !== status) {
      changed = true;
      return { ...inv, status };
    }
    return inv;
  });
  if (changed) writeStorage(STORAGE_KEYS.INVOICES, next);
  return changed;
}

export function clearPlatformCart(): void {
  writeStorage(STORAGE_KEYS.CART, []);
}
