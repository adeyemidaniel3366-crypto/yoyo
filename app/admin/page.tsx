"use client";

import React, { useState } from "react";
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
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  Package,
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

export default function UnifiedAdminDashboard() {
  const [chartGrouping, setChartGrouping] = useState<"service" | "location">("service");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    fetch("/api/dashboard/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data) {
          setDashboardData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Mock / Seed Data reflecting the screenshots & seed specs (with live override):
  const rawCards = dashboardData?.cards || [];
  const getCard = (key: string) => rawCards.find((c: any) => c.key === key);

  // Row 1: 8 Stat cards
  const stats = [
    {
      title: "Total Sales (Today)",
      value: getCard("totalSales")?.display || "₦1,842,500",
      icon: ShoppingCart,
      iconColor: "#2563EB",
      iconBg: "#E8EEFB",
      delta: {
        value: getCard("totalSales")?.deltaPct ?? 12.4,
        isPositive: (getCard("totalSales")?.deltaPct ?? 12.4) >= 0,
        period: "vs yesterday",
      },
    },
    {
      title: "Net (Today)",
      value: getCard("net")?.display || "₦1,420,000",
      icon: DollarSign,
      iconColor: "#28A745",
      iconBg: "#E8F5EE",
      delta: {
        value: getCard("net")?.deltaPct ?? 8.1,
        isPositive: (getCard("net")?.deltaPct ?? 8.1) >= 0,
        period: "vs yesterday",
      },
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

  // 30 Days Chart data matching Zino Spark screenshot
  const sales30DaysData = [
    { date: "20 Oct", Adepele: 800000, MedicalRoad: 5200000, Olayeni: 1000000, AllLocations: 7000000 },
    { date: "22 Oct", Adepele: 5500000, MedicalRoad: 9800000, Olayeni: 200000, AllLocations: 15500000 },
    { date: "24 Oct", Adepele: 200000, MedicalRoad: 100000, Olayeni: 0, AllLocations: 300000 },
    { date: "26 Oct", Adepele: 2100000, MedicalRoad: 7500000, Olayeni: 0, AllLocations: 9600000 },
    { date: "28 Oct", Adepele: 1500000, MedicalRoad: 500000, Olayeni: 8000000, AllLocations: 10000000 },
    { date: "30 Oct", Adepele: 2500000, MedicalRoad: 4200000, Olayeni: 3000000, AllLocations: 9700000 },
    { date: "02 Nov", Adepele: 600000, MedicalRoad: 200000, Olayeni: 0, AllLocations: 800000 },
    { date: "04 Nov", Adepele: 7500000, MedicalRoad: 16200000, Olayeni: 800000, AllLocations: 24500000 },
    { date: "06 Nov", Adepele: 2500000, MedicalRoad: 7200000, Olayeni: 400000, AllLocations: 10100000 },
    { date: "08 Nov", Adepele: 0, MedicalRoad: 0, Olayeni: 0, AllLocations: 0 },
    { date: "10 Nov", Adepele: 1200000, MedicalRoad: 4600000, Olayeni: 100000, AllLocations: 5900000 },
    { date: "12 Nov", Adepele: 5400000, MedicalRoad: 6800000, Olayeni: 200000, AllLocations: 12400000 },
    { date: "14 Nov", Adepele: 2800000, MedicalRoad: 7400000, Olayeni: 0, AllLocations: 10200000 },
    { date: "16 Nov", Adepele: 300000, MedicalRoad: 17200000, Olayeni: 400000, AllLocations: 17900000 },
    { date: "18 Nov", Adepele: 2400000, MedicalRoad: 1500000, Olayeni: 300000, AllLocations: 4200000 },
  ];

  // Financial Year Chart data matching screenshot
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

  // Needs Attention items
  const attentionItems = [
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
      detail: "Booking ref #ZINO-482091 for Executive 1-Bedroom",
      href: "/admin/apartments/bookings",
    },
    {
      id: "att_4",
      source: ServiceSlug.GALAXY,
      severity: "medium",
      title: "Product Review Pending Approval",
      detail: "MacBook Pro 16\" review by Chinedu O. (5 stars)",
      href: "/admin/galaxy/reviews",
    },
    {
      id: "att_5",
      source: ServiceSlug.VISITORS,
      severity: "low",
      title: "Expected Visitor Waiting",
      detail: "Adaeze Okafor arrived for meeting with Accounts Dept",
      href: "/admin/visitors",
    },
  ];

  // Recent Activity Feed
  const recentActivities = [
    {
      id: "act_1",
      source: ServiceSlug.SPARK,
      time: "2 min ago",
      actor: "Cashier (Medical Road)",
      action: "sold 2 × Samsung 990 PRO 4TB",
      amount: "₦960,000",
      location: "Medical Road",
    },
    {
      id: "act_2",
      source: ServiceSlug.APARTMENTS,
      time: "15 min ago",
      actor: "Reception Desk",
      action: "checked in Guest #1042 — Deluxe Studio",
      amount: "₦30,000",
      location: "Zino Main",
    },
    {
      id: "act_3",
      source: ServiceSlug.BUILDERS,
      time: "32 min ago",
      actor: "Sales Staff",
      action: "recorded sale to Adewumi Builders (40 bags Dangote)",
      amount: "₦392,000",
      location: "Builders Yard",
    },
    {
      id: "act_4",
      source: ServiceSlug.GALAXY,
      time: "1 hr ago",
      actor: "Online Customer",
      action: "placed Order #DG-892104 (Lexar SSD + Accessories)",
      amount: "₦245,000",
      location: "Galaxy Online",
    },
    {
      id: "act_5",
      source: ServiceSlug.VISITORS,
      time: "1 hr ago",
      actor: "Front Desk Kiosk",
      action: "issued visitor badge to Engr. Tunde Bakare",
      amount: null,
      location: "HQ Office",
    },
    {
      id: "act_6",
      source: ServiceSlug.BILLSTACKS,
      time: "2 hrs ago",
      actor: "Accountant",
      action: "sent Invoice #INV-000084 to Prime Technologies",
      amount: "₦1,450,000",
      location: null,
    },
  ];

  // Row 4: Tables definitions
  const salesPaymentDueColumns: ColumnDef<any>[] = [
    { key: "customer", header: "Customer", sortable: true },
    { key: "invoiceNo", header: "Invoice No.", sortable: true },
    {
      key: "dueAmount",
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
          onClick={() => alert(`Recording payment for invoice ${row.invoiceNo}`)}
          className="px-2.5 py-1 rounded bg-active hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors"
        >
          Pay
        </button>
      ),
    },
  ];

  const purchasePaymentDueColumns: ColumnDef<any>[] = [
    { key: "supplier", header: "Supplier", sortable: true },
    { key: "referenceNo", header: "Reference No", sortable: true },
    {
      key: "dueAmount",
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
          onClick={() => alert(`Settling supplier reference ${row.referenceNo}`)}
          className="px-2.5 py-1 rounded bg-active hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors"
        >
          Pay
        </button>
      ),
    },
  ];

  // Seed rows for payment due tables
  const salesPaymentDueRows = [
    {
      id: "spd_1",
      source: ServiceSlug.BUILDERS,
      customer: "Mama Bose Ventures",
      invoiceNo: "INV-000104",
      dueAmountKobo: 28130000,
    },
    {
      id: "spd_2",
      source: ServiceSlug.BUILDERS,
      customer: "Chief Okonkwo",
      invoiceNo: "INV-000105",
      dueAmountKobo: 19500000,
    },
    {
      id: "spd_3",
      source: ServiceSlug.SPARK,
      customer: "Vertex Systems Ltd",
      invoiceNo: "SPK-9042",
      dueAmountKobo: 35820000,
    },
  ];

  const purchasePaymentDueRows = [
    {
      id: "ppd_1",
      source: ServiceSlug.SPARK,
      supplier: "SanDisk Official West Africa",
      referenceNo: "PO-2026-881",
      dueAmountKobo: 32000000,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading tracking-tight">
            Unified Business Dashboard
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time multi-unit performance across all six Zino Group operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker align="right" />
        </div>
      </div>

      {/* Row 1 — 8 Stat cards (as in Zino Spark screenshot) */}
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
            source={st.source}
            subtitle={st.subtitle}
          />
        ))}
      </div>

      {/* Row 2 — Charts (Sales Last 30 Days & Current Financial Year) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales — Last 30 Days Multi-line */}
        <ChartCard
          title="Sales — Last 30 Days"
          subtitle="Daily turnover breakdown (NGN)"
          rightAction={
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartGrouping("service")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartGrouping === "service" ? "bg-white text-heading shadow-2xs" : "text-muted hover:text-heading"
                }`}
              >
                By service
              </button>
              <button
                type="button"
                onClick={() => setChartGrouping("location")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartGrouping === "location" ? "bg-white text-heading shadow-2xs" : "text-muted hover:text-heading"
                }`}
              >
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
                <YAxis
                  stroke="#8A8A9A"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) * 100), "Sales"]}
                  contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="MedicalRoad" name="Medical Road" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Adepele" name="Adepele Shop" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Olayeni" name="Olayeni Shop" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="AllLocations" name="All Locations" stroke="#E11D48" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Sales — Current Financial Year Monthly */}
        <ChartCard
          title="Sales — Current Financial Year"
          subtitle="Monthly revenue Jan – Dec 2026"
        >
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialYearData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
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

      {/* Row 3 — Attention Panels & Recent Cross-Service Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention Panel */}
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
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-border/70 hover:border-border block"
                >
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

        {/* Recent Activity Timeline Feed */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-active" />
                <h3 className="text-base font-semibold text-heading">Recent Activity</h3>
              </div>
              <Link
                href="/admin/activity"
                className="text-xs font-bold text-active hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
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
                      <span className="font-bold text-heading truncate">{act.actor}</span>
                      <span className="text-[11px] text-muted shrink-0">{act.time}</span>
                    </div>
                    <p className="text-body text-[11px] mt-0.5">
                      {act.action}
                    </p>
                    {act.amount && (
                      <span className="inline-block mt-1 font-bold text-heading text-[11px]">
                        {act.amount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border text-center">
            <Link
              href="/admin/activity"
              className="text-xs font-bold text-active hover:underline"
            >
              Open Chronological Activity Audit Trail →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4 — Payment Due Tables (Sales Payment Due & Purchase Payment Due) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Payment Due */}
        <DataTable
          title="Sales Payment Due"
          columns={salesPaymentDueColumns}
          data={salesPaymentDueRows}
          showExportButtons={true}
          showSourceColumn={true}
          searchPlaceholder="Search customer or invoice..."
          emptyMessage="No data available in table"
        />

        {/* Purchase Payment Due */}
        <DataTable
          title="Purchase Payment Due"
          columns={purchasePaymentDueColumns}
          data={purchasePaymentDueRows}
          showExportButtons={true}
          showSourceColumn={true}
          searchPlaceholder="Search supplier or reference..."
          emptyMessage="No data available in table"
        />
      </div>
    </div>
  );
}
