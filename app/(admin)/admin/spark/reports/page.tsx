"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

export default function SparkReportsPage() {
  const { invoices, products } = usePlatformStore();

  const sparkInvoices = useMemo(
    () => invoices.filter((i) => i.source === ServiceSlug.SPARK),
    [invoices]
  );

  const totalSalesKobo = useMemo(
    () =>
      sparkInvoices
        .filter((i) => i.activityType === "SALE" && (i.status === "PAID" || i.status === "CONFIRMED"))
        .reduce((sum, i) => sum + (i.amountKobo || 0), 0),
    [sparkInvoices]
  );

  const totalExpensesKobo = useMemo(
    () =>
      sparkInvoices
        .filter((i) => i.activityType === "EXPENSE")
        .reduce((sum, i) => sum + (i.amountKobo || 0), 0),
    [sparkInvoices]
  );

  const grossMarginKobo = totalSalesKobo - totalExpensesKobo;
  const marginPct = totalSalesKobo > 0 ? Math.round((grossMarginKobo / totalSalesKobo) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/spark" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Spark Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Zino Spark Retail Analytics &amp; Margin Reports</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            POS transaction volume, gross profit margins, inventory turnover and top-moving models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Total POS Gross Sales</p>
          <h3 className="text-2xl font-black text-heading mt-1">{formatCurrency(totalSalesKobo)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{sparkInvoices.filter((i) => i.activityType === "SALE").length} recorded sales</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Gross Profit Margin</p>
          <h3 className="text-2xl font-black text-spark mt-1">{marginPct}%</h3>
          <p className="text-[11px] text-muted mt-1">{formatCurrency(grossMarginKobo)} gross margin</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Total Catalog Models</p>
          <h3 className="text-base font-bold text-heading mt-1 truncate">
            {products.filter((p) => p.source === ServiceSlug.SPARK).length} Products Active
          </h3>
          <p className="text-[11px] text-muted mt-1">Ikeja retail network</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Active Operating Branches</p>
          <h3 className="text-base font-bold text-heading mt-1">3 Branches</h3>
          <p className="text-[11px] text-muted mt-1">Medical Rd, Adepele, Olayeni</p>
        </div>
      </div>
    </div>
  );
}
