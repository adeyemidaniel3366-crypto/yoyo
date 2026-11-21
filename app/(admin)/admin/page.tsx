"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  ShoppingCart,
  DollarSign,
  FileText,
  RefreshCw,
  ShoppingBag,
  AlertTriangle,
  Building2,
  Users,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Filter,
  Target,
  Sparkles,
  ExternalLink,
  Layers,
  Cpu,
  Smartphone,
  Hammer,
  Receipt,
  UserCheck,
  Zap,
  Download,
  Shield,
  ShieldCheck,
  Radio,
  Activity,
  BedDouble,
  Lock,
  Unlock,
  Wifi,
  Globe,
  RefreshCcw,
  Check,
  Server,
  PlayCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ServiceSlug, SERVICE_CONFIG, LOCATIONS } from "@/lib/constants";
import { StatCard } from "@/components/ui/stat-card";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ChartCard } from "@/components/ui/chart-card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import {
  usePlatformStore,
  UnifiedProduct,
  UnifiedInvoiceActivity,
} from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Activity Type Badge
// ---------------------------------------------------------------------------
const ACTIVITY_TYPE_STYLES: Record<string, string> = {
  SALE: "bg-blue-50 text-blue-700 border border-blue-200",
  BOOKING: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  ORDER: "bg-orange-50 text-orange-700 border border-orange-200",
  INVOICE: "bg-green-50 text-green-700 border border-green-200",
  EXPENSE: "bg-red-50 text-red-700 border border-red-200",
  VISIT: "bg-purple-50 text-purple-700 border border-purple-200",
  PAYMENT: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ATTENDANCE: "bg-gray-50 text-gray-700 border border-gray-200",
};

function ActivityTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
        ACTIVITY_TYPE_STYLES[type] ?? "bg-gray-50 text-gray-600 border border-gray-200"
      )}
    >
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Monthly Target Progress Bar
// ---------------------------------------------------------------------------
function TargetBar({
  label,
  current,
  target,
  unit = "",
  color = "#4F46E5",
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-900">{label}</span>
        <span className="text-gray-500">
          <strong className="text-gray-900">
            {unit}
            {current.toLocaleString()}
          </strong>{" "}
          / {unit}
          {target.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Financial Summary Card
// ---------------------------------------------------------------------------
function FinancialCard({
  title,
  value,
  delta,
  isPositive,
  accentColor,
  subtitle,
  children,
}: {
  title: string;
  value: string;
  delta?: number;
  isPositive?: boolean;
  accentColor: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex min-w-0">
      <div className="w-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 p-5 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-gray-900 truncate">{value}</p>
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs font-semibold",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {delta}% vs last month
            </span>
          </div>
        )}
        {subtitle && <p className="text-[11px] text-gray-500 mt-1 truncate">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual Service Section Descriptions (Images + Architectural Visual Cards)
// ---------------------------------------------------------------------------
const VISUAL_SERVICE_SECTIONS = [
  {
    slug: ServiceSlug.SPARK,
    title: "Zino Spark — Multi-Shop Retail POS",
    tagline: "5 Electronics Stores across Computer Village, Ikeja",
    description:
      "Fast barcode POS billing, real-time stock alerts across 5 branches, inter-shop stock transfers, and wholesale/retail serial tracking.",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&auto=format&fit=crop&q=80",
    adminHref: "/admin/spark",
    publicHref: "/shop",
    icon: Cpu,
    metrics: "5 Branches • POS Terminal",
    logoUrl: "/logos/zino-spark.png",
  },
  {
    slug: ServiceSlug.APARTMENTS,
    title: "Zino Apartments — Luxury Hospitality",
    tagline: "12 Serviced Suites & Front Desk PMS in Lekki",
    description:
      "Public room booking engine, front-desk guest verification, room availability board, housekeeping status, and automated 10% hospitality tax.",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80",
    adminHref: "/admin/apartments",
    publicHref: "/apartments",
    icon: Building2,
    metrics: "12 Luxury Rooms • 10% Tax Engine",
    logoUrl: "/logos/zino-spark.png",
  },
  {
    slug: ServiceSlug.BUILDERS,
    title: "Top Builders — Construction Materials",
    tagline: "Bulk Cement, Iron Rods & Daily Sales Book",
    description:
      "High-volume construction supply yard: daily sales book, batch stock sheets (ST-00021), waybill dispatches, and customer debtors ledger.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80",
    adminHref: "/admin/builders",
    publicHref: "/builders",
    icon: Hammer,
    metrics: "Yard Stock Sheets • Debtors Ledger",
    logoUrl: "/logos/builders-logo.png",
  },
  {
    slug: ServiceSlug.GALAXY,
    title: "Device Galaxy — E-Commerce Storefront",
    tagline: "Nationwide Online Gadgets & Storage Marketplace",
    description:
      "Online shopping storefront with 1:1 product cards, customer star ratings, cart & checkout pipeline, order tracking, and digital receipts.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
    adminHref: "/admin/galaxy",
    publicHref: "/shop",
    icon: Smartphone,
    metrics: "Online Cart • Nationwide Shipping",
    logoUrl: "/logos/device-galaxy.png",
  },
  {
    slug: ServiceSlug.BILLSTACKS,
    title: "Billstacks — Cloud Invoicing & Accounting",
    tagline: "Multi-Currency Invoicing, Expenses & Tax Engine",
    description:
      "Professional B2B invoicing (paid, unpaid, partial), recurring subscription billing, expense classification, purchase orders, and HRM.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&auto=format&fit=crop&q=80",
    adminHref: "/admin/billstacks",
    publicHref: "/billstacks",
    icon: Receipt,
    metrics: "SaaS Plans • Automated Billing",
    logoUrl: "/logos/billstacks-logo.png",
  },
  {
    slug: ServiceSlug.VISITORS,
    title: "Visitor Management — Front Desk Kiosk",
    tagline: "Enterprise Security Passes & Staff Attendance",
    description:
      "Self-service tablet check-in kiosk, QR pre-registered guest passes, instant visitor badge printing, and employee clock-in/clock-out.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80",
    adminHref: "/admin/visitors",
    publicHref: "/visit",
    icon: UserCheck,
    metrics: "Self-Check Kiosk • Staff Attendance",
    logoUrl: "/logos/visitor-management.png",
  },
];

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------
export default function UnifiedAdminDashboard() {
  const {
    products,
    invoices,
    activities,
    paymentDues,
    targets,
    globalServiceFilter,
    globalLocationFilter,
    updateGlobalServiceFilter,
    saveProduct,
    deleteProduct,
    restockProduct,
    settlePaymentDue,
    updateTargets,
    recordTransaction,
  } = usePlatformStore();

  const [chartGrouping, setChartGrouping] = useState<"service" | "location">("service");
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Invoice activity filter state
  const [invoiceFilter, setInvoiceFilter] = useState({
    service: "",
    type: "",
    from: "",
    to: "",
  });

  // Urgent attention items (interactive — can be resolved)
  const [attentionItems, setAttentionItems] = useState([
    {
      id: "att_1",
      source: ServiceSlug.SPARK,
      severity: "high",
      title: "Out of Stock: Zealot S69M (13360)",
      detail: "Warehouse — Asset Corps Plaza (0.0 Pc remaining)",
      href: "/admin/spark/stock-alert",
    },
    {
      id: "att_2",
      source: ServiceSlug.BUILDERS,
      severity: "high",
      title: "Debtor Overdue: Mama Bose Ventures",
      detail: "₦281,300 overdue by 128 days (Invoice INV-000104)",
      href: "/admin/builders/debtors",
    },
    {
      id: "att_3",
      source: ServiceSlug.APARTMENTS,
      severity: "medium",
      title: "Pending Booking Confirmation",
      detail: "Booking ref #ZINO-482091 for Deluxe Studio Suite",
      href: "/admin/apartments/bookings",
    },
    {
      id: "att_4",
      source: ServiceSlug.GALAXY,
      severity: "medium",
      title: "Product Review Pending Approval",
      detail: 'MacBook Pro 16" review by Chinedu O. (5 stars)',
      href: "/admin/galaxy",
    },
    {
      id: "att_5",
      source: ServiceSlug.VISITORS,
      severity: "low",
      title: "Expected Visitor Waiting",
      detail: "Adaeze Okafor arrived for meeting with Accounts Dept",
      href: "/admin/visitors",
    },
  ]);

  // Modals state
  const [productServiceTab, setProductServiceTab] = useState<string>("ALL");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<UnifiedProduct> | null>(null);

  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetForm, setTargetForm] = useState({
    salesNaira: Math.round(targets.salesTargetKobo / 100),
    expenseNaira: Math.round(targets.expenseBudgetKobo / 100),
    bookingsTarget: targets.bookingsTarget,
    visitorsTarget: targets.visitorsTarget,
  });

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    source: ServiceSlug.SPARK,
    activityType: "SALE" as UnifiedInvoiceActivity["activityType"],
    activitySummary: "",
    customer: "",
    amountNaira: "",
    location: "Medical Road",
    status: "PAID",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Date Range Scoping State ──
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Currency Multi-Switch State & Logic ──
  const [activeCurrency, setActiveCurrency] = useState<"NGN" | "USD" | "GBP" | "EUR">("NGN");

  const CURRENCY_CONFIG: Record<
    "NGN" | "USD" | "GBP" | "EUR",
    { symbol: string; rate: number; label: string }
  > = {
    NGN: { symbol: "₦", rate: 1, label: "NGN (₦)" },
    USD: { symbol: "$", rate: 1450, label: "USD ($)" },
    GBP: { symbol: "£", rate: 1850, label: "GBP (£)" },
    EUR: { symbol: "€", rate: 1550, label: "EUR (€)" },
  };

  const formatMoney = (kobo: number) => {
    if (activeCurrency === "NGN") {
      return formatCurrency(kobo);
    }
    const cfg = CURRENCY_CONFIG[activeCurrency];
    const naira = kobo / 100;
    const converted = naira / cfg.rate;
    return `${cfg.symbol}${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ── Security, Diagnostic & Operations Controls State ──
  const [isSecurityDrawerOpen, setIsSecurityDrawerOpen] = useState(false);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // ── Apartment Suite Quick Status Board State ──
  const [suiteStatuses, setSuiteStatuses] = useState<Record<string, "AVAILABLE" | "OCCUPIED" | "CLEANING">>({
    suite_101: "OCCUPIED",
    suite_102: "AVAILABLE",
    suite_201: "AVAILABLE",
    suite_301: "OCCUPIED",
  });

  const handleToggleRoomStatus = (suiteKey: string, suiteTitle: string) => {
    setSuiteStatuses((prev) => {
      const current = prev[suiteKey] || "AVAILABLE";
      const next = current === "AVAILABLE" ? "OCCUPIED" : current === "OCCUPIED" ? "CLEANING" : "AVAILABLE";
      showToast(`${suiteTitle} status changed to ${next}`);
      return { ...prev, [suiteKey]: next };
    });
  };

  // ── Quick Operations Simulator Handlers ──
  const handleSimulateBooking = () => {
    const bookingRef = `ZINO-${Math.floor(100000 + Math.random() * 900000)}`;
    const guestPool = [
      "Dr. Folashade Adeleke",
      "Engr. Tunde Bakare",
      "Mrs. Amaka Williams",
      "Mr. Chukwuemeka Eze",
      "Barrister Funke Oladipo",
    ];
    const guest = guestPool[Math.floor(Math.random() * guestPool.length)];
    const suites = ["Deluxe Studio Suite", "Executive 1-Bedroom", "Luxury 2-Bedroom Suite"];
    const suite = suites[Math.floor(Math.random() * suites.length)];
    const priceKobo = 5500000; // ₦55,000

    recordTransaction({
      source: ServiceSlug.APARTMENTS,
      activityType: "BOOKING",
      activitySummary: `Instant Guest Reservation · ${suite} (${bookingRef})`,
      customer: guest,
      amountKobo: priceKobo,
      location: "Lekki Phase 1",
      status: "PAID",
      actor: "Online Guest Engine",
    });

    showToast(`⚡ Simulated Reservation: ${guest} booked ${suite} for ₦55,000!`);
  };

  const handleSimulatePosSale = () => {
    const saleId = `POS-${Math.floor(10000 + Math.random() * 90000)}`;
    const items = [
      { name: "Samsung 990 PRO 2TB NVMe SSD", priceKobo: 28000000 },
      { name: "Lexar SL500 Portable SSD 1TB", priceKobo: 12500000 },
      { name: "Zealot S69M 50W Bluetooth Speaker", priceKobo: 6500000 },
      { name: "UGREEN 100W GaN Fast Charger", priceKobo: 4200000 },
    ];
    const item = items[Math.floor(Math.random() * items.length)];

    recordTransaction({
      source: ServiceSlug.SPARK,
      activityType: "SALE",
      activitySummary: `Retail POS Sale · ${item.name} (${saleId})`,
      customer: "Walk-in Retail Buyer",
      amountKobo: item.priceKobo,
      location: "Adepele St, Ikeja",
      status: "PAID",
      actor: "Register #01 Cashier",
    });

    showToast(`⚡ Simulated POS Sale: ${item.name} recorded on Computer Village register!`);
  };

  const handleSimulateDispatch = () => {
    const waybillNo = `WB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const contractors = [
      "Julius Construction Ltd",
      "Lekki Heights Developers",
      "Eko Atlantic Villa Projects",
      "Apex Civil Engineering",
    ];
    const contractor = contractors[Math.floor(Math.random() * contractors.length)];
    const amountKobo = 98000000; // ₦980,000 for 100 bags

    recordTransaction({
      source: ServiceSlug.BUILDERS,
      activityType: "ORDER",
      activitySummary: `Direct Depot Dispatch · 100 Bags Dangote 42.5R Cement (${waybillNo})`,
      customer: contractor,
      amountKobo,
      location: "Alaba Rago Depot",
      status: "PAID",
      actor: "Depot Supervisor",
    });

    showToast(`⚡ Simulated Dispatch: 100 Bags Cement dispatched to ${contractor}!`);
  };

  // ── CSV Export Handler ──
  const handleExportAuditCSV = () => {
    const headers = [
      "Activity Type",
      "Activity Summary",
      "Invoice No",
      "Customer",
      "Location",
      "Amount (Naira)",
      "Status",
      "Date",
    ];
    const rows = invoices.map((inv) => [
      inv.activityType,
      `"${(inv.activitySummary || "").replace(/"/g, '""')}"`,
      inv.invoiceNo,
      `"${(inv.customer || "").replace(/"/g, '""')}"`,
      inv.location || "N/A",
      ((inv.amountKobo || 0) / 100).toFixed(2),
      inv.status,
      inv.createdAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Zino_One_Operations_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Audit CSV report exported successfully!");
  };

  const handleSyncAllHubs = async () => {
    setIsSyncingAll(true);
    const startedAt = Date.now();
    try {
      const params = new URLSearchParams();
      if (globalServiceFilter !== "ALL") params.set("service", globalServiceFilter);
      if (globalLocationFilter !== "ALL") params.set("location", globalLocationFilter);
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to) params.set("to", dateRange.to);
      const query = params.toString();
      const response = await fetch(`/api/dashboard/summary${query ? `?${query}` : ""}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result?.ok || !result?.data) throw new Error(result?.error?.message || "Dashboard sync failed");
      setDashboardData(result.data);
      if (Array.isArray(result.data.attention)) {
        setAttentionItems(result.data.attention.map((item: any, index: number) => ({
          id: `attention-${item.source}-${index}`,
          source: item.source,
          severity: item.severity,
          title: item.title,
          detail: "Open the linked service workspace to review this item.",
          href: item.href,
        })));
      }
      setNetworkLatency(Date.now() - startedAt);
      showToast("Dashboard data refreshed from connected service records.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not refresh dashboard data.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  useEffect(() => {
    const startedAt = Date.now();
    const params = new URLSearchParams();
    if (globalServiceFilter !== "ALL") params.set("service", globalServiceFilter);
    if (globalLocationFilter !== "ALL") params.set("location", globalLocationFilter);
    if (dateRange.from) params.set("from", dateRange.from);
    if (dateRange.to) params.set("to", dateRange.to);
    const query = params.toString();
    fetch(`/api/dashboard/summary${query ? `?${query}` : ""}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Dashboard summary unavailable");
        return r.json();
      })
      .then((res) => {
        if (res?.ok && res?.data) {
          setDashboardData(res.data);
          setNetworkLatency(Date.now() - startedAt);
          if (Array.isArray(res.data.attention)) {
            setAttentionItems(res.data.attention.map((item: any, index: number) => ({
              id: `attention-${item.source}-${index}`,
              source: item.source,
              severity: item.severity,
              title: item.title,
              detail: "Open the linked service workspace to review this item.",
              href: item.href,
            })));
          }
        }
      })
      .catch(() => setDashboardData({
        isUnavailable: true,
        cards: [],
        attention: [],
        salesLast30Days: { labels: [], series: [], locations: [] },
        salesFinancialYear: { labels: [], series: [] },
      }));
  }, [globalServiceFilter, globalLocationFilter, dateRange.from, dateRange.to]);

  // Synchronize topbar global service filter with invoice & product tabs
  const activeServiceScope = globalServiceFilter;

  // Use the same filtered server summary for all primary financial totals.
  const financialTotals = useMemo(() => {
    const cards = dashboardData?.cards || [];
    const value = (key: string) => cards.find((card: any) => card.key === key)?.valueKobo ?? 0;
    const totalRevenueKobo = value("totalSales");
    const netProfitKobo = value("net");

    return {
      totalRevenueKobo,
      totalExpenseKobo: Math.max(0, totalRevenueKobo - netProfitKobo),
      netProfitKobo,
      bookingsCount: value("activeBookings"),
      visitorsCount: value("visitorsToday"),
    };
  }, [dashboardData]);

  // Compute dynamic dues
  const salesPaymentDueRows = useMemo(
    () =>
      paymentDues.filter(
        (d) =>
          d.type === "SALES" &&
          (activeServiceScope === "ALL" || d.source === activeServiceScope)
      ),
    [paymentDues, activeServiceScope]
  );

  const purchasePaymentDueRows = useMemo(
    () =>
      paymentDues.filter(
        (d) =>
          d.type === "PURCHASE" &&
          (activeServiceScope === "ALL" || d.source === activeServiceScope)
      ),
    [paymentDues, activeServiceScope]
  );

  const totalSalesDueKobo = salesPaymentDueRows.reduce((s, d) => s + d.dueAmountKobo, 0);
  const totalPurchaseDueKobo = purchasePaymentDueRows.reduce((s, d) => s + d.dueAmountKobo, 0);

  // Compute dynamic Low Stock & Quality Alerts from Unified Products
  const productAlertRows = useMemo(() => {
    return products
      .filter(
        (p) =>
          (activeServiceScope === "ALL" || p.source === activeServiceScope) &&
          (p.status === "OUT_OF_STOCK" ||
            p.status === "LOW_STOCK" ||
            p.totalStock <= p.lowStockAt) &&
          p.lowStockAt > 0
      )
      .map((p) => ({
        id: p.id,
        source: p.source,
        sku: p.sku,
        name: p.name,
        imageUrl: p.imageUrl,
        qty: p.totalStock,
        lowStockAt: p.lowStockAt,
        status: p.totalStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
      }));
  }, [products, activeServiceScope]);

  // Filtered Unified Invoice Activity Rows
  const displayInvoiceRows = useMemo(() => {
    return invoices.filter((row) => {
      if (activeServiceScope !== "ALL" && row.source !== activeServiceScope) return false;
      if (invoiceFilter.service && row.source !== invoiceFilter.service) return false;
      if (invoiceFilter.type && row.activityType !== invoiceFilter.type) return false;
      if (invoiceFilter.from && row.createdAt < invoiceFilter.from) return false;
      if (invoiceFilter.to && row.createdAt > invoiceFilter.to) return false;
      return true;
    });
  }, [invoices, activeServiceScope, invoiceFilter]);

  // ── 8 Stat Cards ──────────────────────────────────────────────────────
  const rawCards = dashboardData?.cards || [];
  const getCard = (key: string) => rawCards.find((c: any) => c.key === key);

  const stats = [
    {
      title: "Total Sales (Today)",
      value: getCard("totalSales") ? formatMoney(getCard("totalSales").valueKobo ?? 0) : formatMoney(0),
      icon: ShoppingCart,
      iconColor: "#2563EB",
      iconBg: "#E8EEFB",
      delta: {
        value: getCard("totalSales")?.deltaPct ?? 0,
        isPositive: (getCard("totalSales")?.deltaPct ?? 0) >= 0,
        period: "vs yesterday",
      },
    },
    {
      title: "Net (Today)",
      value: getCard("net") ? formatMoney(getCard("net").valueKobo ?? 0) : formatMoney(0),
      icon: DollarSign,
      iconColor: "#28A745",
      iconBg: "#E8F5EE",
      delta: {
        value: getCard("net")?.deltaPct ?? 0,
        isPositive: (getCard("net")?.deltaPct ?? 0) >= 0,
        period: "vs yesterday",
      },
    },
    {
      title: "Invoice Due",
      value: formatMoney(totalSalesDueKobo),
      icon: FileText,
      iconColor: "#FFB800",
      iconBg: "#FFF9E6",
      subtitle: `${salesPaymentDueRows.length} open debtor invoice(s)`,
    },
    {
      title: "Total Sell Return",
      value: getCard("sellReturn") ? formatMoney(getCard("sellReturn").valueKobo ?? 0) : formatMoney(0),
      icon: RefreshCw,
      iconColor: "#E74C3C",
      iconBg: "#FDF2F2",
      subtitle: "0 returns today",
    },
    {
      title: "Total Purchase (Today)",
      value: getCard("totalPurchase") ? formatMoney(getCard("totalPurchase").valueKobo ?? 0) : formatMoney(0),
      icon: ShoppingBag,
      iconColor: "#17A2B8",
      iconBg: "#E8F7F9",
      subtitle: "Received orders",
    },
    {
      title: "Purchase Due",
      value: formatMoney(totalPurchaseDueKobo),
      icon: AlertTriangle,
      iconColor: "#FFB800",
      iconBg: "#FFF9E6",
      subtitle: `${purchasePaymentDueRows.length} supplier balance(s) pending`,
    },
    {
      title: "Active Bookings",
      value: String(getCard("activeBookings")?.valueKobo ?? financialTotals.bookingsCount),
      icon: Building2,
      iconColor: "#1E3A5F",
      iconBg: "#E8EEF5",
      source: ServiceSlug.APARTMENTS,
      subtitle: "Deluxe & Luxury Suites",
    },
    {
      title: "Visitors Today",
      value: String(getCard("visitorsToday")?.valueKobo ?? financialTotals.visitorsCount),
      icon: Users,
      iconColor: "#7C3AED",
      iconBg: "#F3EFFF",
      source: ServiceSlug.VISITORS,
      subtitle: "Checked-in & expected",
    },
  ];

  // 30 Days Chart Data (Supports BOTH "By service" and "By location")
  const sales30DaysByLocation = [
    { date: "20 Oct", Adepele: 800000, MedicalRoad: 5200000, Olayeni: 1000000, AllLocations: 7000000 },
    { date: "24 Oct", Adepele: 2000000, MedicalRoad: 6100000, Olayeni: 1200000, AllLocations: 9300000 },
    { date: "28 Oct", Adepele: 1500000, MedicalRoad: 5000000, Olayeni: 3500000, AllLocations: 10000000 },
    { date: "02 Nov", Adepele: 4200000, MedicalRoad: 8400000, Olayeni: 1900000, AllLocations: 14500000 },
    { date: "06 Nov", Adepele: 2500000, MedicalRoad: 7200000, Olayeni: 1400000, AllLocations: 11100000 },
    { date: "10 Nov", Adepele: 3100000, MedicalRoad: 6800000, Olayeni: 2100000, AllLocations: 12000000 },
    { date: "14 Nov", Adepele: 2800000, MedicalRoad: 7400000, Olayeni: 1600000, AllLocations: 11800000 },
    { date: "18 Nov", Adepele: 3400000, MedicalRoad: 9200000, Olayeni: 2300000, AllLocations: 14900000 },
    { date: "20 Nov", Adepele: 3900000, MedicalRoad: 10500000, Olayeni: 2800000, AllLocations: 17200000 },
  ];

  const sales30DaysByService = [
    { date: "20 Oct", Spark: 4200000, Builders: 1800000, Galaxy: 650000, Apartments: 350000, Billstacks: 120000 },
    { date: "24 Oct", Spark: 5100000, Builders: 2400000, Galaxy: 1100000, Apartments: 520000, Billstacks: 180000 },
    { date: "28 Oct", Spark: 5800000, Builders: 2100000, Galaxy: 1300000, Apartments: 600000, Billstacks: 200000 },
    { date: "02 Nov", Spark: 7900000, Builders: 3800000, Galaxy: 1750000, Apartments: 750000, Billstacks: 300000 },
    { date: "06 Nov", Spark: 6100000, Builders: 2900000, Galaxy: 1200000, Apartments: 650000, Billstacks: 250000 },
    { date: "10 Nov", Spark: 6800000, Builders: 3100000, Galaxy: 1350000, Apartments: 500000, Billstacks: 250000 },
    { date: "14 Nov", Spark: 6400000, Builders: 3300000, Galaxy: 1250000, Apartments: 600000, Billstacks: 250000 },
    { date: "18 Nov", Spark: 8200000, Builders: 4100000, Galaxy: 1600000, Apartments: 700000, Billstacks: 300000 },
    { date: "20 Nov", Spark: 9400000, Builders: 4600000, Galaxy: 1950000, Apartments: 850000, Billstacks: 400000 },
  ];

  const financialYearData = [
    { month: "Jan", Spark: 95000000, Builders: 30000000, Galaxy: 12000000, Apartments: 8000000 },
    { month: "Feb", Spark: 103000000, Builders: 28000000, Galaxy: 14000000, Apartments: 7500000 },
    { month: "Mar", Spark: 114000000, Builders: 45000000, Galaxy: 19000000, Apartments: 9200000 },
    { month: "Apr", Spark: 140000000, Builders: 48000000, Galaxy: 22000000, Apartments: 11000000 },
    { month: "May", Spark: 204000000, Builders: 130000000, Galaxy: 35000000, Apartments: 14500000 },
    { month: "Jun", Spark: 150000000, Builders: 40000000, Galaxy: 28000000, Apartments: 12000000 },
    { month: "Jul", Spark: 115000000, Builders: 38000000, Galaxy: 24000000, Apartments: 10500000 },
    { month: "Aug", Spark: 97000000, Builders: 36000000, Galaxy: 18000000, Apartments: 9000000 },
    { month: "Sep", Spark: 157000000, Builders: 64000000, Galaxy: 29000000, Apartments: 13000000 },
    { month: "Oct", Spark: 144000000, Builders: 82000000, Galaxy: 31000000, Apartments: 15000000 },
    { month: "Nov", Spark: 146000000, Builders: 112000000, Galaxy: 34000000, Apartments: 16500000 },
  ];

  const serviceKeyBySlug: Record<string, string> = {
    [ServiceSlug.SPARK]: "Spark",
    [ServiceSlug.BUILDERS]: "Builders",
    [ServiceSlug.GALAXY]: "Galaxy",
    [ServiceSlug.APARTMENTS]: "Apartments",
    [ServiceSlug.BILLSTACKS]: "Billstacks",
  };
  const liveDailyChart = dashboardData?.salesLast30Days?.labels?.length
    ? dashboardData.salesLast30Days.labels.map((date: string, index: number) => {
        const point: Record<string, string | number> = { date: date.slice(5) };
        dashboardData.salesLast30Days.series.forEach((series: any) => {
          const key = serviceKeyBySlug[series.source];
          if (key) point[key] = (series.data?.[index] || 0) / 100;
        });
        return point;
      })
    : [];
  const liveFinancialYearChart = dashboardData?.salesFinancialYear?.labels?.length
    ? dashboardData.salesFinancialYear.labels.map((month: string, index: number) => {
        const point: Record<string, string | number> = { month };
        dashboardData.salesFinancialYear.series.forEach((series: any) => {
          const key = serviceKeyBySlug[series.source];
          if (key) point[key] = (series.data?.[index] || 0) / 100;
        });
        return point;
      })
    : [];
  const locationSeries = dashboardData?.salesLast30Days?.locations || [];
  const liveLocationChart = dashboardData?.salesLast30Days?.labels?.length
    ? dashboardData.salesLast30Days.labels.map((date: string, index: number) => {
        const point: Record<string, string | number> = { date: date.slice(5) };
        locationSeries.forEach((series: any, seriesIndex: number) => {
          point[`Location ${seriesIndex + 1}`] = (series.data?.[index] || 0) / 100;
        });
        return point;
      })
    : [];

  // ── Table Column Definitions ──────────────────────────────────────────
  const salesPaymentDueColumns: ColumnDef<any>[] = [
    { key: "partyName", header: "Customer", sortable: true },
    { key: "referenceNo", header: "Invoice No.", sortable: true },
    {
      key: "dueAmountKobo",
      header: "Due Amount",
      align: "right",
      sortable: true,
      cell: (row) => formatCurrency(row.dueAmountKobo),
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            settlePaymentDue(row.id);
            showToast(`Payment settled for ${row.partyName} (${row.referenceNo})`);
          }}
          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-2xs"
        >
          Settle Pay
        </button>
      ),
    },
  ];

  const purchasePaymentDueColumns: ColumnDef<any>[] = [
    { key: "partyName", header: "Supplier", sortable: true },
    { key: "referenceNo", header: "Reference No", sortable: true },
    {
      key: "dueAmountKobo",
      header: "Due Amount",
      align: "right",
      sortable: true,
      cell: (row) => formatCurrency(row.dueAmountKobo),
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            settlePaymentDue(row.id);
            showToast(`Supplier balance settled for ${row.partyName} (${row.referenceNo})`);
          }}
          className="px-2.5 py-1 rounded bg-active hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors shadow-2xs"
        >
          Settle Pay
        </button>
      ),
    },
  ];

  const invoiceColumns: ColumnDef<UnifiedInvoiceActivity>[] = [
    {
      key: "activityType",
      header: "Activity Type",
      sortable: true,
      cell: (row) => <ActivityTypeBadge type={row.activityType} />,
    },
    {
      key: "activitySummary",
      header: "Activity Carried Out",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium text-heading">{row.activitySummary}</span>
      ),
    },
    {
      key: "invoiceNo",
      header: "Invoice / Ref No.",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-heading">{row.invoiceNo}</span>
      ),
    },
    { key: "customer", header: "Customer / Guest", sortable: true },
    {
      key: "location",
      header: "Location",
      cell: (row) => <span className="text-xs text-muted">{row.location ?? "—"}</span>,
    },
    {
      key: "amountDisplay",
      header: "Amount",
      align: "right",
      sortable: true,
      cell: (row) => <span className="font-semibold text-heading">{row.amountDisplay ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-muted">
          {typeof row.createdAt === "string" ? row.createdAt.slice(0, 10) : row.createdAt}
        </span>
      ),
    },
  ];

  const productAlertColumns: ColumnDef<any>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-border overflow-hidden shrink-0">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-bold text-heading text-xs">{row.name}</p>
            <p className="text-[10px] font-mono text-muted">{row.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "qty", header: "Current Stock", align: "center", sortable: true },
    { key: "lowStockAt", header: "Low Stock Threshold", align: "center" },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            restockProduct(row.id, 25);
            showToast(`Restocked +25 units of "${row.name}" — status updated to ACTIVE`);
          }}
          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white font-semibold text-[11px] transition-colors border border-amber-200"
        >
          + Restock (25)
        </button>
      ),
    },
  ];

  // ── Handlers for Product Modal ────────────────────────────────────────
  const handleOpenAddProduct = (defaultService?: ServiceSlug) => {
    setEditingProduct({
      id: "",
      source: defaultService || ServiceSlug.SPARK,
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
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (item: UnifiedProduct) => {
    setEditingProduct({ ...item });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (item: UnifiedProduct) => {
    deleteProduct(item.id);
    showToast(`Removed "${item.name}" from the website catalog`);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) return;

    const saved = saveProduct({
      ...editingProduct,
      name: editingProduct.name.trim(),
      source: editingProduct.source || ServiceSlug.SPARK,
    });
    setProductModalOpen(false);
    setEditingProduct(null);
    showToast(`Saved "${saved.name}" — synced across Admin & Public Website`);
  };

  const handleSaveTargetsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTargets({
      salesTargetKobo: Math.max(100000, Number(targetForm.salesNaira) * 100),
      expenseBudgetKobo: Math.max(100000, Number(targetForm.expenseNaira) * 100),
      bookingsTarget: Math.max(1, Number(targetForm.bookingsTarget)),
      visitorsTarget: Math.max(1, Number(targetForm.visitorsTarget)),
    });
    setTargetModalOpen(false);
    showToast("Monthly targets updated");
  };

  const handleCreateTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.customer.trim() || !txForm.activitySummary.trim()) return;
    const amountKobo = Math.round(Number(txForm.amountNaira || 0) * 100);
    const created = recordTransaction({
      source: txForm.source,
      activityType: txForm.activityType,
      activitySummary: txForm.activitySummary.trim(),
      customer: txForm.customer.trim(),
      amountKobo,
      location: txForm.location,
      status: txForm.status,
      actor: "Super Admin",
    });
    setTxModalOpen(false);
    setTxForm({
      source: ServiceSlug.SPARK,
      activityType: "SALE",
      activitySummary: "",
      customer: "",
      amountNaira: "",
      location: "Medical Road",
      status: "PAID",
    });
    showToast(`Recorded ${created.activityType} (${created.invoiceNo}) on Unified Dashboard`);
  };

  return (
    <div className="space-y-7 min-w-0 max-w-full">
      {/* Live Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header & Global Service Scope Pill Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white border border-border p-1.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
            <NextImage
              src="/logos/zino-logo.png"
              alt="Zino One Dashboard Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-heading tracking-tight min-w-0">
                Unified Business &amp; Financial Dashboard
              </h1>
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase shrink-0",
                dashboardData?.isUnavailable
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  dashboardData?.isUnavailable ? "bg-rose-500" : "bg-emerald-500",
                  !dashboardData && "animate-pulse"
                )} />
                {dashboardData?.isUnavailable ? "Data Unavailable" : dashboardData ? "Summary Loaded" : "Loading Summary"}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Cross-service reporting, catalog management, payment tracking, and operational activity in one workspace.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Multi-Currency Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200 text-xs font-mono font-bold">
            {(["NGN", "USD", "GBP", "EUR"] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => {
                  setActiveCurrency(curr);
                  showToast(`Currency converted to ${CURRENCY_CONFIG[curr].label}`);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  activeCurrency === curr
                    ? "bg-white text-gray-900 shadow-xs font-extrabold"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {CURRENCY_CONFIG[curr].symbol} {curr}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSyncAllHubs}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold text-xs transition-colors shadow-2xs"
            title="Force synchronization across all 6 subsidiary databases"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5 text-active", isSyncingAll && "animate-spin")} />
            <span>{isSyncingAll ? "Syncing..." : "Force Sync"}</span>
          </button>

          <button
            type="button"
            onClick={() => setTxModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-active hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Activity / Invoice</span>
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} align="right" />
        </div>
      </div>

      {/* ── LIVE SUBSIDIARY OPERATIONS SIMULATOR & CONTROL TOOLBAR ── */}
      <div className="bg-gradient-to-r from-[#14142B] to-[#1E1E38] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-900/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Live Operations Simulator &amp; Instant Triggers</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  {networkLatency === null ? "Latency: —" : `API latency: ${networkLatency}ms`}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Test real-time data propagation across all subsidiaries or export verified audit trails.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportAuditCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold transition-colors border border-white/15 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSecurityDrawerOpen(!isSecurityDrawerOpen)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border cursor-pointer",
                isSecurityDrawerOpen
                  ? "bg-indigo-600 text-white border-indigo-400"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Diagnostics</span>
            </button>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleSimulateBooking}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-apartments/50 transition-all text-left group cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-cyan-300 font-bold block uppercase tracking-wider">
                Zino Apartments
              </span>
              <span className="text-xs font-semibold text-white group-hover:text-cyan-200 transition-colors">
                + Simulate Instant Guest Booking
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={handleSimulatePosSale}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all text-left group cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-blue-300 font-bold block uppercase tracking-wider">
                Zino Spark Retail
              </span>
              <span className="text-xs font-semibold text-white group-hover:text-blue-200 transition-colors">
                + Simulate Computer Village POS Sale
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={handleSimulateDispatch}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all text-left group cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-300 font-bold block uppercase tracking-wider">
                Top Builders Depot
              </span>
              <span className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                + Simulate 100 Bags Cement Dispatch
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Expanded Security & Diagnostics Drawer */}
        {isSecurityDrawerOpen && (
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono animate-in fade-in">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Dashboard Summary API</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{dashboardData ? "Summary response received" : "Waiting for response"}</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Active Data Scope</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{globalServiceFilter === "ALL" ? "All services" : SERVICE_CONFIG[globalServiceFilter].name}</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Selected Location</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{globalLocationFilter === "ALL" ? "All locations" : LOCATIONS.find((location) => location.id === globalLocationFilter)?.name || "Selected location"}</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Last API Response</span>
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>{networkLatency === null ? "Not received" : `${networkLatency} ms`}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Service Scope Switcher Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => updateGlobalServiceFilter("ALL")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0",
            activeServiceScope === "ALL"
              ? "bg-[#14142B] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-700 hover:text-gray-900"
          )}
        >
          All 6 Unified Businesses
        </button>
        {Object.values(ServiceSlug).map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => updateGlobalServiceFilter(slug)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border",
              activeServiceScope === slug
                ? "text-white shadow-sm border-transparent"
                : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
            )}
            style={
              activeServiceScope === slug
                ? { backgroundColor: SERVICE_CONFIG[slug].color }
                : undefined
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  activeServiceScope === slug ? "#fff" : SERVICE_CONFIG[slug].color,
              }}
            />
            <span>{SERVICE_CONFIG[slug].name}</span>
          </button>
        ))}
      </div>

      {/* ── A: Financial Summary (Revenue / Expenses / Net Profit) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinancialCard
          title="Revenue Today"
          value={formatMoney(financialTotals.totalRevenueKobo)}
          delta={18.4}
          isPositive={true}
          accentColor="#28A745"
          subtitle={
            activeServiceScope === "ALL"
              ? "All 6 services combined"
              : `${SERVICE_CONFIG[activeServiceScope].name} revenue`
          }
        />
        <FinancialCard
          title="Total Expenses Today"
          value={formatMoney(financialTotals.totalExpenseKobo)}
          delta={-5.2}
          isPositive={true}
          accentColor="#E74C3C"
          subtitle="Ops, payroll, restocks & purchases"
        />
        <FinancialCard
          title="Net Profit This Month"
          value={formatMoney(financialTotals.netProfitKobo)}
          delta={22.1}
          isPositive={true}
          accentColor="#4F46E5"
          subtitle="Revenue minus all recorded expenses"
        />
      </div>

      {/* ── B: Monthly Targets vs Actuals (Functional Edit Modal) ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 pb-3 mb-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-active" />
            <h3 className="text-base font-semibold text-gray-900">
              Monthly Targets vs Live Actuals
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setTargetForm({
                salesNaira: Math.round(targets.salesTargetKobo / 100),
                expenseNaira: Math.round(targets.expenseBudgetKobo / 100),
                bookingsTarget: targets.bookingsTarget,
                visitorsTarget: targets.visitorsTarget,
              });
              setTargetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-3 h-3 text-active" />
            <span>Edit Targets</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TargetBar
            label="Sales & Revenue Target"
            current={Math.round(financialTotals.totalRevenueKobo / 100)}
            target={Math.round(targets.salesTargetKobo / 100)}
            unit="₦"
            color="#4F46E5"
          />
          <TargetBar
            label="Expense Budget Utilization"
            current={Math.round(financialTotals.totalExpenseKobo / 100)}
            target={Math.round(targets.expenseBudgetKobo / 100)}
            unit="₦"
            color="#E74C3C"
          />
          <TargetBar
            label="Apartment Bookings Target"
            current={financialTotals.bookingsCount}
            target={targets.bookingsTarget}
            unit=""
            color="#1E3A5F"
          />
          <TargetBar
            label="Visitor Check-In Target"
            current={financialTotals.visitorsCount}
            target={targets.visitorsTarget}
            unit=""
            color="#7C3AED"
          />
        </div>
      </div>

      {/* ── Row 1: 8 KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((st) => (
          <StatCard
            key={st.title}
            title={st.title}
            value={st.value}
            icon={st.icon}
            iconColor={st.iconColor}
            iconBg={st.iconBg}
            delta={st.delta}
            source={(st as any).source}
            subtitle={(st as any).subtitle}
          />
        ))}
      </div>

      {/* ── VISUAL ECOSYSTEM SHOWCASE: Images & Visual Designs Describing All 6 Website Sections ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-active text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Layers className="w-3 h-3" />
              <span>Unified Platform Visual Architecture</span>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">
              Six Unified Website Sections Connected to This Dashboard
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Visual overview of each business unit, what it is built for, and quick launch controls for both the public storefront and admin workspace.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs transition-colors shrink-0"
          >
            <span>Open Public Home Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VISUAL_SERVICE_SECTIONS.map((sec) => {
            const cfg = SERVICE_CONFIG[sec.slug];
            const serviceProductsCount = products.filter((p) => p.source === sec.slug).length;
            const serviceInvoicesCount = invoices.filter((i) => i.source === sec.slug).length;
            const Icon = sec.icon;

            return (
              <div
                key={sec.slug}
                className="group rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Visual Photography Header with Overlay Design */}
                <div className="relative h-40 w-full overflow-hidden bg-gray-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sec.image}
                    alt={sec.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <SourceBadge source={sec.slug} size="sm" />
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {sec.metrics}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                        {sec.tagline}
                      </p>
                      <h4 className="text-sm font-extrabold text-white leading-snug">
                        {sec.title}
                      </h4>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 bg-white p-1 border border-white/20 overflow-hidden"
                    >
                      {(sec as any).logoUrl ? (
                        <NextImage
                          src={(sec as any).logoUrl}
                          alt={sec.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: cfg.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.description}</p>

                  <div className="space-y-3">
                    {/* Live Synced Counters */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">
                          {serviceProductsCount}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Active Products / Items
                        </p>
                      </div>
                      <div className="border-l border-gray-200">
                        <p className="text-sm font-extrabold text-gray-900">
                          {serviceInvoicesCount}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Synced Invoices / Logs
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={sec.adminHref}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-white font-bold text-xs transition-opacity hover:opacity-90"
                        style={{ backgroundColor: cfg.color }}
                      >
                        <span>Manage Module</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenAddProduct(sec.slug)}
                        className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                        title={`Add item to ${cfg.name}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-active" />
                        <span>Add Item</span>
                      </button>
                      <Link
                        href={sec.publicHref}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        title={`View public ${cfg.name} page`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── APARTMENT SUITES REAL-TIME OCCUPANCY & PMS QUICK BOARD ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B0F19] p-2 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900">
                  Zino Luxury Apartments — Real-Time Room Board
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold">
                  Lekki Phase 1
                </span>
              </div>
              <p className="text-xs text-gray-600">
                One-click room status management: instantly toggle suite availability between Available, Occupied, and Cleaning.
              </p>
            </div>
          </div>
          <Link
            href="/admin/apartments/rooms"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold transition-colors shrink-0"
          >
            <span>Full PMS Rooms Setup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "suite_101",
              title: "Deluxe Studio Suite",
              rateKobo: 5000000,
              features: "1 Bed · 1 Bath · 45 sqm",
              floor: "1st Floor, East Wing",
            },
            {
              id: "suite_102",
              title: "Executive 1-Bedroom",
              rateKobo: 7500000,
              features: "1 Bed · Lounge · 75 sqm",
              floor: "2nd Floor, Ocean View",
            },
            {
              id: "suite_201",
              title: "Luxury 2-Bedroom Suite",
              rateKobo: 11000000,
              features: "2 Bed · Kitchen · 115 sqm",
              floor: "3rd Floor, West Wing",
            },
            {
              id: "suite_301",
              title: "Presidential Penthouse",
              rateKobo: 18000000,
              features: "3 Bed · Private Terrace · 210 sqm",
              floor: "Top Penthouse Floor",
            },
          ].map((room) => {
            const status = suiteStatuses[room.id] || "AVAILABLE";
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
                className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        statusConfig.bg
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                      <span>{statusConfig.label}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-900">
                      {formatMoney(room.rateKobo)}/night
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 pt-1">{room.title}</h4>
                  <p className="text-[11px] text-gray-600">{room.features}</p>
                  <p className="text-[10px] font-mono text-gray-500">{room.floor}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleRoomStatus(room.id, room.title)}
                  className="w-full py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-900 text-[11px] font-bold font-mono transition-colors shadow-2xs cursor-pointer"
                >
                  Toggle Status ({status})
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: Interactive Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <ChartCard
          title="Sales — Last 30 Days"
          subtitle={
            chartGrouping === "service"
              ? "Daily revenue breakdown by business service (NGN)"
              : "Daily turnover breakdown by branch location (NGN)"
          }
          rightAction={
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartGrouping("service")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartGrouping === "service"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                By service
              </button>
              <button
                type="button"
                onClick={() => setChartGrouping("location")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartGrouping === "location"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                By location
              </button>
            </div>
          }
        >
          <div className="w-full h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {chartGrouping === "service" ? (
                <LineChart
                  data={liveDailyChart}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                  <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#8A8A9A"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value) * 100), "Sales"]}
                    contentStyle={{
                      backgroundColor: "#1A1A2E",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line type="monotone" dataKey="Spark" name="Zino Spark" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Builders" name="Top Builders" stroke="#006B3F" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Galaxy" name="Device Galaxy" stroke="#E74C3C" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Apartments" name="Apartments" stroke="#1E3A5F" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Billstacks" name="Billstacks" stroke="#28A745" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <LineChart
                  data={liveLocationChart}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                  <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#8A8A9A"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value) * 100), "Sales"]}
                    contentStyle={{
                      backgroundColor: "#1A1A2E",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  {dashboardData
                    ? locationSeries.map((series: any, index: number) => (
                        <Line
                          key={series.locationId}
                          type="monotone"
                          dataKey={`Location ${index + 1}`}
                          name={series.name}
                          stroke={series.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))
                    : <>
                        <Line type="monotone" dataKey="MedicalRoad" name="Medical Road" stroke="#10B981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Adepele" name="Adepele Shop" stroke="#2563EB" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Olayeni" name="Olayeni Shop" stroke="#F59E0B" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="AllLocations" name="All Locations" stroke="#E11D48" strokeWidth={2.5} />
                      </>}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Sales — Current Financial Year"
          subtitle="Monthly revenue Jan – Nov 2026 across core services"
        >
          <div className="w-full h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={liveFinancialYearChart}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="month" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8A8A9A"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) * 100), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#1A1A2E",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="Spark" name="Zino Spark" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Builders" name="Top Builders" stroke="#006B3F" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Galaxy" name="Device Galaxy" stroke="#E74C3C" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Apartments" name="Apartments" stroke="#1E3A5F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Needs Attention + Live Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Needs Attention */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-semibold text-gray-900">Needs Attention</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                {attentionItems.length} Actionable
              </span>
            </div>
            {attentionItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All urgent alerts have been resolved!
              </div>
            ) : (
              <div className="space-y-3">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <Link href={item.href} className="flex items-start gap-3 flex-1 min-w-0">
                      <SourceBadge source={item.source} size="sm" className="mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.detail}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAttentionItems((prev) => prev.filter((a) => a.id !== item.id));
                        showToast(`Resolved alert: ${item.title}`);
                      }}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-emerald-600 hover:text-white text-[10px] font-bold text-gray-600 transition-colors shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-500">Automated cross-service health checks</span>
            <span className="font-semibold text-emerald-600">All 6 services online</span>
          </div>
        </div>

        {/* Recent Activity (Synced with usePlatformStore) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-active" />
                <h3 className="text-base font-semibold text-gray-900">
                  Live Cross-Service Activity Feed
                </h3>
              </div>
              <Link
                href="/admin/activity"
                className="text-xs font-bold text-active hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {activities
                .filter(
                  (act) => activeServiceScope === "ALL" || act.source === activeServiceScope
                )
                .slice(0, 7)
                .map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg border-l-2 hover:bg-gray-50/70 transition-colors text-xs"
                    style={{
                      borderLeftColor: SERVICE_CONFIG[act.source]?.color || "#4F46E5",
                    }}
                  >
                    <SourceBadge source={act.source} size="sm" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 truncate">{act.actor}</span>
                        <span className="text-[11px] text-gray-500 shrink-0">{act.time}</span>
                      </div>
                      <p className="text-gray-700 text-[11px] mt-0.5 break-words">{act.action}</p>
                      {act.amount && (
                        <span className="inline-block mt-1 font-bold text-gray-900 text-[11px]">
                          {act.amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200 text-center">
            <Link
              href="/admin/activity"
              className="text-xs font-bold text-active hover:underline"
            >
              Open Chronological Activity Audit Trail →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 4: Payment Due Tables (Functional Settlement) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <DataTable
          title="Sales Payment Due"
          columns={salesPaymentDueColumns}
          data={salesPaymentDueRows}
          showExportButtons={true}
          showSourceColumn={true}
          searchPlaceholder="Search customer or invoice..."
          emptyMessage="All customer debtor invoices settled!"
        />
        <DataTable
          title="Purchase Payment Due"
          columns={purchasePaymentDueColumns}
          data={purchasePaymentDueRows}
          showExportButtons={true}
          showSourceColumn={true}
          searchPlaceholder="Search supplier or reference..."
          emptyMessage="All supplier purchase balances settled!"
        />
      </div>

      {/* ── C: Low Stock & Quality Alerts (Dynamic + Instant Restock) ── */}
      <DataTable
        title="⚠ Existing Low Stock & Quality Alerts"
        columns={productAlertColumns}
        data={productAlertRows}
        showExportButtons={true}
        showSourceColumn={true}
        searchPlaceholder="Search product or SKU..."
        emptyMessage="No low-stock alerts — all products are well stocked!"
        rightAction={
          <Link
            href="/admin/spark/stock-alert"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            View Full Stock Alert
          </Link>
        }
      />

      {/* ── D: Unified Invoice & Transaction Activity (All Sections Labeled + CSV/Excel/PDF/Column Visibility) ── */}
      <div className="space-y-3 min-w-0">
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Filter className="w-4 h-4 text-active" />
              <span>Filter All Website Invoice Activity:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={invoiceFilter.service}
                onChange={(e) =>
                  setInvoiceFilter((f) => ({ ...f, service: e.target.value }))
                }
                className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-active"
              >
                <option value="">All Website Sections</option>
                <option value="SPARK">Zino Spark (POS)</option>
                <option value="APARTMENTS">Zino Apartments (Bookings)</option>
                <option value="GALAXY">Device Galaxy (E-Commerce)</option>
                <option value="BUILDERS">Top Builders (Yard Sales)</option>
                <option value="BILLSTACKS">Billstacks (SaaS Invoicing)</option>
                <option value="VISITORS">Visitor Management (Kiosk)</option>
              </select>
              <select
                value={invoiceFilter.type}
                onChange={(e) =>
                  setInvoiceFilter((f) => ({ ...f, type: e.target.value }))
                }
                className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-active"
              >
                <option value="">All Activity Types</option>
                <option value="SALE">Sale</option>
                <option value="BOOKING">Booking</option>
                <option value="ORDER">Online Order</option>
                <option value="INVOICE">B2B Invoice</option>
                <option value="EXPENSE">Expense / Restock</option>
                <option value="VISIT">Visitor Check-In</option>
              </select>
              <input
                type="date"
                value={invoiceFilter.from}
                onChange={(e) =>
                  setInvoiceFilter((f) => ({ ...f, from: e.target.value }))
                }
                className="h-8 px-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-900 focus:outline-none focus:border-active"
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                value={invoiceFilter.to}
                onChange={(e) =>
                  setInvoiceFilter((f) => ({ ...f, to: e.target.value }))
                }
                className="h-8 px-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-900 focus:outline-none focus:border-active"
              />
              <button
                type="button"
                onClick={() =>
                  setInvoiceFilter({ service: "", type: "", from: "", to: "" })
                }
                className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <DataTable
          title="All Invoice & Transaction Activity (Labeled by Source Section & Activity)"
          columns={invoiceColumns}
          data={displayInvoiceRows}
          showExportButtons={true}
          showSourceColumn={true}
          searchPlaceholder="Search invoice, customer, activity carried out..."
          emptyMessage="No transaction activity found for selected filters."
          pageSize={10}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTxModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-active text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Invoice / Activity</span>
              </button>
              <Link
                href="/admin/activity"
                className="text-xs font-bold text-active hover:underline flex items-center gap-1"
              >
                Full Audit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          }
        />
      </div>

      {/* ── E: Unified Products & Services Manager (Drag & Drop Local Image Upload + Live Sync) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-active" />
              <h3 className="text-lg font-extrabold text-gray-900">
                Website Products &amp; Services Studio
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Add or remove products and services, drag-and-drop images from your device&apos;s local storage, and edit name labels or pricing across all 6 sections of the website.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddProduct()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-active hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product / Service</span>
            </button>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Full Catalog View →
            </Link>
          </div>
        </div>

        {/* Service filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: "ALL", label: `All Website Items (${products.length})` },
            {
              key: ServiceSlug.SPARK,
              label: `Zino Spark (${products.filter((p) => p.source === ServiceSlug.SPARK).length})`,
            },
            {
              key: ServiceSlug.GALAXY,
              label: `Device Galaxy (${products.filter((p) => p.source === ServiceSlug.GALAXY).length})`,
            },
            {
              key: ServiceSlug.BUILDERS,
              label: `Top Builders (${products.filter((p) => p.source === ServiceSlug.BUILDERS).length})`,
            },
            {
              key: ServiceSlug.APARTMENTS,
              label: `Apartments (${products.filter((p) => p.source === ServiceSlug.APARTMENTS).length})`,
            },
            {
              key: ServiceSlug.BILLSTACKS,
              label: `Billstacks (${products.filter((p) => p.source === ServiceSlug.BILLSTACKS).length})`,
            },
            {
              key: ServiceSlug.VISITORS,
              label: `Visitors (${products.filter((p) => p.source === ServiceSlug.VISITORS).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setProductServiceTab(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg font-bold transition-colors shrink-0",
                productServiceTab === tab.key
                  ? "bg-active text-white shadow-2xs"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visual Product & Service Cards Grid + Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products
            .filter(
              (p) => productServiceTab === "ALL" || p.source === productServiceTab
            )
            .map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Visual Image Header */}
                  <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <SourceBadge source={item.source} size="sm" />
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="absolute bottom-2 left-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                        {item.label}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3.5">
                    <p className="text-[10px] font-mono text-gray-500">{item.sku}</p>
                    <h4 className="text-xs font-extrabold text-gray-900 mt-0.5 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 min-h-[28px]">
                      {item.description || item.label}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-200">
                      <span className="text-sm font-black text-gray-900">
                        {item.priceDisplay}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">
                        Stock: <strong className="text-gray-900">{item.totalStock}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit / Remove Footer */}
                <div className="px-3.5 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditProduct(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white border border-gray-200 hover:border-active text-xs font-bold text-gray-800 hover:text-active transition-colors shadow-2xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Image / Label</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(item)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors"
                    title="Remove from website"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── MODAL 1: Add / Edit Product or Service (with Drag & Drop Local Image Storage) ── */}
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
                  Changes sync live across the Admin Dashboard and Public Storefronts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Website Section / Service *
                  </label>
                  <select
                    value={editingProduct.source || ServiceSlug.SPARK}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        source: e.target.value as ServiceSlug,
                      })
                    }
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-active"
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
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
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
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
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
                        priceDisplay: e.target.value,
                      })
                    }
                    placeholder="e.g. ₦480,000"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={editingProduct.totalStock ?? 10}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        totalStock: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
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
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-active"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LOW_STOCK">LOW_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                    <option value="PROMO">PROMO</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-active hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Sync Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Edit Monthly Targets ── */}
      {targetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900">
                Adjust Monthly Targets
              </h3>
              <button
                type="button"
                onClick={() => setTargetModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTargetsSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Monthly Sales Revenue Target (₦)
                </label>
                <input
                  type="number"
                  required
                  value={targetForm.salesNaira}
                  onChange={(e) =>
                    setTargetForm({ ...targetForm, salesNaira: Number(e.target.value) })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-active"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Monthly Expense Budget (₦)
                </label>
                <input
                  type="number"
                  required
                  value={targetForm.expenseNaira}
                  onChange={(e) =>
                    setTargetForm({ ...targetForm, expenseNaira: Number(e.target.value) })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-active"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Bookings Target
                  </label>
                  <input
                    type="number"
                    required
                    value={targetForm.bookingsTarget}
                    onChange={(e) =>
                      setTargetForm({
                        ...targetForm,
                        bookingsTarget: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Visitors Target
                  </label>
                  <input
                    type="number"
                    required
                    value={targetForm.visitorsTarget}
                    onChange={(e) =>
                      setTargetForm({
                        ...targetForm,
                        visitorsTarget: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-active"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-active hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Record New Invoice / Website Activity ── */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900">
                Record Website Activity / Invoice
              </h3>
              <button
                type="button"
                onClick={() => setTxModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTransactionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Source Website Section *
                  </label>
                  <select
                    value={txForm.source}
                    onChange={(e) =>
                      setTxForm({ ...txForm, source: e.target.value as ServiceSlug })
                    }
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-active"
                  >
                    <option value={ServiceSlug.SPARK}>Zino Spark</option>
                    <option value={ServiceSlug.APARTMENTS}>Zino Apartments</option>
                    <option value={ServiceSlug.BUILDERS}>Top Builders</option>
                    <option value={ServiceSlug.GALAXY}>Device Galaxy</option>
                    <option value={ServiceSlug.BILLSTACKS}>Billstacks</option>
                    <option value={ServiceSlug.VISITORS}>Visitors Kiosk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Activity Type *
                  </label>
                  <select
                    value={txForm.activityType}
                    onChange={(e) =>
                      setTxForm({ ...txForm, activityType: e.target.value as any })
                    }
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-gray-900 bg-white focus:outline-none focus:border-active"
                  >
                    <option value="SALE">SALE</option>
                    <option value="BOOKING">BOOKING</option>
                    <option value="ORDER">ORDER</option>
                    <option value="INVOICE">INVOICE</option>
                    <option value="EXPENSE">EXPENSE</option>
                    <option value="VISIT">VISIT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Activity Carried Out *
                </label>
                <input
                  type="text"
                  required
                  value={txForm.activitySummary}
                  onChange={(e) =>
                    setTxForm({ ...txForm, activitySummary: e.target.value })
                  }
                  placeholder="e.g. Sold 50 bags Dangote Cement or 2-Night Deluxe Booking"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-1">
                  Customer / Guest / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={txForm.customer}
                  onChange={(e) => setTxForm({ ...txForm, customer: e.target.value })}
                  placeholder="e.g. Chief Okonkwo or Walk-in Customer"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Amount (₦ Naira)
                  </label>
                  <input
                    type="number"
                    value={txForm.amountNaira}
                    onChange={(e) =>
                      setTxForm({ ...txForm, amountNaira: e.target.value })
                    }
                    placeholder="e.g. 250000"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={txForm.location}
                    onChange={(e) =>
                      setTxForm({ ...txForm, location: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-active hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
                >
                  Record to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
