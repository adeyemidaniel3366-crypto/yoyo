"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Users } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function VisitorsReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/visitors" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Visitors Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Premises Foot Traffic &amp; Security Analytics</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            HQ reception throughput, peak visitation hours, purpose classification, and compliance statistics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Total Visits (Month)</p>
          <h3 className="text-2xl font-black text-heading mt-1">342</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+9.4% vs last month</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Average Stay Duration</p>
          <h3 className="text-2xl font-black text-visitor mt-1">42 mins</h3>
          <p className="text-[11px] text-muted mt-1">Check-in to exit gate</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">Peak Entry Hour</p>
          <h3 className="text-2xl font-black text-heading mt-1">11:00 AM</h3>
          <p className="text-[11px] text-muted mt-1">Midday vendor visits</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted">QR Pass Adoption</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">84%</h3>
          <p className="text-[11px] text-muted mt-1">Pre-registered vs walk-in</p>
        </div>
      </div>
    </div>
  );
}
