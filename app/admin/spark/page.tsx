"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/money";

export default function ZinoSparkDashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState("Oga's Office (Olayeni)");

  // 8 Stat Cards from Screenshot
  const sparkStats = [
    { title: "Total Sales", value: "₦1,280,000", icon: ShoppingCart, iconColor: "#2563EB", iconBg: "#E8EEFB" },
    { title: "Net", value: "₦1,120,000", icon: DollarSign, iconColor: "#28A745", iconBg: "#E8F5EE" },
    { title: "Invoice due", value: "₦358,200", icon: FileText, iconColor: "#FFB800", iconBg: "#FFF9E6" },
    { title: "Total Sell Return", value: "₦0.0", icon: RefreshCw, iconColor: "#E74C3C", iconBg: "#FDF2F2" },
    { title: "Total purchase", value: "₦450,000", icon: ShoppingBag, iconColor: "#17A2B8", iconBg: "#E8F7F9" },
    { title: "Purchase due", value: "₦320,000", icon: AlertTriangle, iconColor: "#FFB800", iconBg: "#FFF9E6" },
    { title: "Total Purchase Return", value: "₦0.0", icon: Receipt, iconColor: "#E74C3C", iconBg: "#FDF2F2" },
    { title: "Expense", value: "₦45,000", icon: Tag, iconColor: "#DC3545", iconBg: "#FDF2F2" },
  ];

  const sales30DaysData = [
    { date: "20 Oct", Adepele: 800000, MedicalRoad: 5200000, Olayeni: 1000000, AllLocations: 7000000 },
    { date: "22 Oct", Adepele: 5500000, MedicalRoad: 9800000, Olayeni: 200000, AllLocations: 15500000 },
    { date: "24 Oct", Adepele: 200000, MedicalRoad: 100000, Olayeni: 0, AllLocations: 300000 },
    { date: "26 Oct", Adepele: 2100000, MedicalRoad: 7500000, Olayeni: 0, AllLocations: 9600000 },
    { date: "28 Oct", Adepele: 1500000, MedicalRoad: 500000, Olayeni: 8000000, AllLocations: 10000000 },
    { date: "04 Nov", Adepele: 7500000, MedicalRoad: 16200000, Olayeni: 800000, AllLocations: 24500000 },
    { date: "06 Nov", Adepele: 2500000, MedicalRoad: 7200000, Olayeni: 400000, AllLocations: 10100000 },
    { date: "12 Nov", Adepele: 5400000, MedicalRoad: 6800000, Olayeni: 200000, AllLocations: 12400000 },
    { date: "16 Nov", Adepele: 300000, MedicalRoad: 17200000, Olayeni: 400000, AllLocations: 17900000 },
    { date: "18 Nov", Adepele: 2400000, MedicalRoad: 1500000, Olayeni: 300000, AllLocations: 4200000 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching Screenshot */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SourceBadge source={ServiceSlug.SPARK} size="sm" className="bg-white/20 text-white" />
            <span className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Multi-Shop Retail POS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome Admin, 👋
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Zino Spark Electronics Retail & Wholesale Network · Computer Village, Ikeja
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Location selector matching screenshot */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
          >
            <option value="Oga's Office (Olayeni)" className="text-gray-900">Oga's Office (Olayeni)</option>
            <option value="Zino Spark Medical Road" className="text-gray-900">Zino Spark Medical Road</option>
            <option value="Zino Spark Adepele" className="text-gray-900">Zino Spark Adepele</option>
            <option value="Zino Spark Olayeni Shop" className="text-gray-900">Zino Spark Olayeni Shop</option>
            <option value="Warehouse — Asset Corps Plaza" className="text-gray-900">Warehouse — Asset Corps Plaza</option>
          </select>

          <Link
            href="/admin/spark/pos"
            className="h-9 px-4 rounded-lg bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center shrink-0"
          >
            Launch POS
          </Link>
        </div>
      </div>

      {/* 8 Stat Cards */}
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

      {/* Sales Last 30 Days Chart (matching screenshot) */}
      <ChartCard
        title="Sales Last 30 Days"
        subtitle="Multi-location sales performance (NGN)"
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
                tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) * 100), "Sales"]}
                contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Line type="monotone" dataKey="Adepele" name="Zino Spark Adepele (Adepele)" stroke="#38BDF8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="MedicalRoad" name="Zino Spark Medical Road (Medical Road)" stroke="#1E293B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Olayeni" name="Zino Spark Olayeni Shop (Olayeni)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="AllLocations" name="All locations" stroke="#E11D48" strokeWidth={2.5} />
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
            <p className="text-[11px] text-rose-600 font-normal">View 19 zero-stock products per location</p>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/admin/spark/transfers"
          className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors flex items-center justify-between text-blue-800"
        >
          <div>
            <p className="text-sm font-extrabold">Inter-Shop Transfers</p>
            <p className="text-[11px] text-blue-600 font-normal">Move stock between 5 Ikeja locations</p>
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
