"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Building2,
  Percent,
  DollarSign,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function ApartmentReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/apartments" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Apartments Performance &amp; Occupancy Reports</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Key hospitality metrics: RevPAR, Average Daily Rate (ADR), occupancy trends and revenue breakdown.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Average Occupancy Rate</p>
          <h3 className="text-2xl font-black text-heading mt-1">78.5%</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+12% vs last month</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Average Daily Rate (ADR)</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦35,000</h3>
          <p className="text-[11px] text-muted mt-1">Across 12 suites</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">RevPAR (Rev per Available Room)</p>
          <h3 className="text-2xl font-black text-apartment mt-1">₦27,475</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Optimal profitability</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Monthly Gross Revenue</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦9,890,000</h3>
          <p className="text-[11px] text-muted mt-1">November 2026</p>
        </div>
      </div>

      {/* Revenue Breakdown by Suite Type */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-heading">Revenue Contribution by Room Category</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Deluxe Studio Suite (₦30,000/night)</span>
              <span className="font-bold text-heading">₦4,800,000 (48.5%)</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-apartment h-full rounded-full" style={{ width: "48.5%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Luxury 2-Bedroom Suite (₦50,000/night)</span>
              <span className="font-bold text-heading">₦3,500,000 (35.4%)</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "35.4%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Classic Studio Apartment (₦10,000/night)</span>
              <span className="font-bold text-heading">₦1,590,000 (16.1%)</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "16.1%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
