"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Repeat, Plus, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface StockTransfer {
  id: string;
  transferNo: string;
  fromLocation: string;
  toLocation: string;
  item: string;
  qty: number;
  date: string;
  status: "COMPLETED" | "IN_TRANSIT";
}

const TRANSFERS: StockTransfer[] = [
  { id: "1", transferNo: "TRF-901", fromLocation: "Medical Road Shop", toLocation: "Adepele Shop", item: "Samsung 990 PRO 4TB NVMe SSD", qty: 4, date: "19 Nov 2026", status: "COMPLETED" },
  { id: "2", transferNo: "TRF-902", fromLocation: "Medical Road Shop", toLocation: "Galaxy Online Warehouse", item: "Lexar SL500 Portable SSD 2TB", qty: 6, date: "18 Nov 2026", status: "COMPLETED" },
];

export default function SparkTransfersPage() {
  const [transfers] = useState<StockTransfer[]>(TRANSFERS);

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
            <h1 className="text-2xl font-bold text-heading">Inter-Branch Stock Transfers</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Shift stock between Computer Village shops (Medical Road, Adepele, Olayeni) and online fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Initiate Stock Transfer Dialog")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Stock Transfer</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Transfer #</th>
                <th className="py-2.5">Origin (From)</th>
                <th className="py-2.5">Destination (To)</th>
                <th className="py-2.5">Device Model</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-spark">{t.transferNo}</td>
                  <td className="py-3 text-muted">{t.fromLocation}</td>
                  <td className="py-3 font-semibold text-heading">{t.toLocation}</td>
                  <td className="py-3 font-bold text-heading">{t.item}</td>
                  <td className="py-3 text-center font-black">{t.qty}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
