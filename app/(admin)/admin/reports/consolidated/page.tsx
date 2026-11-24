"use client";

import React, { useState, useMemo } from "react";
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
import { usePlatformStore } from "@/lib/platform-store";

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
  const { invoices } = usePlatformStore();

  const plData: ServicePL[] = useMemo(() => {
    const services = [
      ServiceSlug.SPARK,
      ServiceSlug.BUILDERS,
      ServiceSlug.GALAXY,
      ServiceSlug.APARTMENTS,
      ServiceSlug.BILLSTACKS,
      ServiceSlug.VISITORS,
    ];

    return services.map((slug) => {
      const serviceInvoices = invoices.filter((i) => i.source === slug);
      const paidInvoices = serviceInvoices.filter(
        (i) => i.status === "PAID" || i.status === "CONFIRMED"
      );
      const rev = paidInvoices.reduce((sum, i) => sum + i.amountKobo, 0);

      // Derive costs & expenses based on unit business model
      let costRatio = 0.65;
      let expRatio = 0.12;

      if (slug === ServiceSlug.APARTMENTS) {
        costRatio = 0.15;
        expRatio = 0.32;
      } else if (slug === ServiceSlug.BILLSTACKS) {
        costRatio = 0.1;
        expRatio = 0.25;
      } else if (slug === ServiceSlug.VISITORS) {
        costRatio = 0;
        expRatio = 0;
      }

      const cost = Math.round(rev * costRatio);
      const gross = rev - cost;
      const expenses = Math.round(rev * expRatio);
      const net = gross - expenses;
      const margin = rev > 0 ? (net / rev) * 100 : 0;

      return {
        slug,
        revenueKobo: rev,
        costKobo: cost,
        grossProfitKobo: gross,
        expensesKobo: expenses,
        netProfitKobo: net,
        marginPct: Number(margin.toFixed(1)),
      };
    });
  }, [invoices]);

  const totalRevenue = plData.reduce((s, i) => s + i.revenueKobo, 0);
  const totalCost = plData.reduce((s, i) => s + i.costKobo, 0);
  const totalExpenses = plData.reduce((s, i) => s + i.expensesKobo, 0);
  const totalNet = plData.reduce((s, i) => s + i.netProfitKobo, 0);
  const netMarginDisplay =
    totalRevenue > 0 ? ((totalNet / totalRevenue) * 100).toFixed(1) : "0.0";

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
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted font-medium truncate">Consolidated Revenue</p>
            <h3 className="text-base sm:text-lg xl:text-xl font-black text-heading mt-1 tabular-nums break-words tracking-tight" title={formatCurrency(totalRevenue)}>
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 truncate">Gross Inflows Across 6 Units</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted font-medium truncate">Cost of Goods Sold (COGS)</p>
            <h3 className="text-base sm:text-lg xl:text-xl font-black text-muted mt-1 tabular-nums break-words tracking-tight" title={formatCurrency(totalCost)}>
              {formatCurrency(totalCost)}
            </h3>
          </div>
          <p className="text-[11px] text-muted mt-2 truncate">Spark + Builders + Galaxy</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted font-medium truncate">Operating Expenses</p>
            <h3 className="text-base sm:text-lg xl:text-xl font-black text-rose-600 mt-1 tabular-nums break-words tracking-tight" title={formatCurrency(totalExpenses)}>
              {formatCurrency(totalExpenses)}
            </h3>
          </div>
          <p className="text-[11px] text-muted mt-2 truncate">Salaries, utilities &amp; rent</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted font-medium truncate">Net Consolidated Profit</p>
            <h3 className="text-base sm:text-lg xl:text-xl font-black text-emerald-600 mt-1 tabular-nums break-words tracking-tight" title={formatCurrency(totalNet)}>
              {formatCurrency(totalNet)}
            </h3>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 truncate">
            {netMarginDisplay}% Net Margin
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
