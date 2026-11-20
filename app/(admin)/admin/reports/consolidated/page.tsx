"use client";

import React, { useState } from "react";
import {
  Layers,
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/money";

interface ServicePL {
  slug: ServiceSlug;
  revenueKobo: number;
  costKobo: number;
  grossProfitKobo: number;
  expensesKobo: number;
  netProfitKobo: number;
  marginPct: number;
}

export default function ConsolidatedReportsPage() {
  const plData: ServicePL[] = [
    {
      slug: ServiceSlug.SPARK,
      revenueKobo: 1845000000,
      costKobo: 1320000000,
      grossProfitKobo: 525000000,
      expensesKobo: 145000000,
      netProfitKobo: 380000000,
      marginPct: 20.6,
    },
    {
      slug: ServiceSlug.BUILDERS,
      revenueKobo: 1240000000,
      costKobo: 910000000,
      grossProfitKobo: 330000000,
      expensesKobo: 85000000,
      netProfitKobo: 245000000,
      marginPct: 19.8,
    },
    {
      slug: ServiceSlug.GALAXY,
      revenueKobo: 480000000,
      costKobo: 336000000,
      grossProfitKobo: 144000000,
      expensesKobo: 42000000,
      netProfitKobo: 102000000,
      marginPct: 21.3,
    },
    {
      slug: ServiceSlug.APARTMENTS,
      revenueKobo: 285000000,
      costKobo: 45000000,
      grossProfitKobo: 240000000,
      expensesKobo: 92000000,
      netProfitKobo: 148000000,
      marginPct: 51.9,
    },
    {
      slug: ServiceSlug.BILLSTACKS,
      revenueKobo: 145000000,
      costKobo: 15000000,
      grossProfitKobo: 130000000,
      expensesKobo: 38000000,
      netProfitKobo: 92000000,
      marginPct: 63.4,
    },
    {
      slug: ServiceSlug.VISITORS,
      revenueKobo: 0,
      costKobo: 0,
      grossProfitKobo: 0,
      expensesKobo: 25000000,
      netProfitKobo: -25000000,
      marginPct: 0,
    },
  ];

  const totalRevenue = plData.reduce((s, i) => s + i.revenueKobo, 0);
  const totalCost = plData.reduce((s, i) => s + i.costKobo, 0);
  const totalExpenses = plData.reduce((s, i) => s + i.expensesKobo, 0);
  const totalNet = plData.reduce((s, i) => s + i.netProfitKobo, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-active" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Consolidated Profit & Loss (P&L)
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Cross-service financial performance, revenue, cost of goods, and net margin breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangePicker align="right" />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-heading text-xs font-semibold hover:bg-gray-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-muted" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Total Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Consolidated Revenue</p>
          <h3 className="text-2xl font-black text-heading mt-1">{formatCurrency(totalRevenue)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Gross Inflows Across 6 Units</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl font-black text-muted mt-1">{formatCurrency(totalCost)}</h3>
          <p className="text-[11px] text-muted mt-1">Spark + Builders + Galaxy</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Operating Expenses</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(totalExpenses)}</h3>
          <p className="text-[11px] text-muted mt-1">Salaries, utilities & rent</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Net Consolidated Profit</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalNet)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {((totalNet / totalRevenue) * 100).toFixed(1)}% Net Margin
          </p>
        </div>
      </div>

      {/* Consolidated P&L Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 className="text-base font-semibold text-heading">Multi-Unit Breakdown</h3>
          <span className="text-xs text-muted font-semibold">Group by Service</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3">Business Unit</th>
                <th className="py-3 text-right">Revenue</th>
                <th className="py-3 text-right">COGS</th>
                <th className="py-3 text-right">Gross Profit</th>
                <th className="py-3 text-right">Operating Expenses</th>
                <th className="py-3 text-right font-black">Net Profit</th>
                <th className="py-3 text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plData.map((row) => (
                <tr key={row.slug} className="hover:bg-gray-50/70">
                  <td className="py-3.5 font-bold text-heading flex items-center gap-2">
                    <SourceBadge source={row.slug} size="sm" />
                    <span>{SERVICE_CONFIG[row.slug].name}</span>
                  </td>
                  <td className="py-3.5 text-right font-semibold text-heading">
                    {formatCurrency(row.revenueKobo)}
                  </td>
                  <td className="py-3.5 text-right text-muted">
                    {formatCurrency(row.costKobo)}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-heading">
                    {formatCurrency(row.grossProfitKobo)}
                  </td>
                  <td className="py-3.5 text-right text-rose-600">
                    {formatCurrency(row.expensesKobo)}
                  </td>
                  <td className="py-3.5 text-right font-black text-emerald-700">
                    {formatCurrency(row.netProfitKobo)}
                  </td>
                  <td className="py-3.5 text-right font-bold text-heading">
                    {row.marginPct > 0 ? `${row.marginPct}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-heading bg-gray-50/60 font-black text-xs text-heading">
                <td className="py-4 font-black">Total Consolidated</td>
                <td className="py-4 text-right">{formatCurrency(totalRevenue)}</td>
                <td className="py-4 text-right">{formatCurrency(totalCost)}</td>
                <td className="py-4 text-right">{formatCurrency(totalRevenue - totalCost)}</td>
                <td className="py-4 text-right text-rose-600">{formatCurrency(totalExpenses)}</td>
                <td className="py-4 text-right text-emerald-700 text-sm">{formatCurrency(totalNet)}</td>
                <td className="py-4 text-right font-black">
                  {((totalNet / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
