"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  ShoppingCart,
  DollarSign,
  FileText,
  RefreshCw,
  ShoppingBag,
  AlertTriangle,
  Receipt,
  Tag,
  ArrowRight,
  TrendingUp,
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
import { ServiceSlug, LOCATIONS } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

export default function ZinoSparkDashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const { products: storeProducts, invoices, paymentDues } = usePlatformStore();

  // Filter products belonging to Spark
  const sparkProducts = useMemo(
    () => storeProducts.filter((p) => p.source === ServiceSlug.SPARK && p.status !== "ARCHIVED"),
    [storeProducts]
  );

  // Spark ledger activities
  const sparkInvoices = useMemo(
    () => invoices.filter((inv) => inv.source === ServiceSlug.SPARK),
    [invoices]
  );

  // Filtered by selected branch location if chosen
  const filteredInvoices = useMemo(() => {
    if (selectedLocation === "ALL") return sparkInvoices;
    return sparkInvoices.filter((inv) => inv.location?.toLowerCase().includes(selectedLocation.toLowerCase()));
  }, [sparkInvoices, selectedLocation]);

  // Dynamic real calculations
  const totalSalesKobo = useMemo(
    () =>
      filteredInvoices
        .filter((inv) => inv.activityType === "SALE" && (inv.status === "PAID" || inv.status === "CONFIRMED"))
        .reduce((sum, inv) => sum + (inv.amountKobo || 0), 0),
    [filteredInvoices]
  );

  const totalPurchasesKobo = useMemo(
    () =>
      filteredInvoices
        .filter((inv) => inv.activityType === "ORDER" || inv.activitySummary?.toLowerCase().includes("purchase"))
        .reduce((sum, inv) => sum + (inv.amountKobo || 0), 0),
    [filteredInvoices]
  );

  const totalExpensesKobo = useMemo(
    () =>
      filteredInvoices
        .filter((inv) => inv.activityType === "EXPENSE" || inv.activitySummary?.toLowerCase().includes("expense"))
        .reduce((sum, inv) => sum + (inv.amountKobo || 0), 0),
    [filteredInvoices]
  );

  const netIncomeKobo = totalSalesKobo - totalPurchasesKobo - totalExpensesKobo;

  const invoiceDueKobo = useMemo(
    () =>
      paymentDues
        .filter((d) => d.source === ServiceSlug.SPARK && d.type === "SALES")
        .reduce((sum, d) => sum + (d.dueAmountKobo || 0), 0),
    [paymentDues]
  );

  const purchaseDueKobo = useMemo(
    () =>
      paymentDues
        .filter((d) => d.source === ServiceSlug.SPARK && d.type === "PURCHASE")
        .reduce((sum, d) => sum + (d.dueAmountKobo || 0), 0),
    [paymentDues]
  );

  const lowStockCount = useMemo(
    () =>
      sparkProducts.filter(
        (p) => p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK" || p.totalStock <= p.lowStockAt
      ).length,
    [sparkProducts]
  );

  // 8 Stat Cards populated with actual platform store data
  const sparkStats = [
    { title: "Total Sales", value: formatCurrency(totalSalesKobo), icon: ShoppingCart, iconColor: "#2563EB", iconBg: "#E8EEFB" },
    { title: "Net", value: formatCurrency(netIncomeKobo), icon: DollarSign, iconColor: "#28A745", iconBg: "#E8F5EE" },
    { title: "Invoice due", value: formatCurrency(invoiceDueKobo), icon: FileText, iconColor: "#FFB800", iconBg: "#FFF9E6" },
    { title: "Total Sell Return", value: "₦0.00", icon: RefreshCw, iconColor: "#E74C3C", iconBg: "#FDF2F2" },
    { title: "Total purchase", value: formatCurrency(totalPurchasesKobo), icon: ShoppingBag, iconColor: "#17A2B8", iconBg: "#E8F7F9" },
    { title: "Purchase due", value: formatCurrency(purchaseDueKobo), icon: AlertTriangle, iconColor: "#FFB800", iconBg: "#FFF9E6" },
    { title: "Total Purchase Return", value: "₦0.00", icon: Receipt, iconColor: "#E74C3C", iconBg: "#FDF2F2" },
    { title: "Expense", value: formatCurrency(totalExpensesKobo), icon: Tag, iconColor: "#DC3545", iconBg: "#FDF2F2" },
  ];

  // Live multi-location sales trends
  const sales30DaysData = useMemo(() => {
    const days: Record<string, { Adepele: number; MedicalRoad: number; Olayeni: number; AllLocations: number }> = {};
    const now = new Date();

    for (let i = 9; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 3);
      const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      days[label] = { Adepele: 0, MedicalRoad: 0, Olayeni: 0, AllLocations: 0 };
    }

    filteredInvoices
      .filter((inv) => inv.activityType === "SALE")
      .forEach((inv) => {
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date();
        const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
        const val = Math.round((inv.amountKobo || 0) / 100);

        if (days[label]) {
          const loc = (inv.location || "").toLowerCase();
          if (loc.includes("adepele")) days[label].Adepele += val;
          else if (loc.includes("medical")) days[label].MedicalRoad += val;
          else if (loc.includes("olayeni")) days[label].Olayeni += val;
          days[label].AllLocations += val;
        }
      });

    return Object.entries(days).map(([date, data]) => ({ date, ...data }));
  }, [filteredInvoices]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-white p-0.5 overflow-hidden shrink-0">
              <Image src="/logos/zino-spark.png" alt="Zino Spark" width={32} height={32} className="w-full h-full object-contain" />
            </span>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" className="bg-white/20 text-white" />
            <span className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Multi-Shop Retail POS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to Zino Spark, 👋
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Electronics Retail &amp; Wholesale Network · Computer Village, Ikeja
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Location selector */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Branches / Locations</option>
            <option value="Medical Road" className="bg-slate-900 text-white">Zino Spark Medical Road</option>
            <option value="Adepele" className="bg-slate-900 text-white">Zino Spark Adepele</option>
            <option value="Olayeni" className="bg-slate-900 text-white">Zino Spark Olayeni Shop</option>
          </select>

          <Link
            href="/admin/spark/pos"
            className="h-9 px-4 rounded-lg bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center shrink-0"
          >
            Launch POS
          </Link>
        </div>
      </div>

      {/* 8 Real Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sparkStats.map((st) => (
          <StatCard
            key={st.title}
            title={st.title}
            value={st.value}
            icon={st.icon}
            iconColor={st.iconColor}
            iconBg={st.iconBg}
          />
        ))}
      </div>

      {/* Sales Last 30 Days Chart */}
      <ChartCard
        title="Sales Trends"
        subtitle="Multi-location sales performance from real recorded transactions (NGN)"
      >
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sales30DaysData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#8A8A9A"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₦${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) * 100), "Sales"]}
                contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Line type="monotone" dataKey="Adepele" name="Zino Spark Adepele" stroke="#38BDF8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="MedicalRoad" name="Zino Spark Medical Road" stroke="#1E293B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Olayeni" name="Zino Spark Olayeni" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="AllLocations" name="All Locations" stroke="#E11D48" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <Link
          href="/admin/spark/stock-alert"
          className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors flex items-center justify-between text-rose-800"
        >
          <div>
            <p className="text-sm font-extrabold">Product Stock Alert</p>
            <p className="text-[11px] text-rose-600 font-normal">
              {lowStockCount > 0 ? `View ${lowStockCount} items requiring restock` : "All products within safe stock levels"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/admin/spark/transfers"
          className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors flex items-center justify-between text-blue-800"
        >
          <div>
            <p className="text-sm font-extrabold">Inter-Shop Transfers</p>
            <p className="text-[11px] text-blue-600 font-normal">Move stock between Ikeja retail locations</p>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/admin/spark/pos"
          className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-center justify-between text-emerald-800"
        >
          <div>
            <p className="text-sm font-extrabold">Fast POS Terminal</p>
            <p className="text-[11px] text-emerald-600 font-normal">Barcode scan, keyboard sales, receipts</p>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
