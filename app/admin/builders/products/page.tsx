"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HardHat, Plus, ArrowLeft, Search } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";

export default function BuildersProductsPage() {
  const { products: storeProducts } = usePlatformStore();
  const [search, setSearch] = useState("");

  const buildersProducts = storeProducts.filter(
    (p) => p.source === ServiceSlug.BUILDERS
  );

  const filtered = buildersProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/builders" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Builders Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Top Builders Materials Catalog</h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Construction supplies, cement bags, reinforcement steel bars, and wholesale building items.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-builders text-white text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Building Material</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cement, iron rods, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-builders"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">SKU</th>
                <th className="py-2.5">Material Name</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Selling Price</th>
                <th className="py-2.5 text-center">Yard Stock</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-builders">{p.sku}</td>
                  <td className="py-3 font-bold text-heading">{p.name}</td>
                  <td className="py-3 text-muted">{p.label || "Building Materials"}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.priceKobo)}
                  </td>
                  <td className="py-3 text-center font-bold">
                    <span className={p.totalStock === 0 ? "text-rose-600" : "text-heading"}>
                      {p.totalStock} units
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
