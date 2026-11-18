"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HardHat,
  Plus,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

export default function TopBuildersDashboardPage() {
  const [showChartTable, setShowChartTable] = useState(false);

  // Weekly sales data from Mon-Sun matching spec
  const weeklySalesData = [
    { day: "Mon", sales: 480000, count: 4 },
    { day: "Tue", sales: 720000, count: 6 },
    { day: "Wed", sales: 0, count: 0 }, // Today (Not started)
    { day: "Thu", sales: 610000, count: 5 },
    { day: "Fri", sales: 940000, count: 8 },
    { day: "Sat", sales: 1250000, count: 11 },
    { day: "Sun", sales: 0, count: 0 },
  ];

  // 14 Seed Products from spec — 5 low stock
  const lowStockItems = [
    { code: "009", name: "PVC Ceiling Panel 5.95m", stock: 8, unit: "lgth", threshold: 10 },
    { code: "014", name: "Wheelbarrow (Heavy Duty)", stock: 7, unit: "pc", threshold: 10 },
    { code: "011", name: "Floor Tiles 60x60 (1.44m²)", stock: 15, unit: "ctn", threshold: 20 },
    { code: "005", name: "Nails 3 inch", stock: 22.5, unit: "kg", threshold: 30 },
    { code: "007", name: "Binding Wire", stock: 32, unit: "kg", threshold: 40 },
  ];

  // Recent sales matching seed
  const recentSales = [
    {
      id: "sale_106",
      invoiceNo: "INV-000106",
      customer: "Adewumi Builders",
      amountKobo: 39200000,
      status: "PAID",
      date: "Today, 10:45 AM",
    },
    {
      id: "sale_105",
      invoiceNo: "INV-000105",
      customer: "Chief Okonkwo",
      amountKobo: 19500000,
      status: "PART_PAID",
      date: "Yesterday",
    },
    {
      id: "sale_104",
      invoiceNo: "INV-000104",
      customer: "Mama Bose Ventures",
      amountKobo: 28130000,
      status: "UNPAID",
      date: "13/07/2026",
    },
    {
      id: "sale_103",
      invoiceNo: "INV-000103",
      customer: "Pastor Femi Adebayo",
      amountKobo: 7200000,
      status: "PAID",
      date: "12 Nov 2026",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-builders-tint flex items-center justify-center text-builders">
              <HardHat className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Top Builders Dashboard
            </h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Daily sales book, stock sheets, physical counts, and debtor management.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <Link
            href="/admin/builders/sales/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-builders text-white hover:bg-builders-dark transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </Link>
          <Link
            href="/admin/builders/sales"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white text-heading hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-muted" />
            <span>Sales Book</span>
          </Link>
          <Link
            href="/admin/builders/stock"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white text-heading hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <ClipboardList className="w-4 h-4 text-muted" />
            <span>Stock Sheet</span>
          </Link>
        </div>
      </div>

      {/* Date Status Bar (Wed, 18 Nov 2026 · Not started) */}
      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-amber-950">Wed, 18 Nov 2026</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[10px]">
            Not started
          </span>
          <span className="text-amber-800">The day opens with the first sale.</span>
        </div>
        <Link
          href="/admin/builders/sales/new"
          className="text-xs font-bold text-builders hover:underline shrink-0"
        >
          Record opening sale →
        </Link>
      </div>

      {/* 4 Financial Cards (Paid / On Credit / Total, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Total Sales</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-heading">₦0.00</h3>
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted">
            <div className="flex justify-between">
              <span>Paid sales:</span>
              <span className="font-semibold text-heading">₦0.00</span>
            </div>
            <div className="flex justify-between">
              <span>On credit:</span>
              <span className="font-semibold text-heading">₦0.00</span>
            </div>
          </div>
        </div>

        {/* Card 2: Received */}
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Received</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-heading">₦0.00</h3>
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted">
            <div className="flex justify-between">
              <span>Cash received:</span>
              <span className="font-semibold text-heading">₦0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Bank / POS:</span>
              <span className="font-semibold text-heading">₦0.00</span>
            </div>
          </div>
        </div>

        {/* Card 3: Transferred (POS + Bank) */}
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Transferred (POS + bank)</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <h3 className="text-2xl font-bold text-heading">₦0.00</h3>
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted">
            <p className="italic">None yet today</p>
          </div>
        </div>

        {/* Card 4: Expenses */}
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Expenses</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-heading">₦0.00</h3>
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted">
            <p className="italic">None yet today</p>
          </div>
        </div>
      </div>

      {/* Summary Cards: Drawer Balance & Outstanding Debts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Balance After Expenses */}
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Balance After Expenses
            </h4>
            <p className="text-2xl font-bold text-heading mt-1">₦0.00</p>
            <p className="text-xs text-muted mt-0.5">
              Cash that should be in the drawer: ₦0
            </p>
          </div>
          <p className="text-[11px] text-muted mt-3">
            Count drawer and close day at 6:00 PM.
          </p>
        </div>

        {/* Outstanding Debts */}
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Outstanding Debts
            </h4>
            <p className="text-2xl font-bold text-rose-600 mt-1">₦834,500</p>
            <p className="text-xs text-muted mt-0.5">
              Owed across 6 credit customers
            </p>
          </div>
          <Link
            href="/admin/builders/debtors"
            className="text-xs font-bold text-builders hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>View debtors ledger →</span>
          </Link>
        </div>
      </div>

      {/* Weekly Chart & Recent Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales this week bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-heading">Sales this week</h3>
              <p className="text-xs text-muted">Mon – Sun daily revenue</p>
            </div>
            <button
              type="button"
              onClick={() => setShowChartTable(!showChartTable)}
              className="text-xs font-semibold text-active hover:underline"
            >
              {showChartTable ? "Show as chart" : "Show as table"}
            </button>
          </div>

          {!showChartTable ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                  <XAxis dataKey="day" stroke="#8A8A9A" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#8A8A9A"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, "Sales"]}
                    contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="sales" fill="#006B3F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2">Day</th>
                    <th className="py-2 text-right">Sales Count</th>
                    <th className="py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {weeklySalesData.map((d) => (
                    <tr key={d.day}>
                      <td className="py-2 font-medium">{d.day}</td>
                      <td className="py-2 text-right">{d.count}</td>
                      <td className="py-2 text-right font-bold">{formatCurrency(d.sales * 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock List (14 seed items, 5 low) */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
              <h3 className="text-base font-semibold text-heading">Low Stock</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs">
                {lowStockItems.length} items
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {lowStockItems.map((item) => (
                <div key={item.code} className="flex items-center justify-between py-1 border-b border-border/50">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-heading truncate">{item.name}</p>
                    <p className="text-[10px] text-muted">Code #{item.code}</p>
                  </div>
                  <span className="font-bold text-rose-600 shrink-0">
                    {item.stock} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/builders/stock"
            className="text-xs font-bold text-builders hover:underline mt-4 text-center block"
          >
            Open Complete Stock Sheet →
          </Link>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 className="text-base font-semibold text-heading">Recent Sales</h3>
          <Link href="/admin/builders/sales" className="text-xs font-bold text-builders hover:underline">
            View Sales Book →
          </Link>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Invoice</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-builders">
                    <Link href={`/admin/builders/sales`} className="hover:underline">
                      {sale.invoiceNo}
                    </Link>
                  </td>
                  <td className="py-3 font-medium text-heading">{sale.customer}</td>
                  <td className="py-3 text-muted">{sale.date}</td>
                  <td className="py-3 text-right font-bold text-heading">
                    {formatCurrency(sale.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={sale.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
