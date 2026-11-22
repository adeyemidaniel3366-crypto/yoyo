"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HardHat, ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { NumberInput } from "@/components/ui/number-input";

export default function BuildersStockCountPage() {
  const [counts, setCounts] = useState([
    { id: "1", item: "Dangote 3X Cement 50kg Bag", systemQty: 240, physicalQty: 240 },
    { id: "2", item: "TMT High-Tensile Iron Rod 16mm", systemQty: 2, physicalQty: 2 },
    { id: "3", item: "BUA Sokoto Cement 50kg Bag", systemQty: 0, physicalQty: 0 },
    { id: "4", item: "TMT Iron Rod 12mm (Length)", systemQty: 45, physicalQty: 45 },
  ]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/builders/stock" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Yard Stock Sheet
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Physical Stock Count &amp; Reconciliation</h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Conduct periodic physical inventory counts at the building yard and reconcile discrepancies.
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Physical count saved!
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Material Name</th>
                <th className="py-2.5 text-center">System Stock</th>
                <th className="py-2.5 text-center">Physical Count</th>
                <th className="py-2.5 text-center">Discrepancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {counts.map((row, idx) => {
                const diff = row.physicalQty - row.systemQty;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/70">
                    <td className="py-3 font-bold text-heading">{row.item}</td>
                    <td className="py-3 text-center font-semibold">{row.systemQty}</td>
                    <td className="py-3 text-center">
                      <div className="w-24 mx-auto">
                        <NumberInput
                          min={0}
                          value={row.physicalQty}
                          onChange={(v) => {
                            const val = typeof v === "number" ? v : 0;
                            setCounts((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, physicalQty: val } : r))
                            );
                          }}
                          className="h-8 px-2 text-center text-xs font-bold"
                        />
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold">
                      <span className={diff === 0 ? "text-emerald-600" : diff < 0 ? "text-rose-600" : "text-blue-600"}>
                        {diff === 0 ? "0 (Matched)" : diff > 0 ? `+${diff}` : diff}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-builders text-white text-xs font-bold shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Confirm &amp; Reconcile Yard Count</span>
          </button>
        </div>
      </div>
    </div>
  );
}
