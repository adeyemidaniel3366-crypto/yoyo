"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Receipt,
  Package,
  Layers,
  Wallet,
  ClipboardList,
  BedDouble,
  Bell,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Image as ImageIcon,
  Cpu,
  Building2,
  Hammer,
  Smartphone,
  UserCheck,
  Check,
  Trash2,
  ShieldCheck,
  Plus,
  Pencil,
  Save,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { usePlatformStore, UnifiedProduct } from "@/lib/platform-store";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { NumberInput, formatNumbersInText } from "@/components/ui/number-input";

type StaffSection =
  | "dashboard"
  | "low-stock"
  | "invoices"
  | "products"
  | "services"
  | "visitors"
  | "sales-due"
  | "purchase-due"
  | "rooms"
  | "notifications";

interface StaffNotification {
  id: string;
  category:
    | "BOOKING_REQUEST"
    | "LOW_STOCK"
    | "VISITOR_ARRIVAL"
    | "PAYMENT_DUE"
    | "SYSTEM_ALERT";
  title: string;
  detail: string;
  source: ServiceSlug;
  timestamp: string;
  read: boolean;
  targetSection: StaffSection;
}

const INITIAL_NOTIFICATIONS: StaffNotification[] = [];

const VISUAL_SERVICES = [
  {
    slug: ServiceSlug.SPARK,
    title: "Zino Spark — Multi-Shop Retail POS",
    tagline: "5 Electronics Stores across Computer Village, Ikeja",
    description:
      "Fast barcode POS billing, real-time stock alerts across 5 branches, inter-shop stock transfers, and serial tracking.",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&auto=format&fit=crop&q=80",
    icon: Cpu,
    metrics: "5 Branches · POS Terminal",
  },
  {
    slug: ServiceSlug.APARTMENTS,
    title: "Zino Apartments — Luxury Hospitality",
    tagline: "12 Serviced Suites & Front Desk PMS in Lekki",
    description:
      "Public room booking engine, front-desk guest verification, room availability board, and housekeeping status.",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80",
    icon: Building2,
    metrics: "12 Luxury Rooms · Lekki",
  },
  {
    slug: ServiceSlug.BUILDERS,
    title: "Top Builders — Construction Materials",
    tagline: "Bulk Cement, Iron Rods & Daily Sales Book",
    description:
      "High-volume construction supply yard: daily sales book, batch stock sheets, waybill dispatches, and debtors ledger.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80",
    icon: Hammer,
    metrics: "Yard Stock · Dispatch",
  },
  {
    slug: ServiceSlug.GALAXY,
    title: "Device Galaxy — E-Commerce Storefront",
    tagline: "Nationwide Online Gadgets & Storage Marketplace",
    description:
      "Online shopping storefront with product catalog, customer orders, checkout pipeline, and digital receipts.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&auto=format&fit=crop&q=80",
    icon: Smartphone,
    metrics: "Online Store · Fulfillment",
  },
  {
    slug: ServiceSlug.BILLSTACKS,
    title: "Billstacks — Accounting & Invoicing",
    tagline: "B2B Invoicing, Recurring Billing & Tax",
    description:
      "Corporate invoicing suite with automated payment tracking, estimates, recurring billing, and expense logs.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&auto=format&fit=crop&q=80",
    icon: Receipt,
    metrics: "B2B Billing · Tax",
  },
  {
    slug: ServiceSlug.VISITORS,
    title: "Visitor Management — Front Desk Kiosk",
    tagline: "Biometric Attendance & Visitor Passes",
    description:
      "Digital visitor sign-in kiosk, VIP pre-registrations, host notifications, and daily staff attendance logs.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80",
    icon: UserCheck,
    metrics: "Kiosk Gate · Attendance",
  },
];

const APARTMENT_ROOMS: Array<{
  id: string;
  title: string;
  rateKobo: number;
  features: string;
  floor: string;
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING";
}> = [];

