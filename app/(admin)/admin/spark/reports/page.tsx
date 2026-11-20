"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function SparkReportsPage() {
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
          <h3 className="text-2xl font-black text-heading mt-1">₦18,450,000</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+18.2% vs last month</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Gross Profit Margin</p>
          <h3 className="text-2xl font-black text-spark mt-1">21.4%</h3>
          <p className="text-[11px] text-muted mt-1">₦3,948,300 gross margin</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Daily Fast Mover</p>
          <h3 className="text-base font-bold text-heading mt-1 truncate">Samsung 990 PRO 4TB</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">14 units sold this week</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Top Performing Shop</p>
          <h3 className="text-base font-bold text-heading mt-1">Medical Road Shop</h3>
          <p className="text-[11px] text-muted mt-1">72% of total POS sales</p>
        </div>
      </div>
    </div>
  );
}
