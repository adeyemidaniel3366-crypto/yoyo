"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Check,
  Tag,
  Image as ImageIcon,
  Filter,
  Target,
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
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { StatCard } from "@/components/ui/stat-card";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ChartCard } from "@/components/ui/chart-card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency, formatCurrencyCompact } from "@/lib/money";
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
  ATTENDANCE: "bg-gray-50 text-gray-700 border border-gray-200",
};

function ActivityTypeBadge({ type }: { type: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", ACTIVITY_TYPE_STYLES[type] ?? "bg-gray-50 text-gray-600 border border-gray-200")}>
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Monthly Target Progress Bar
// ---------------------------------------------------------------------------
function TargetBar({ label, current, target, unit = "", color = "#4F46E5" }: {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const isGood = pct >= 70;
  const isWarn = pct >= 40 && pct < 70;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="font-semibold text-heading">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted">{unit}{current.toLocaleString()} / {unit}{target.toLocaleString()}</span>
          <span className={cn("font-bold", isGood ? "text-emerald-600" : isWarn ? "text-amber-600" : "text-rose-600")}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", isGood ? "bg-emerald-500" : isWarn ? "bg-amber-400" : "bg-rose-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Financial Summary Card
// ---------------------------------------------------------------------------
function FinancialCard({ title, value, delta, isPositive, accentColor, subtitle, children }: {
  title: string;
  value: string;
  delta?: number;
  isPositive?: boolean;
  accentColor: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden flex">
      <div className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-heading">{value}</p>
        {delta !== undefined && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs font-semibold", isPositive ? "text-emerald-600" : "text-rose-600")}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? "+" : ""}{delta}% vs last month</span>
          </div>
        )}
        {subtitle && <p className="text-[11px] text-muted mt-1">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------
export default function UnifiedAdminDashboard() {
  const [chartGrouping, setChartGrouping] = useState<"service" | "location">("service");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Invoice activity state
  const [invoiceFilter, setInvoiceFilter] = useState({ service: "", type: "", from: "", to: "" });
  const [invoiceRows, setInvoiceRows] = useState<any[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Products & Services Live In-Dashboard Management
  const [productsList, setProductsList] = useState<any[]>([
    { id: "dp_1", source: ServiceSlug.SPARK, name: "Samsung 990 PRO 4TB NVMe SSD", label: "Best Seller", price: "₦480,000", imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200", status: "ACTIVE" },
    { id: "dp_2", source: ServiceSlug.SPARK, name: "Apple MacBook Pro 16\" M3 Max", label: "Flagship POS", price: "₦4,850,000", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200", status: "ACTIVE" },
    { id: "dp_3", source: ServiceSlug.GALAXY, name: "Lexar SL500 Portable SSD 2TB", label: "Hot Deal", price: "₦220,000", imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200", status: "ACTIVE" },
    { id: "dp_4", source: ServiceSlug.BUILDERS, name: "Dangote Cement 50kg", label: "Wholesale Bag", price: "₦9,800", imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200", status: "ACTIVE" },
    { id: "dp_5", source: ServiceSlug.BUILDERS, name: "Iron Rod 16mm (Length)", label: "High Tensile", price: "₦18,000", imageUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=200", status: "LOW_STOCK" },
    { id: "dp_6", source: ServiceSlug.APARTMENTS, name: "Luxury 2-Bedroom Suite", label: "Executive Hospitality", price: "₦50,000 / night", imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=200", status: "ACTIVE" },
    { id: "dp_7", source: ServiceSlug.APARTMENTS, name: "Deluxe Studio Apartment", label: "Popular Choice", price: "₦30,000 / night", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200", status: "ACTIVE" },
    { id: "dp_8", source: ServiceSlug.BILLSTACKS, name: "Billstacks Standard Plan", label: "SaaS Subscription", price: "₦2,000 / month", imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200", status: "ACTIVE" },
  ]);

  const [productServiceTab, setProductServiceTab] = useState<string>("ALL");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: "",
      source: ServiceSlug.SPARK,
      name: "",
      label: "Featured",
      price: "₦0",
      imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
      status: "ACTIVE",
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (item: any) => {
    setEditingProduct({ ...item });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to remove this product or service from the website?")) {
      setProductsList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) return;

    if (editingProduct.id) {
      setProductsList((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
    } else {
      const newItem = {
        ...editingProduct,
        id: `dp_${Date.now()}`,
        source: editingProduct.source || ServiceSlug.SPARK,
        label: editingProduct.label || "New",
        price: editingProduct.price || "₦0",
        imageUrl: editingProduct.imageUrl || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
        status: editingProduct.status || "ACTIVE",
      };
      setProductsList((prev) => [newItem, ...prev]);
    }
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/dashboard/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data) setDashboardData(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Load invoice activity
  const loadInvoices = () => {
    setInvoiceLoading(true);
    const params = new URLSearchParams();
    if (invoiceFilter.service) params.set("service", invoiceFilter.service);
    if (invoiceFilter.type) params.set("type", invoiceFilter.type);
    if (invoiceFilter.from) params.set("from", invoiceFilter.from);
    if (invoiceFilter.to) params.set("to", invoiceFilter.to);
    params.set("perPage", "50");

    fetch(`/api/dashboard/invoices?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data?.rows) setInvoiceRows(res.data.rows);
      })
      .catch(() => {})
      .finally(() => setInvoiceLoading(false));
  };

  useEffect(() => {
    // Load invoice activity on mount with mock fallback
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mock data ──────────────────────────────────────────────────────────
  const rawCards = dashboardData?.cards || [];
  const getCard = (key: string) => rawCards.find((c: any) => c.key === key);

  const stats = [
    {
      title: "Total Sales (Today)",
      value: getCard("totalSales")?.display || "₦1,842,500",
      icon: ShoppingCart,
      iconColor: "#2563EB",
      iconBg: "#E8EEFB",
      delta: { value: getCard("totalSales")?.deltaPct ?? 12.4, isPositive: (getCard("totalSales")?.deltaPct ?? 12.4) >= 0, period: "vs yesterday" },
    },
    {
      title: "Net (Today)",
      value: getCard("net")?.display || "₦1,420,000",
      icon: DollarSign,
      iconColor: "#28A745",
      iconBg: "#E8F5EE",
      delta: { value: getCard("net")?.deltaPct ?? 8.1, isPositive: (getCard("net")?.deltaPct ?? 8.1) >= 0, period: "vs yesterday" },
    },
    {
      title: "Invoice Due",
      value: getCard("invoiceDue")?.display || "₦834,500",
      icon: FileText,
      iconColor: "#FFB800",
      iconBg: "#FFF9E6",
      subtitle: "Debtors in Builders & Spark",
    },
    {
      title: "Total Sell Return",
      value: getCard("sellReturn")?.display || "₦0.00",
      icon: RefreshCw,
      iconColor: "#E74C3C",
      iconBg: "#FDF2F2",
      subtitle: "0 returns today",
    },
    {
      title: "Total Purchase (Today)",
      value: getCard("totalPurchase")?.display || "₦650,000",
      icon: ShoppingBag,
      iconColor: "#17A2B8",
      iconBg: "#E8F7F9",
      subtitle: "Received orders",
    },
    {
      title: "Purchase Due",
      value: getCard("purchaseDue")?.display || "₦320,000",
      icon: AlertTriangle,
      iconColor: "#FFB800",
      iconBg: "#FFF9E6",
      subtitle: "Supplier balances pending",
    },
    {
      title: "Active Bookings",
      value: getCard("activeBookings")?.display || "2",
      icon: Building2,
      iconColor: "#1E3A5F",
      iconBg: "#E8EEF5",
      source: ServiceSlug.APARTMENTS,
      subtitle: "Deluxe & Luxury Suites",
    },
    {
      title: "Visitors Today",
      value: getCard("visitorsToday")?.display || "5",
      icon: Users,
      iconColor: "#7C3AED",
      iconBg: "#F3EFFF",
      source: ServiceSlug.VISITORS,
      subtitle: "Checked-in & expected",
    },
  ];

  // 30 Days Chart
  const sales30DaysData = [
    { date: "20 Oct", Adepele: 800000, MedicalRoad: 5200000, Olayeni: 1000000, AllLocations: 7000000 },
    { date: "22 Oct", Adepele: 5500000, MedicalRoad: 9800000, Olayeni: 200000, AllLocations: 15500000 },
    { date: "24 Oct", Adepele: 200000, MedicalRoad: 100000, Olayeni: 0, AllLocations: 300000 },
    { date: "26 Oct", Adepele: 2100000, MedicalRoad: 7500000, Olayeni: 0, AllLocations: 9600000 },
    { date: "28 Oct", Adepele: 1500000, MedicalRoad: 500000, Olayeni: 8000000, AllLocations: 10000000 },
    { date: "30 Oct", Adepele: 2500000, MedicalRoad: 4200000, Olayeni: 3000000, AllLocations: 9700000 },
    { date: "04 Nov", Adepele: 7500000, MedicalRoad: 16200000, Olayeni: 800000, AllLocations: 24500000 },
    { date: "06 Nov", Adepele: 2500000, MedicalRoad: 7200000, Olayeni: 400000, AllLocations: 10100000 },
    { date: "10 Nov", Adepele: 1200000, MedicalRoad: 4600000, Olayeni: 100000, AllLocations: 5900000 },
    { date: "12 Nov", Adepele: 5400000, MedicalRoad: 6800000, Olayeni: 200000, AllLocations: 12400000 },
    { date: "14 Nov", Adepele: 2800000, MedicalRoad: 7400000, Olayeni: 0, AllLocations: 10200000 },
    { date: "16 Nov", Adepele: 300000, MedicalRoad: 17200000, Olayeni: 400000, AllLocations: 17900000 },
    { date: "18 Nov", Adepele: 2400000, MedicalRoad: 1500000, Olayeni: 300000, AllLocations: 4200000 },
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

  const attentionItems = [
    { id: "att_1", source: ServiceSlug.SPARK, severity: "high", title: "Out of Stock: Zealot S69M (13360)", detail: "Warehouse — Asset Corps Plaza (0.0 Pc remaining)", href: "/admin/spark/stock-alert" },
    { id: "att_2", source: ServiceSlug.BUILDERS, severity: "high", title: "Debtor Overdue: Mama Bose Ventures", detail: "₦281,300 overdue by 128 days (Invoice INV-000104)", href: "/admin/builders/debtors" },
    { id: "att_3", source: ServiceSlug.APARTMENTS, severity: "medium", title: "Pending Booking Confirmation", detail: "Booking ref #ZINO-482091 for Executive 1-Bedroom", href: "/admin/apartments/bookings" },
    { id: "att_4", source: ServiceSlug.GALAXY, severity: "medium", title: "Product Review Pending Approval", detail: "MacBook Pro 16\" review by Chinedu O. (5 stars)", href: "/admin/galaxy/reviews" },
    { id: "att_5", source: ServiceSlug.VISITORS, severity: "low", title: "Expected Visitor Waiting", detail: "Adaeze Okafor arrived for meeting with Accounts Dept", href: "/admin/visitors" },
  ];

  const recentActivities = [
    { id: "act_1", source: ServiceSlug.SPARK, time: "2 min ago", actor: "Cashier (Medical Road)", action: "sold 2 × Samsung 990 PRO 4TB", amount: "₦960,000", location: "Medical Road" },
    { id: "act_2", source: ServiceSlug.APARTMENTS, time: "15 min ago", actor: "Reception Desk", action: "checked in Guest #1042 — Deluxe Studio", amount: "₦30,000", location: "Zino Main" },
    { id: "act_3", source: ServiceSlug.BUILDERS, time: "32 min ago", actor: "Sales Staff", action: "recorded sale to Adewumi Builders (40 bags Dangote)", amount: "₦392,000", location: "Builders Yard" },
    { id: "act_4", source: ServiceSlug.GALAXY, time: "1 hr ago", actor: "Online Customer", action: "placed Order #DG-892104 (Lexar SSD + Accessories)", amount: "₦245,000", location: "Galaxy Online" },
    { id: "act_5", source: ServiceSlug.VISITORS, time: "1 hr ago", actor: "Front Desk Kiosk", action: "issued visitor badge to Engr. Tunde Bakare", amount: null, location: "HQ Office" },
    { id: "act_6", source: ServiceSlug.BILLSTACKS, time: "2 hrs ago", actor: "Accountant", action: "sent Invoice #INV-000084 to Prime Technologies", amount: "₦1,450,000", location: null },
  ];

  // Payment due tables
  const salesPaymentDueColumns: ColumnDef<any>[] = [
    { key: "customer", header: "Customer", sortable: true },
    { key: "invoiceNo", header: "Invoice No.", sortable: true },
    { key: "dueAmount", header: "Due Amount", align: "right", sortable: true, cell: (row) => formatCurrency(row.dueAmountKobo) },
    {
      key: "action", header: "Action", align: "center",
      cell: (row) => (
        <button type="button" onClick={() => alert(`Recording payment for invoice ${row.invoiceNo}`)}
          className="px-2.5 py-1 rounded bg-active hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors">
          Pay
        </button>
      ),
    },
  ];

  const purchasePaymentDueColumns: ColumnDef<any>[] = [
    { key: "supplier", header: "Supplier", sortable: true },
    { key: "referenceNo", header: "Reference No", sortable: true },
    { key: "dueAmount", header: "Due Amount", align: "right", sortable: true, cell: (row) => formatCurrency(row.dueAmountKobo) },
    {
      key: "action", header: "Action", align: "center",
      cell: (row) => (
        <button type="button" onClick={() => alert(`Settling supplier reference ${row.referenceNo}`)}
          className="px-2.5 py-1 rounded bg-active hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors">
          Pay
        </button>
      ),
    },
  ];

  const salesPaymentDueRows = [
    { id: "spd_1", source: ServiceSlug.BUILDERS, customer: "Mama Bose Ventures", invoiceNo: "INV-000104", dueAmountKobo: 28130000 },
    { id: "spd_2", source: ServiceSlug.BUILDERS, customer: "Chief Okonkwo", invoiceNo: "INV-000105", dueAmountKobo: 19500000 },
    { id: "spd_3", source: ServiceSlug.SPARK, customer: "Vertex Systems Ltd", invoiceNo: "SPK-9042", dueAmountKobo: 35820000 },
  ];

  const purchasePaymentDueRows = [
    { id: "ppd_1", source: ServiceSlug.SPARK, supplier: "SanDisk Official West Africa", referenceNo: "PO-2026-881", dueAmountKobo: 32000000 },
  ];

  // Mock invoice rows for display if API not loaded
  const mockInvoiceRows = [
    { id: "inv_1", source: ServiceSlug.SPARK, activityType: "SALE", invoiceNo: "SPK-9044", customer: "Vertex Systems", amountDisplay: "₦1,200,000", status: "PAID", location: "Medical Road", createdAt: "2026-11-19" },
    { id: "inv_2", source: ServiceSlug.APARTMENTS, activityType: "BOOKING", invoiceNo: "ZINO-482091", customer: "Adaeze Okafor", amountDisplay: "₦90,000", status: "CONFIRMED", location: "Zino Main", createdAt: "2026-11-19" },
    { id: "inv_3", source: ServiceSlug.BUILDERS, activityType: "SALE", invoiceNo: "INV-000104", customer: "Mama Bose Ventures", amountDisplay: "₦281,300", status: "UNPAID", location: "Builders Yard", createdAt: "2026-11-18" },
    { id: "inv_4", source: ServiceSlug.GALAXY, activityType: "ORDER", invoiceNo: "DG-892104", customer: "Online Customer", amountDisplay: "₦245,000", status: "SHIPPED", location: "Galaxy Online", createdAt: "2026-11-18" },
    { id: "inv_5", source: ServiceSlug.BILLSTACKS, activityType: "INVOICE", invoiceNo: "INV-000084", customer: "Prime Technologies", amountDisplay: "₦1,450,000", status: "SENT", location: null, createdAt: "2026-11-17" },
    { id: "inv_6", source: ServiceSlug.VISITORS, activityType: "VISIT", invoiceNo: "VIS-00041", customer: "Engr. Tunde Bakare", amountDisplay: null, status: "CHECKED_IN", location: "HQ Office", createdAt: "2026-11-19" },
    { id: "inv_7", source: ServiceSlug.SPARK, activityType: "SALE", invoiceNo: "SPK-9039", customer: "Walk-in", amountDisplay: "₦960,000", status: "PAID", location: "Adepele Shop", createdAt: "2026-11-19" },
    { id: "inv_8", source: ServiceSlug.BUILDERS, activityType: "SALE", invoiceNo: "INV-000105", customer: "Chief Okonkwo", amountDisplay: "₦195,000", status: "PART_PAID", location: "Builders Yard", createdAt: "2026-11-16" },
    { id: "inv_9", source: ServiceSlug.APARTMENTS, activityType: "BOOKING", invoiceNo: "ZINO-482100", customer: "Mr. Femi Adeleke", amountDisplay: "₦180,000", status: "CHECKED_IN", location: "Zino Main", createdAt: "2026-11-15" },
    { id: "inv_10", source: ServiceSlug.GALAXY, activityType: "ORDER", invoiceNo: "DG-892201", customer: "TechHub Lagos", amountDisplay: "₦485,000", status: "DELIVERED", location: "Galaxy Online", createdAt: "2026-11-14" },
  ];

  const displayInvoiceRows = invoiceRows.length > 0 ? invoiceRows : mockInvoiceRows;

  // Invoice table columns
  const invoiceColumns: ColumnDef<any>[] = [
    {
      key: "activityType", header: "Activity", sortable: true,
      cell: (row) => <ActivityTypeBadge type={row.activityType} />,
    },
    { key: "invoiceNo", header: "Invoice / Ref No.", sortable: true },
    { key: "customer", header: "Customer", sortable: true },
    {
      key: "location", header: "Location",
      cell: (row) => <span className="text-xs text-muted">{row.location ?? "—"}</span>,
    },
    {
      key: "amountDisplay", header: "Amount", align: "right", sortable: true,
      cell: (row) => <span className="font-semibold">{row.amountDisplay ?? "—"}</span>,
    },
    {
      key: "status", header: "Status", align: "center",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt", header: "Date", sortable: true,
      cell: (row) => <span className="text-xs text-muted">{typeof row.createdAt === "string" ? row.createdAt.slice(0, 10) : row.createdAt}</span>,
    },
  ];

  // Low stock / product alert columns
  const productAlertColumns: ColumnDef<any>[] = [
    { key: "sku", header: "SKU", sortable: true },
    { key: "name", header: "Product Name", sortable: true },
    { key: "qty", header: "Current Stock", align: "center", sortable: true },
    { key: "lowStockAt", header: "Low Stock At", align: "center" },
    {
      key: "status", header: "Status", align: "center",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action", header: "Action", align: "center",
      cell: (row) => (
        <Link href="/admin/spark/stock-alert" className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white font-semibold text-[11px] transition-colors border border-amber-200">
          Restock
        </Link>
      ),
    },
  ];

  const productAlertRows = [
    { id: "pa_1", source: ServiceSlug.SPARK, sku: "ZLT-S69M-13360", name: "Zealot S69M Speaker", qty: 0, lowStockAt: 5, status: "OUT_OF_STOCK" },
    { id: "pa_2", source: ServiceSlug.SPARK, sku: "LXR-SL500-2TB", name: "Lexar SL500 Portable SSD 2TB", qty: 2, lowStockAt: 5, status: "LOW_STOCK" },
    { id: "pa_3", source: ServiceSlug.BUILDERS, sku: "IRON-ROD-16MM", name: "Iron Rod 16mm (per length)", qty: 2, lowStockAt: 10, status: "LOW_STOCK" },
    { id: "pa_4", source: ServiceSlug.SPARK, sku: "SAM-990PRO-4TB", name: "Samsung 990 PRO 4TB NVMe", qty: 1, lowStockAt: 3, status: "LOW_STOCK" },
    { id: "pa_5", source: ServiceSlug.BUILDERS, sku: "BUA-CEM-50KG", name: "BUA Cement 50kg", qty: 0, lowStockAt: 20, status: "OUT_OF_STOCK" },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading tracking-tight">Unified Business Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time multi-unit performance across all six Zino Group operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker align="right" />
        </div>
      </div>

      {/* ── A: Financial Summary (Revenue / Expenses / Net Profit) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinancialCard
          title="Revenue This Month"
          value="₦28,450,000"
          delta={18.4}
          isPositive={true}
          accentColor="#28A745"
          subtitle="All 6 services combined"
        />
        <FinancialCard
          title="Total Expenses This Month"
          value="₦4,220,000"
          delta={-5.2}
          isPositive={false}
          accentColor="#E74C3C"
          subtitle="Ops, payroll & purchases"
        />
        <FinancialCard
          title="Net Profit This Month"
          value="₦24,230,000"
          delta={22.1}
          isPositive={true}
          accentColor="#4F46E5"
          subtitle="Revenue minus all expenses"
        />
      </div>

      {/* ── B: Monthly Targets ── */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 mb-5 border-b border-border">
          <Target className="w-4 h-4 text-active" />
          <h3 className="text-base font-semibold text-heading">Monthly Targets vs Actuals</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TargetBar label="Sales Target" current={28450000} target={50000000} unit="₦" color="#4F46E5" />
          <TargetBar label="Expense Budget" current={4220000} target={6000000} unit="₦" color="#E74C3C" />
          <TargetBar label="Bookings Target" current={2} target={15} unit="" color="#1E3A5F" />
          <TargetBar label="Visitor Target" current={5} target={20} unit="" color="#7C3AED" />
        </div>
      </div>

      {/* ── Row 1: Stat Cards ── */}
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

      {/* ── Row 2: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Sales — Last 30 Days"
          subtitle="Daily turnover breakdown (NGN)"
          rightAction={
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              <button type="button" onClick={() => setChartGrouping("service")}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartGrouping === "service" ? "bg-white text-heading shadow-2xs" : "text-muted hover:text-heading"}`}>
                By service
              </button>
              <button type="button" onClick={() => setChartGrouping("location")}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartGrouping === "location" ? "bg-white text-heading shadow-2xs" : "text-muted hover:text-heading"}`}>
                By location
              </button>
            </div>
          }
        >
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales30DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value) * 100), "Sales"]}
                  contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="MedicalRoad" name="Medical Road" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Adepele" name="Adepele Shop" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Olayeni" name="Olayeni Shop" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="AllLocations" name="All Locations" stroke="#E11D48" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Sales — Current Financial Year" subtitle="Monthly revenue Jan – Dec 2026">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialYearData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="month" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value) * 100), "Revenue"]}
                  contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
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

      {/* ── Row 3: Attention + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-semibold text-heading">Needs Attention</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                {attentionItems.length} Urgent
              </span>
            </div>
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <Link key={item.id} href={item.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-border/70 hover:border-border block">
                  <SourceBadge source={item.source} size="sm" className="mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-heading">{item.title}</p>
                    <p className="text-[11px] text-muted truncate mt-0.5">{item.detail}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted">Automated system health checks</span>
            <span className="font-semibold text-active">All systems operational</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-active" />
                <h3 className="text-base font-semibold text-heading">Recent Activity</h3>
              </div>
              <Link href="/admin/activity" className="text-xs font-bold text-active hover:underline flex items-center gap-1">
                <span>View all</span><ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg border-l-2 hover:bg-gray-50/70 transition-colors text-xs"
                  style={{ borderLeftColor: SERVICE_CONFIG[act.source]?.color || "#4F46E5" }}>
                  <SourceBadge source={act.source} size="sm" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-heading truncate">{act.actor}</span>
                      <span className="text-[11px] text-muted shrink-0">{act.time}</span>
                    </div>
                    <p className="text-body text-[11px] mt-0.5">{act.action}</p>
                    {act.amount && <span className="inline-block mt-1 font-bold text-heading text-[11px]">{act.amount}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border text-center">
            <Link href="/admin/activity" className="text-xs font-bold text-active hover:underline">
              Open Chronological Activity Audit Trail →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 4: Payment Due Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable title="Sales Payment Due" columns={salesPaymentDueColumns} data={salesPaymentDueRows}
          showExportButtons={true} showSourceColumn={true} searchPlaceholder="Search customer or invoice..." emptyMessage="No data available in table" />
        <DataTable title="Purchase Payment Due" columns={purchasePaymentDueColumns} data={purchasePaymentDueRows}
          showExportButtons={true} showSourceColumn={true} searchPlaceholder="Search supplier or reference..." emptyMessage="No data available in table" />
      </div>

      {/* ── C: Low Stock / Product Alerts ── */}
      <DataTable
        title="⚠ Low Stock & Quality Alerts"
        columns={productAlertColumns}
        data={productAlertRows}
        showExportButtons={true}
        showSourceColumn={true}
        searchPlaceholder="Search product or SKU..."
        emptyMessage="No low-stock alerts — all products well stocked!"
        rightAction={
          <Link href="/admin/spark/stock-alert"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-heading hover:bg-gray-50 transition-colors">
            View Full Stock Alert
          </Link>
        }
      />

      {/* ── D: Unified Invoice Activity ── */}
      <div className="space-y-3">
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-border p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <Filter className="w-4 h-4" />
              <span>Filter Invoice Activity:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={invoiceFilter.service}
                onChange={(e) => setInvoiceFilter((f) => ({ ...f, service: e.target.value }))}
                className="h-8 px-2 rounded border border-border text-xs text-heading bg-white focus:outline-none focus:border-active"
              >
                <option value="">All Services</option>
                <option value="SPARK">Zino Spark</option>
                <option value="APARTMENTS">Apartments</option>
                <option value="GALAXY">Device Galaxy</option>
                <option value="BUILDERS">Top Builders</option>
                <option value="BILLSTACKS">Billstacks</option>
                <option value="VISITORS">Visitors</option>
              </select>
              <select
                value={invoiceFilter.type}
                onChange={(e) => setInvoiceFilter((f) => ({ ...f, type: e.target.value }))}
                className="h-8 px-2 rounded border border-border text-xs text-heading bg-white focus:outline-none focus:border-active"
              >
                <option value="">All Types</option>
                <option value="SALE">Sale</option>
                <option value="BOOKING">Booking</option>
                <option value="ORDER">Order</option>
                <option value="INVOICE">Invoice</option>
                <option value="EXPENSE">Expense</option>
                <option value="VISIT">Visit</option>
              </select>
              <input type="date" value={invoiceFilter.from}
                onChange={(e) => setInvoiceFilter((f) => ({ ...f, from: e.target.value }))}
                className="h-8 px-2 rounded border border-border text-xs text-heading focus:outline-none focus:border-active" />
              <span className="text-xs text-muted">to</span>
              <input type="date" value={invoiceFilter.to}
                onChange={(e) => setInvoiceFilter((f) => ({ ...f, to: e.target.value }))}
                className="h-8 px-2 rounded border border-border text-xs text-heading focus:outline-none focus:border-active" />
              <button type="button" onClick={loadInvoices} disabled={invoiceLoading}
                className="h-8 px-4 rounded bg-active text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                {invoiceLoading ? "Loading..." : "Apply Filters"}
              </button>
              <button type="button"
                onClick={() => { setInvoiceFilter({ service: "", type: "", from: "", to: "" }); setTimeout(loadInvoices, 50); }}
                className="h-8 px-3 rounded border border-border text-xs font-medium text-muted hover:text-heading hover:bg-gray-50 transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>

        <DataTable
          title="All Invoice & Transaction Activity"
          columns={invoiceColumns}
          data={displayInvoiceRows}
          showExportButtons={true}
          showSourceColumn={true}
          searchPlaceholder="Search invoice, customer, ref..."
          emptyMessage="No transaction activity found for selected filters."
          pageSize={10}
          rightAction={
            <Link href="/admin/activity"
              className="text-xs font-bold text-active hover:underline flex items-center gap-1">
              Full Activity Audit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      </div>

      {/* ── E: Products & Services Manager (Direct In-Dashboard Add, Remove, and Edit) ── */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-active" />
              <h3 className="text-base font-semibold text-heading">Products &amp; Services Manager</h3>
            </div>
            <p className="text-xs text-muted mt-1">
              Add, remove, or modify product and service labels, names, images, prices, and status across all sections of the website.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-active hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product / Service</span>
            </button>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50 transition-colors"
            >
              Advanced Catalog →
            </Link>
          </div>
        </div>

        {/* Service filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: "ALL", label: "All Items" },
            { key: ServiceSlug.SPARK, label: "Zino Spark" },
            { key: ServiceSlug.GALAXY, label: "Device Galaxy" },
            { key: ServiceSlug.BUILDERS, label: "Top Builders" },
            { key: ServiceSlug.APARTMENTS, label: "Apartments" },
            { key: ServiceSlug.BILLSTACKS, label: "Billstacks" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setProductServiceTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0",
                productServiceTab === tab.key
                  ? "bg-active text-white shadow-2xs"
                  : "bg-gray-100 text-muted hover:text-heading hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Products & Services Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-gray-50/80 font-semibold text-heading">
                <th className="py-3 px-4 w-14">Image</th>
                <th className="py-3 px-4">Product / Service Name</th>
                <th className="py-3 px-4">Custom Label</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productsList
                .filter((p) => productServiceTab === "ALL" || p.source === productServiceTab)
                .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-border overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-heading">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <SourceBadge source={item.source} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-heading">
                      {item.price}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(item)}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted hover:text-active transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-muted hover:text-rose-600 transition-colors"
                          title="Remove product from website"
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
      </div>

      {/* ── Add / Edit Product Modal ── */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-extrabold text-heading">
                {editingProduct.id ? "Edit Product or Service" : "Add New Product or Service"}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-heading mb-1">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Samsung 990 PRO 4TB or Deluxe Studio Suite"
                  className="w-full h-9 px-3 rounded-lg border border-border text-heading focus:outline-none focus:border-active"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-heading mb-1">
                    Service Section *
                  </label>
                  <select
                    value={editingProduct.source || ServiceSlug.SPARK}
                    onChange={(e) => setEditingProduct({ ...editingProduct, source: e.target.value as ServiceSlug })}
                    className="w-full h-9 px-2 rounded-lg border border-border text-heading bg-white focus:outline-none focus:border-active"
                  >
                    <option value={ServiceSlug.SPARK}>Zino Spark</option>
                    <option value={ServiceSlug.GALAXY}>Device Galaxy</option>
                    <option value={ServiceSlug.BUILDERS}>Top Builders</option>
                    <option value={ServiceSlug.APARTMENTS}>Zino Apartments</option>
                    <option value={ServiceSlug.BILLSTACKS}>Billstacks</option>
                    <option value={ServiceSlug.VISITORS}>Visitor Management</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-heading mb-1">
                    Label / Tag Badge *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.label || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, label: e.target.value })}
                    placeholder="e.g. Best Seller, Hot Deal, Promo"
                    className="w-full h-9 px-3 rounded-lg border border-border text-heading focus:outline-none focus:border-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-heading mb-1">
                    Price (Display) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    placeholder="e.g. ₦480,000 or ₦50,000 / night"
                    className="w-full h-9 px-3 rounded-lg border border-border text-heading focus:outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-heading mb-1">
                    Stock / Availability Status
                  </label>
                  <select
                    value={editingProduct.status || "ACTIVE"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-border text-heading bg-white focus:outline-none focus:border-active"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LOW_STOCK">LOW_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                    <option value="PROMO">PROMO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 h-9 px-3 rounded-lg border border-border text-heading focus:outline-none focus:border-active"
                  />
                  {editingProduct.imageUrl && (
                    <div className="w-9 h-9 rounded-lg border border-border overflow-hidden shrink-0">
                      <img src={editingProduct.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border font-semibold text-muted hover:text-heading hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-active hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
