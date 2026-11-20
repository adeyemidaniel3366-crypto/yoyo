"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, AlertTriangle } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface StockAdjustment {
  id: string;
  item: string;
  location: string;
  type: "DAMAGED" | "DEMO_DISPLAY" | "INVENTORY_WRITE_OFF";
  qtyChange: number;
  reason: string;
  date: string;
}

const ADJUSTMENTS: StockAdjustment[] = [
  { id: "1", item: "Lexar SL500 Portable SSD 2TB", location: "Medical Road", type: "DEMO_DISPLAY", qtyChange: -1, reason: "Transferred to customer demo testing station", date: "17 Nov 2026" },
  { id: "2", item: "Zealot S69M Bluetooth Speaker", location: "Adepele Shop", type: "DAMAGED", qtyChange: -1, reason: "Factory sound distortion; returned to distributor", date: "14 Nov 2026" },
];

export default function SparkAdjustmentsPage() {
  const [adjustments] = useState<StockAdjustment[]>(ADJUSTMENTS);

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
            <h1 className="text-2xl font-bold text-heading">Stock Adjustments &amp; Write-Offs</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Log inventory write-offs, floor display demo models, or damaged warranty claims.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Record Stock Adjustment")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Adjustment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Hardware Model</th>
                <th className="py-2.5">Shop Location</th>
                <th className="py-2.5">Adjustment Reason</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5">Explanation</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adjustments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{a.item}</td>
                  <td className="py-3 text-muted">{a.location}</td>
                  <td className="py-3 font-mono font-semibold text-rose-600">{a.type}</td>
                  <td className="py-3 text-center font-black text-rose-600">{a.qtyChange}</td>
                  <td className="py-3 text-muted">{a.reason}</td>
                  <td className="py-3 text-muted">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
