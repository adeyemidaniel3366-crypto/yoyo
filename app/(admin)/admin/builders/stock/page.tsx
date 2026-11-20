"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface StockSheetItemRow {
  code: string;
  name: string;
  unit: string;
  opening: number;
  outQty: number;
  inQty: number;
  closing: number;
}

export default function TopBuildersStockSheetPage() {
  const [expandedSheet, setExpandedSheet] = useState<string | null>("ST-00021");
  const [showEveryItem, setShowEveryItem] = useState(false);

  // 14 Seed Products with movement counts
  const stockItems: StockSheetItemRow[] = [
    { code: "001", name: "Dangote Cement 50kg", unit: "bag", opening: 158, outQty: 40, inQty: 0, closing: 118 },
    { code: "002", name: "BUA Cement 50kg", unit: "bag", opening: 42, outQty: 0, inQty: 0, closing: 42 },
    { code: "003", name: "Iron Rod 12mm", unit: "lgth", opening: 84, outQty: 0, inQty: 0, closing: 84 },
    { code: "004", name: "Iron Rod 16mm", unit: "lgth", opening: 168, outQty: 10, inQty: 0, closing: 158 },
    { code: "005", name: "Nails 3 inch", unit: "kg", opening: 22.5, outQty: 0, inQty: 0, closing: 22.5 },
    { code: "006", name: "Nails 2 inch", unit: "kg", opening: 35, outQty: 0, inQty: 0, closing: 35 },
    { code: "007", name: "Binding Wire", unit: "kg", opening: 47, outQty: 15, inQty: 0, closing: 32 },
    { code: "008", name: "Aluminium Roofing Sheet 0.45mm", unit: "sht", opening: 123, outQty: 0, inQty: 0, closing: 123 },
    { code: "009", name: "PVC Ceiling Panel 5.95m", unit: "lgth", opening: 8, outQty: 0, inQty: 0, closing: 8 },
    { code: "010", name: "PVC Pipe 4 inch", unit: "lgth", opening: 88, outQty: 0, inQty: 0, closing: 88 },
    { code: "011", name: "Floor Tiles 60x60 (1.44m²)", unit: "ctn", opening: 15, outQty: 0, inQty: 0, closing: 15 },
    { code: "012", name: "Emulsion Paint 20L (White)", unit: "bkt", opening: 34, outQty: 0, inQty: 0, closing: 34 },
    { code: "013", name: "Mortise Door Lock", unit: "pc", opening: 43, outQty: 0, inQty: 0, closing: 43 },
    { code: "014", name: "Wheelbarrow (Heavy Duty)", unit: "pc", opening: 7, outQty: 0, inQty: 0, closing: 7 },
  ];

  const visibleItems = showEveryItem
    ? stockItems
    : stockItems.filter((i) => i.outQty > 0 || i.inQty > 0 || i.closing <= 10);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-builders" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Stock Sheet
            </h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            One sheet per day, numbered sequentially like the physical stock books (ST-00021...).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/builders/stock/in"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-builders text-white text-xs font-bold hover:bg-builders-dark transition-colors shadow-sm"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stock In</span>
          </Link>
          <Link
            href="/admin/builders/stock/count"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white text-heading text-xs font-bold hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-muted" />
            <span>Record Count</span>
          </Link>
        </div>
      </div>

      {/* Daily Numbered Sheet (ST-00021) */}
      <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden">
        {/* Sheet Header Banner */}
        <div
          onClick={() => setExpandedSheet(expandedSheet === "ST-00021" ? null : "ST-00021")}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 select-none border-b border-border"
        >
          <div className="flex items-center gap-3.5">
            <span className="font-extrabold text-base text-builders tracking-tight">
              ST-00021
            </span>
            <span className="font-bold text-heading text-sm">Wed, 18 Nov 2026</span>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-muted font-semibold text-xs">
              Moved 2 · out 2 · in 0
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="hidden sm:inline">Counted by: <strong className="text-heading">Storekeeper CE</strong></span>
            {expandedSheet === "ST-00021" ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </div>
        </div>

        {/* Sheet Items Table */}
        {expandedSheet === "ST-00021" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
              <span className="font-bold text-heading">Physical Count Movement Sheet</span>
              <button
                type="button"
                onClick={() => setShowEveryItem(!showEveryItem)}
                className="font-bold text-builders hover:underline"
              >
                {showEveryItem ? "Show only moved & low stock" : "Show every item (14)"}
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-muted font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5">Code</th>
                    <th className="py-2.5">Product Name</th>
                    <th className="py-2.5 text-center">Unit</th>
                    <th className="py-2.5 text-right">Opening</th>
                    <th className="py-2.5 text-right text-rose-600">Out</th>
                    <th className="py-2.5 text-right text-emerald-600">In</th>
                    <th className="py-2.5 text-right font-black">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleItems.map((item) => (
                    <tr key={item.code} className="hover:bg-gray-50/70">
                      <td className="py-2.5 font-bold text-muted">#{item.code}</td>
                      <td className="py-2.5 font-bold text-heading">{item.name}</td>
                      <td className="py-2.5 text-center text-muted">{item.unit}</td>
                      <td className="py-2.5 text-right font-medium text-muted">{item.opening}</td>
                      <td className="py-2.5 text-right font-bold text-rose-600">
                        {item.outQty > 0 ? `-${item.outQty}` : "0"}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">
                        {item.inQty > 0 ? `+${item.inQty}` : "0"}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-heading">
                        {item.closing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