export default function StaffDashboardPage() {
  const router = useRouter();
  const {
    products,
    invoices,
    paymentDues,
    visitors,
    roomStatuses,
    toggleRoomStatus,
    saveProduct,
    deleteProduct,
    addVisitor,
    checkoutVisitor,
    deleteVisitor,
  } = usePlatformStore();

  const apartmentRooms = useMemo(() => {
    const storeApartments = products.filter(
      (p) => p.source === ServiceSlug.APARTMENTS && p.status !== "INACTIVE" && p.status !== "ARCHIVED"
    );
    return storeApartments.map((p, idx) => ({
      id: p.id,
      title: p.name,
      rateKobo: p.priceKobo || 5000000,
      features: p.label || p.description || "Luxury Serviced Suite",
      floor: p.sku ? `Suite Ref: ${p.sku}` : `Floor ${idx + 1}`,
    }));
  }, [products]);

  const [activeSection, setActiveSection] = useState<StaffSection>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hideSensitive, setHideSensitive] = useState(false);
  const [staffProfile, setStaffProfile] = useState<{
    name: string;
    role: string;
    branch: string;
    subsidiary: ServiceSlug | "ALL";
  }>({
    name: "Staff Member",
    role: "Operations Staff",
    branch: "Zino One Operations",
    subsidiary: "ALL",
  });

  const isAllAccess = staffProfile.subsidiary === "ALL";
  const assignedService: ServiceSlug | null = isAllAccess
    ? null
    : (staffProfile.subsidiary as ServiceSlug);
  const canAccessRooms = isAllAccess || assignedService === ServiceSlug.APARTMENTS;
  const canAccessVisitors = isAllAccess || assignedService === ServiceSlug.VISITORS;

  const maskAmount = (formatted: string) => (hideSensitive ? "••••••" : formatted);

  const toggleHideSensitive = () => {
    setHideSensitive((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("zino_hide_sensitive_values_v1", next ? "1" : "0");
      }
      return next;
    });
  };

  // Product CRUD state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<UnifiedProduct> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visitor CRUD state
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [newVisitorForm, setNewVisitorForm] = useState({
    name: "",
    phone: "",
    hostEmployee: "Chioma Okoye (Operations)",
    purpose: "Business Meeting",
    visitDate: new Date().toISOString().slice(0, 10),
    visitTime: "09:00",
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: "10:00",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Invoice filters (Staff Operational Filtering)
  const [invoiceFilter, setInvoiceFilter] = useState({
    service: "",
    type: "",
    from: "",
    to: "",
  });

  // Product catalog tab
  const [productServiceTab, setProductServiceTab] = useState<string>("ALL");

  // Notifications state (View + Mark Read + Dismiss)
  const [notifications, setNotifications] = useState<StaffNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<string>("ALL");
  const [notifReadFilter, setNotifReadFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hiddenPref = window.localStorage.getItem("zino_hide_sensitive_values_v1");
      if (hiddenPref === "1") setHideSensitive(true);

      const saved = window.localStorage.getItem("zino_staff_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) {
          const sub: ServiceSlug | "ALL" = parsed.subsidiary || "ALL";
          setStaffProfile({
            name: parsed.name,
            role: parsed.role || "Operations Staff",
            branch: parsed.branch || "Zino One Operations",
            subsidiary: sub,
          });
          if (sub !== "ALL") {
            setProductServiceTab(sub);
          }
        }
      }
    } catch {
      // ignore storage parse error
    }
  }, []);

  // Scoped datasets based on assigned Business Subsidiary
  const scopedProducts = useMemo(
    () => (assignedService ? products.filter((p) => p.source === assignedService) : products),
    [products, assignedService]
  );

  const scopedInvoices = useMemo(
    () => (assignedService ? invoices.filter((inv) => inv.source === assignedService) : invoices),
    [invoices, assignedService]
  );

  const scopedPaymentDues = useMemo(
    () =>
      assignedService
        ? paymentDues.filter((d) => d.source === assignedService)
        : paymentDues,
    [paymentDues, assignedService]
  );

  const scopedNotifications = useMemo(
    () =>
      assignedService
        ? notifications.filter((n) => n.source === assignedService)
        : notifications,
    [notifications, assignedService]
  );

  const scopedVisualServices = useMemo(
    () =>
      assignedService
        ? VISUAL_SERVICES.filter((sec) => sec.slug === assignedService)
        : VISUAL_SERVICES,
    [assignedService]
  );

  const unreadCount = useMemo(
    () => scopedNotifications.filter((n) => !n.read).length,
    [scopedNotifications]
  );

  const handleLogout = () => {
    document.cookie = "zino-staff-session=; path=/; max-age=0; SameSite=Lax";
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("zino_staff_profile");
    }
    router.push("/staff/login");
    router.refresh();
  };

  // Product CRUD Handlers
  const handleOpenAddProduct = (defaultService?: ServiceSlug) => {
    const resolvedSource =
      assignedService ||
      defaultService ||
      (productServiceTab !== "ALL" ? (productServiceTab as ServiceSlug) : ServiceSlug.SPARK);
    setEditingProduct({
      id: "",
      source: resolvedSource,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      label: "Featured",
      description: "",
      priceDisplay: "₦0",
      priceKobo: 0,
      imageUrl: "",
      images: [],
      status: "ACTIVE",
      totalStock: 20,
      lowStockAt: 5,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (item: UnifiedProduct) => {
    setEditingProduct({ ...item });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (item: UnifiedProduct) => {
    deleteProduct(item.id);
    showToast(`Removed "${item.name}" from catalog.`);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) return;

    const saved = saveProduct({
      ...editingProduct,
      name: editingProduct.name.trim(),
      source: assignedService || editingProduct.source || ServiceSlug.SPARK,
    });
    setProductModalOpen(false);
    setEditingProduct(null);
    showToast(`Saved "${saved.name}" — updated across staff portal & storefront`);
  };

  const handleAddVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorForm.name.trim()) return;
    const created = addVisitor(newVisitorForm);
    setVisitorModalOpen(false);
    setNewVisitorForm({
      name: "",
      phone: "",
      hostEmployee: "Chioma Okoye (Operations)",
      purpose: "Business Meeting",
      visitDate: new Date().toISOString().slice(0, 10),
      visitTime: "09:00",
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: "10:00",
    });
    showToast(`Logged visitor ${created.name} (${created.badgeNo}) — synced to Admin & Staff Visitor List.`);
  };

  // Low Stock Alerts (Staff Operational Tracking)
  const lowStockRows = useMemo(
    () =>
      scopedProducts.filter(
        (p) =>
          p.status === "LOW_STOCK" ||
          p.status === "OUT_OF_STOCK" ||
          p.totalStock <= p.lowStockAt
      ),
    [scopedProducts]
  );

  const lowStockColumns: ColumnDef<any>[] = [
    {
      key: "sku",
      header: "SKU",
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-gray-900">{row.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Product / Item",
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-xs truncate">{row.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{row.label}</p>
        </div>
      ),
    },
    {
      key: "totalStock",
      header: "Current Stock",
      cell: (row) => (
        <span className="font-mono font-extrabold text-rose-600 text-xs">
          {row.totalStock} / min {row.lowStockAt}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  // Filtered Invoices (Operational tracking & export)
  const filteredInvoices = useMemo(() => {
    return scopedInvoices.filter((inv) => {
      if (invoiceFilter.service && inv.source !== invoiceFilter.service) return false;
      if (invoiceFilter.type && inv.activityType !== invoiceFilter.type) return false;
      if (invoiceFilter.from && inv.createdAt < invoiceFilter.from) return false;
      if (invoiceFilter.to && inv.createdAt > `${invoiceFilter.to}T23:59:59`) return false;
      return true;
    });
  }, [scopedInvoices, invoiceFilter]);

  const invoiceColumns: ColumnDef<any>[] = [
    {
      key: "invoiceNo",
      header: "Invoice / Ref",
      cell: (row) => (
        <span className="font-mono font-bold text-indigo-700 text-xs">
          {row.invoiceNo}
        </span>
      ),
    },
    {
      key: "activityType",
      header: "Activity Type",
      cell: (row) => (
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px] font-bold">
          {row.activityType}
        </span>
      ),
    },
    {
      key: "activitySummary",
      header: "Activity Carried Out",
      cell: (row) => (
        <span className="text-xs text-gray-800 font-medium">{row.activitySummary}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer / Party",
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-900">{row.customer}</span>
      ),
    },
    {
      key: "amountDisplay",
      header: "Amount",
      cell: (row) => (
        <span className="font-mono font-bold text-gray-900 text-xs">
          {maskAmount(row.amountDisplay || formatCurrency(row.amountKobo || 0))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  // Sales Due & Purchase Due (Operational Tracking)
  const salesDueRows = useMemo(
    () => scopedPaymentDues.filter((d) => d.type === "SALES"),
    [scopedPaymentDues]
  );

  const purchaseDueRows = useMemo(
    () => scopedPaymentDues.filter((d) => d.type === "PURCHASE"),
    [scopedPaymentDues]
  );

  const paymentDueColumns: ColumnDef<any>[] = [
    {
      key: "referenceNo",
      header: "Reference #",
      cell: (row) => (
        <span className="font-mono font-bold text-gray-900 text-xs">
          {row.referenceNo}
        </span>
      ),
    },
    {
      key: "partyName",
      header: "Party Name",
      cell: (row) => (
        <span className="font-semibold text-gray-900 text-xs">{row.partyName}</span>
      ),
    },
    {
      key: "dueAmountKobo",
      header: "Amount Due",
      cell: (row) => (
        <span className="font-mono font-extrabold text-rose-600 text-xs">
          {maskAmount(formatCurrency(row.dueAmountKobo))}
        </span>
      ),
    },
  ];

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return scopedNotifications.filter((n) => {
      if (notifCategoryFilter !== "ALL" && n.category !== notifCategoryFilter) return false;
      if (notifReadFilter === "UNREAD" && n.read) return false;
      if (notifReadFilter === "READ" && !n.read) return false;
      return true;
    });
  }, [scopedNotifications, notifCategoryFilter, notifReadFilter]);

  const navItems: {
    id: StaffSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(canAccessVisitors
      ? [
          {
            id: "visitors" as StaffSection,
            label: "Visitors List",
            icon: UserCheck,
            badge: visitors.filter((v) => v.status === "CHECKED_IN").length,
          },
        ]
      : []),
    { id: "low-stock", label: "Low Stock Alerts", icon: AlertTriangle, badge: lowStockRows.length },
    { id: "invoices", label: "Invoice Activity", icon: Receipt },
    { id: "products", label: "Products Catalog", icon: Package },
    { id: "services", label: isAllAccess ? "Services Overview" : "My Company Overview", icon: Layers },
    { id: "sales-due", label: "Sales Due", icon: Wallet, badge: salesDueRows.length },
    { id: "purchase-due", label: "Purchase Due", icon: ClipboardList, badge: purchaseDueRows.length },
    ...(canAccessRooms ? [{ id: "rooms" as StaffSection, label: "Room Board", icon: BedDouble }] : []),
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
  ];

  const renderVisitorsSection = () => (
    <section
      aria-label="Live Visitors and Appointments Logbook"
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Visitor Management — Live Visitors &amp; Appointments List
            </h2>
            <p className="text-xs text-gray-600">
              Synchronized reception kiosk check-ins, time of visit, appointment schedule, and departure controls.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setVisitorModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Log New Visitor</span>
        </button>
      </div>

      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-bold">
              <th className="py-2.5">Badge #</th>
              <th className="py-2.5">Visitor Name &amp; Phone</th>
              <th className="py-2.5">Host Staff Member</th>
              <th className="py-2.5">Purpose</th>
              <th className="py-2.5">Visit Schedule</th>
              <th className="py-2.5">Appointment Schedule</th>
              <th className="py-2.5 text-center">Status</th>
              <th className="py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visitors.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50/70">
                <td className="py-3 font-mono font-bold text-purple-700">{v.badgeNo}</td>
                <td className="py-3">
                  <p className="font-bold text-gray-900">{v.name}</p>
                  <p className="text-[11px] text-gray-500">{v.phone}</p>
                </td>
                <td className="py-3 font-semibold text-gray-900">{v.hostEmployee}</td>
                <td className="py-3 text-gray-600">{v.purpose}</td>
                <td className="py-3 font-mono">
                  <p className="text-gray-900 font-bold">{v.visitTime}</p>
                  <p className="text-[11px] text-gray-500">{v.visitDate}</p>
                </td>
                <td className="py-3 font-mono">
                  <p className="text-blue-600 font-bold">{v.appointmentTime || v.visitTime}</p>
                  <p className="text-[11px] text-blue-500">{v.appointmentDate || v.visitDate}</p>
                </td>
                <td className="py-3 text-center">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      v.status === "CHECKED_IN"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {v.status === "CHECKED_IN" ? "INSIDE PREMISES" : `DEPARTED (${v.checkOut})`}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {v.status === "CHECKED_IN" && (
                      <button
                        type="button"
                        onClick={() => {
                          checkoutVisitor(v.id);
                          showToast(`Checked out visitor ${v.name}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                      >
                        Check Out
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        deleteVisitor(v.id);
                        showToast(`Removed visitor record ${v.badgeNo}`);
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete visitor log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderRoomBoard = () => (
    <section
      aria-label="Zino Luxury Apartments Real-Time Room Board"
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0B0F19] p-2 flex items-center justify-center text-amber-400 shrink-0">
            <BedDouble className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-gray-900 truncate">
              Zino Luxury Apartments — Real-Time Room Board
            </h2>
            <p className="text-xs text-gray-600 truncate">
              Live suite occupancy &amp; housekeeping status
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Operations</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {apartmentRooms.map((room) => {
          const status = roomStatuses[room.id] || "AVAILABLE";
          const statusConfig = {
            AVAILABLE: {
              label: "AVAILABLE",
              bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
              dot: "bg-emerald-500",
            },
            OCCUPIED: {
              label: "OCCUPIED",
              bg: "bg-rose-50 text-rose-700 border-rose-200",
              dot: "bg-rose-500",
            },
            CLEANING: {
              label: "HOUSEKEEPING",
              bg: "bg-amber-50 text-amber-700 border-amber-200",
              dot: "bg-amber-500",
            },
          }[status];

          return (
            <div
              key={room.id}
              className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-2 min-w-0 overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 max-w-full",
                      statusConfig.bg
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig.dot)} />
                    <span className="truncate">{statusConfig.label}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-gray-900 truncate">
                    {maskAmount(formatCurrency(room.rateKobo))}/night
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 truncate" title={room.title}>
                  {room.title}
                </h3>
                <p className="text-[11px] text-gray-600 truncate" title={room.features}>
                  {room.features}
                </p>
                <p className="text-[10px] font-mono text-gray-500 truncate" title={room.floor}>
                  {room.floor}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleRoomStatus(room.id)}
                className="mt-3 w-full py-1.5 px-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-[11px] font-semibold text-gray-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Toggle Status</span>
                <span className="text-[10px] text-gray-500 font-normal">({statusConfig.label})</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderServicesOverview = () => (
    <section
      aria-label="Six Unified Website Sections Overview"
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">
            {isAllAccess
              ? "Six Unified Website Sections Overview"
              : `${SERVICE_CONFIG[assignedService!]?.name || assignedService} — Assigned Workspace Overview`}
          </h2>
          <p className="text-xs text-gray-600">
            {isAllAccess
              ? "Live product and invoice counts across all subsidiaries."
              : "Scoped exclusively to your assigned business subsidiary."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span>{isAllAccess ? "All Companies Access" : SERVICE_CONFIG[assignedService!]?.name}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scopedVisualServices.map((sec) => {
          const serviceItems = scopedProducts.filter((p) => p.source === sec.slug);
          const activeItemsCount = serviceItems.filter((p) => p.status === "ACTIVE").length;
          const totalItemsCount = serviceItems.length;
          const serviceInvoicesCount = scopedInvoices.filter((i) => i.source === sec.slug).length;
          const dynamicTagline =
            serviceItems.length > 0
              ? serviceItems.slice(0, 2).map((p) => p.name).join(" • ")
              : sec.tagline;

          return (
            <div
              key={sec.slug}
              className="rounded-xl border border-gray-200 overflow-hidden bg-white flex flex-col min-w-0"
            >
              <div className="relative h-32 w-full bg-gray-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sec.image}
                  alt={sec.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                  <SourceBadge source={sec.slug} size="sm" />
                  <span className="px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold truncate">
                    {totalItemsCount} Listed {totalItemsCount === 1 ? "Item" : "Items"} · {activeItemsCount} Active
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300 truncate">
                    {dynamicTagline}
                  </p>
                  <h3 className="text-xs font-extrabold text-white truncate">
                    {sec.title}
                  </h3>
                </div>
              </div>
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-600 leading-relaxed">{sec.description}</p>

                {/* Real-time Synced Items Preview */}
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Catalog Products ({totalItemsCount})</span>
                    <span className="text-emerald-700 font-mono text-[10px]">{activeItemsCount} Active</span>
                  </div>
                  {serviceItems.length === 0 ? (
                    <p className="text-[10px] text-gray-600 italic">No items added to this section yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {serviceItems.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-200 text-[10px]">
                          <span className="font-bold text-gray-900 truncate max-w-[140px]">{item.name}</span>
                          <span className="font-mono font-extrabold text-gray-900">{maskAmount(item.priceDisplay)}</span>
                        </div>
                      ))}
                      {serviceItems.length > 2 && (
                        <p className="text-[9px] text-gray-600 font-semibold text-right">+{serviceItems.length - 2} more items</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      {totalItemsCount}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">Total Listed Items</p>
                    <p className="text-[9px] text-emerald-600 font-bold">{activeItemsCount} Active</p>
                  </div>
                  <div className="border-l border-gray-200">
                    <p className="text-sm font-extrabold text-gray-900">
                      {serviceInvoicesCount}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">Synced Invoices</p>
                    <p className="text-[9px] text-gray-600 font-semibold">Live Ledger</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProductServiceTab(sec.slug);
                      setActiveSection("products");
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-bold text-gray-800 text-center transition-colors cursor-pointer"
                  >
                    View Section Products
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddProduct(sec.slug)}
                    className="py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Add product to ${sec.title}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderProductsCatalog = () => (
    <section
      aria-label="Website Products and Services Catalog"
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">
            Website Products &amp; Services Catalog
          </h2>
          <p className="text-xs text-gray-600">
            Manage live inventory items, prices, images, and services across all 6 business sections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddProduct()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product / Service</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <Package className="w-3.5 h-3.5" />
            <span>Active Catalog</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {(isAllAccess
          ? [
              { key: "ALL", label: `All Website Items (${scopedProducts.length})` },
              ...Object.values(ServiceSlug).map((slug) => ({
                key: slug,
                label: `${SERVICE_CONFIG[slug].name} (${scopedProducts.filter((p) => p.source === slug).length})`,
              })),
            ]
          : [
              {
                key: assignedService!,
                label: `${SERVICE_CONFIG[assignedService!]?.name || assignedService} (${scopedProducts.length})`,
              },
            ]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setProductServiceTab(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer",
              (isAllAccess ? productServiceTab : assignedService) === tab.key
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scopedProducts
          .filter((p) => !isAllAccess || productServiceTab === "ALL" || p.source === productServiceTab)
          .map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col justify-between min-w-0"
            >
              <div>
                <div className="relative h-32 w-full bg-gray-100 overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <SourceBadge source={item.source} size="sm" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <p className="text-[10px] font-mono text-gray-500 truncate">{item.sku}</p>
                  <h3 className="text-xs font-extrabold text-gray-900 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-gray-600 line-clamp-2 min-h-[28px]">
                    {item.description || item.label}
                  </p>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                    <span className="text-sm font-black text-gray-900">
                      {maskAmount(item.priceDisplay)}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      Stock: <strong className="text-gray-900">{item.totalStock}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit / Remove Product Actions */}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEditProduct(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-500 text-[11px] font-bold text-gray-800 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(item)}
                  className="p-1 rounded-lg bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );

  const renderInvoicesSection = () => (
    <section aria-label="Invoice and Transaction Activity" className="space-y-3 min-w-0">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter Invoice Activity:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {isAllAccess && (
              <select
                aria-label="Filter by website section"
                value={invoiceFilter.service}
                onChange={(e) =>
                  setInvoiceFilter((f) => ({ ...f, service: e.target.value }))
                }
                className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="">All Website Sections</option>
                <option value="SPARK">Zino Spark (POS)</option>
                <option value="APARTMENTS">Zino Apartments (Bookings)</option>
                <option value="GALAXY">Device Galaxy (E-Commerce)</option>
                <option value="BUILDERS">Top Builders (Yard Sales)</option>
                <option value="BILLSTACKS">Billstacks (Invoicing)</option>
                <option value="VISITORS">Visitor Management</option>
              </select>
            )}
            <select
              aria-label="Filter by activity type"
              value={invoiceFilter.type}
              onChange={(e) =>
                setInvoiceFilter((f) => ({ ...f, type: e.target.value }))
              }
              className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="">All Activity Types</option>
              <option value="SALE">Sale</option>
              <option value="BOOKING">Booking</option>
              <option value="ORDER">Online Order</option>
              <option value="INVOICE">B2B Invoice</option>
              <option value="EXPENSE">Expense</option>
              <option value="VISIT">Visitor Check-In</option>
            </select>
            <input
              type="date"
              aria-label="From date"
              value={invoiceFilter.from}
              onChange={(e) =>
                setInvoiceFilter((f) => ({ ...f, from: e.target.value }))
              }
              className="h-8 px-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-900 focus:outline-none focus:border-indigo-600"
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              aria-label="To date"
              value={invoiceFilter.to}
              onChange={(e) =>
                setInvoiceFilter((f) => ({ ...f, to: e.target.value }))
              }
              className="h-8 px-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-900 focus:outline-none focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() =>
                setInvoiceFilter({ service: "", type: "", from: "", to: "" })
              }
              className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <DataTable
        title="All Invoice & Transaction Activity"
        columns={invoiceColumns}
        data={filteredInvoices}
        showExportButtons={true}
        showSourceColumn={true}
        searchPlaceholder="Search invoice, customer, or activity..."
        emptyMessage="No invoice activity found for selected filters."
        pageSize={10}
      />
    </section>
  );

  const renderNotificationsSection = () => (
    <section
      aria-label="Staff Notifications"
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Staff Operational Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Booking requests, low-stock alerts, visitor arrivals, and payment due reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter notifications by category"
            value={notifCategoryFilter}
            onChange={(e) => setNotifCategoryFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs bg-white text-gray-900 font-semibold"
          >
            <option value="ALL">All Categories</option>
            <option value="BOOKING_REQUEST">Booking Requests</option>
            <option value="LOW_STOCK">Low Stock Alerts</option>
            <option value="VISITOR_ARRIVAL">Visitor Arrivals</option>
            <option value="PAYMENT_DUE">Payment Dues</option>
            <option value="SYSTEM_ALERT">System Alerts</option>
          </select>
          <select
            aria-label="Filter notifications by read status"
            value={notifReadFilter}
            onChange={(e) => setNotifReadFilter(e.target.value as any)}
            className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs bg-white text-gray-900 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Read Only</option>
          </select>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
              }
              className="h-8 px-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          No notifications match the selected filters.
        </div>
      ) : (
        <div className="space-y-2.5" role="list" aria-live="polite">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              role="listitem"
              className={cn(
                "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
                notif.read
                  ? "bg-white border-gray-200"
                  : "bg-indigo-50/40 border-indigo-200"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <SourceBadge source={notif.source} size="sm" className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-extrabold text-gray-900">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-gray-500">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{notif.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSection(notif.targetSection)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-800 transition-colors"
                >
                  Open View
                </button>
                {!notif.read && (
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) =>
                          n.id === notif.id ? { ...n, read: true } : n
                        )
                      )
                    }
                    aria-label={`Mark notification "${notif.title}" as read`}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-emerald-700 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
                  }
                  aria-label={`Dismiss notification "${notif.title}"`}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors"
                  title="Dismiss"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Staff Portal Header */}
      <header className="sticky top-0 z-30 h-16 bg-[#14142B] text-white border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle staff navigation menu"
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/staff/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
              <Image
                src="/logos/zino-logo.png"
                alt="Zino One logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-white block truncate">
                Zino One · Staff Portal
              </span>
              <span className="text-[10px] text-indigo-300 font-mono block truncate">
                Staff Operations Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleHideSensitive}
            title={hideSensitive ? "Unhide sensitive amounts" : "Hide sensitive amounts"}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {hideSensitive ? <Eye className="w-3.5 h-3.5 text-amber-300" /> : <EyeOff className="w-3.5 h-3.5 text-indigo-300" />}
            <span className="hidden md:inline">{hideSensitive ? "Show Info" : "Hide Info"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("notifications")}
            aria-label={`Notifications, ${unreadCount} unread`}
            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
            <div className="text-right">
              <p className="text-xs font-bold text-white leading-tight">
                {staffProfile.name}
              </p>
              <p className="text-[10px] text-emerald-300 font-mono">
                {staffProfile.role} · {isAllAccess ? "All Companies" : SERVICE_CONFIG[assignedService!]?.shortName || assignedService}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-w-0 relative">
        {/* Mobile Nav Backdrop */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          aria-label="Staff Portal Navigation"
          className={cn(
            "fixed lg:sticky top-16 left-0 z-20 h-[calc(100vh-4rem)] w-64 bg-[#14142B] text-gray-200 border-r border-white/10 p-3 flex flex-col justify-between transition-transform duration-200 shrink-0 overflow-y-auto",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : item.id === "notifications"
                          ? "bg-rose-500 text-white"
                          : "bg-white/10 text-gray-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 space-y-1 mt-4">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Operational Mode</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Operational access enabled for stock monitoring, room board coordination, transactions, and alert resolution.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 min-w-0">
          {activeSection === "dashboard" && (
            <>
              {/* Staff Welcome Banner */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-gray-900">
                    Welcome, {staffProfile.name}
                  </h1>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {isAllAccess
                      ? "Operational snapshot across all Zino One subsidiaries · Full platform staff access."
                      : `Scoped exclusively to ${SERVICE_CONFIG[assignedService!]?.name || assignedService} · Assigned subsidiary access only.`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                    {isAllAccess ? "Access: All Companies" : `Access: ${SERVICE_CONFIG[assignedService!]?.name}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSection("low-stock")}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                  >
                    {lowStockRows.length} Low Stock Alerts
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("notifications")}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold"
                  >
                    {unreadCount} Unread Notifications
                  </button>
                </div>
              </div>

              {canAccessRooms && renderRoomBoard()}
              {canAccessVisitors && renderVisitorsSection()}

              <DataTable
                title="⚠ Existing Low Stock & Quality Alerts"
                columns={lowStockColumns}
                data={lowStockRows}
                showExportButtons={true}
                showSourceColumn={true}
                searchPlaceholder="Search low-stock product or SKU..."
                emptyMessage="No low-stock alerts right now."
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <DataTable
                  title="Sales Payment Due"
                  columns={paymentDueColumns}
                  data={salesDueRows}
                  showExportButtons={true}
                  showSourceColumn={true}
                  searchPlaceholder="Search customer or reference..."
                  emptyMessage="No pending customer invoices."
                />
                <DataTable
                  title="Purchase Payment Due"
                  columns={paymentDueColumns}
                  data={purchaseDueRows}
                  showExportButtons={true}
                  showSourceColumn={true}
                  searchPlaceholder="Search supplier or reference..."
                  emptyMessage="No pending supplier balances."
                />
              </div>

              {renderInvoicesSection()}
              {renderServicesOverview()}
              {renderProductsCatalog()}
            </>
          )}

          {activeSection === "low-stock" && (
            <DataTable
              title="⚠ Existing Low Stock & Quality Alerts"
              columns={lowStockColumns}
              data={lowStockRows}
              showExportButtons={true}
              showSourceColumn={true}
              searchPlaceholder="Search low-stock product or SKU..."
              emptyMessage="No low-stock alerts right now."
            />
          )}

          {activeSection === "invoices" && renderInvoicesSection()}
          {activeSection === "products" && renderProductsCatalog()}
          {activeSection === "services" && renderServicesOverview()}
          {activeSection === "visitors" && renderVisitorsSection()}

          {activeSection === "sales-due" && (
            <DataTable
              title="Sales Payment Due"
              columns={paymentDueColumns}
              data={salesDueRows}
              showExportButtons={true}
              showSourceColumn={true}
              searchPlaceholder="Search customer or reference..."
              emptyMessage="No pending customer invoices."
            />
          )}

          {activeSection === "purchase-due" && (
            <DataTable
              title="Purchase Payment Due"
              columns={paymentDueColumns}
              data={purchaseDueRows}
              showExportButtons={true}
              showSourceColumn={true}
              searchPlaceholder="Search supplier or reference..."
              emptyMessage="No pending supplier balances."
            />
          )}

          {activeSection === "rooms" && renderRoomBoard()}
          {activeSection === "notifications" && renderNotificationsSection()}
        </main>
      </div>

      {/* ── MODAL: Add / Edit Product or Service ── */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {editingProduct.id
                    ? "Edit Website Product / Service"
                    : "Add New Product / Service to Website"}
                </h3>
                <p className="text-xs text-gray-600">
                  Changes sync live across staff operations, admin dashboard, and public storefronts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              {/* Drag and Drop Local Image Upload */}
              <ImageDropzone
                label="Product / Service Image (Drag & Drop from Device)"
                value={editingProduct.imageUrl || ""}
                onChange={(storedUrl) =>
                  setEditingProduct({
                    ...editingProduct,
                    imageUrl: storedUrl,
                    images: storedUrl ? [storedUrl] : [],
                  })
                }
              />

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  placeholder="e.g. Samsung 990 PRO 4TB or Deluxe Studio Suite"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Website Section / Service *
                  </label>
                  <select
                    value={assignedService || editingProduct.source || ServiceSlug.SPARK}
                    disabled={!isAllAccess}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        source: e.target.value as ServiceSlug,
                      })
                    }
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-indigo-600 disabled:bg-gray-100 disabled:text-gray-600"
                  >
                    <option value={ServiceSlug.SPARK}>Zino Spark (POS)</option>
                    <option value={ServiceSlug.GALAXY}>Device Galaxy (Shop)</option>
                    <option value={ServiceSlug.BUILDERS}>Top Builders (Materials)</option>
                    <option value={ServiceSlug.APARTMENTS}>Zino Apartments (Rooms)</option>
                    <option value={ServiceSlug.BILLSTACKS}>Billstacks (Plans)</option>
                    <option value={ServiceSlug.VISITORS}>Visitor Management</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Name Label / Tag Badge *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.label || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, label: e.target.value })
                    }
                    placeholder="e.g. Best Seller, Hot Deal, VIP Suite"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Short description displayed on product cards..."
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Price Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.priceDisplay || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceDisplay: formatNumbersInText(e.target.value),
                      })
                    }
                    placeholder="e.g. ₦480,000"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Stock Qty
                  </label>
                  <NumberInput
                    value={editingProduct.totalStock ?? 10}
                    onChange={(v) =>
                      setEditingProduct({
                        ...editingProduct,
                        totalStock: typeof v === "number" ? v : 0,
                      })
                    }
                    placeholder="e.g. 1,000"
                    min={0}
                    allowNegative={false}
                    allowDecimal={false}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Status
                  </label>
                  <select
                    value={editingProduct.status || "ACTIVE"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LOW_STOCK">LOW_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                    <option value="PROMO">PROMO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Date Added
                </label>
                <input
                  type="date"
                  value={editingProduct.createdAt || new Date().toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      createdAt: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Sync Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Log New Visitor ── */}
      {visitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900">Log Visitor Check-In</h3>
              <button
                type="button"
                onClick={() => setVisitorModalOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddVisitorSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">Visitor Name *</label>
                  <input
                    type="text"
                    required
                    value={newVisitorForm.name}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, name: e.target.value })}
                    placeholder="e.g. Engr. Tunde Bakare"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newVisitorForm.phone}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, phone: e.target.value })}
                    placeholder="+234 80..."
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">Host Staff Member</label>
                  <input
                    type="text"
                    value={newVisitorForm.hostEmployee}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, hostEmployee: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    value={newVisitorForm.purpose}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, purpose: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">Date of Visit *</label>
                  <input
                    type="date"
                    required
                    value={newVisitorForm.visitDate}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, visitDate: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">Time of Visit *</label>
                  <input
                    type="time"
                    step="60"
                    required
                    value={newVisitorForm.visitTime}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, visitTime: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Date of Appt *</label>
                  <input
                    type="date"
                    required
                    value={newVisitorForm.appointmentDate}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, appointmentDate: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-blue-200 bg-blue-50/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">Time of Appt *</label>
                  <input
                    type="time"
                    step="60"
                    required
                    value={newVisitorForm.appointmentTime}
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, appointmentTime: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-blue-200 bg-blue-50/30 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVisitorModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Issue Pass &amp; Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-gray-800 animate-fade-in-up"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
