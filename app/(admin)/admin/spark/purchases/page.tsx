"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Plus, ArrowLeft, Search } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface SparkPurchase {
  id: string;
  poNo: string;
  supplier: string;
  item: string;
  qty: number;
  costKobo: number;
  date: string;
  location: string;
}

const PURCHASES: SparkPurchase[] = [
  { id: "1", poNo: "SPK-PO-1092", supplier: "Samsung Official West Africa", item: "Samsung 990 PRO 4TB NVMe SSD", qty: 20, costKobo: 760000000, date: "18 Nov 2026", location: "Medical Road" },
  { id: "2", poNo: "SPK-PO-1091", supplier: "Apple Authorized Importer", item: "MacBook Pro 16\" M3 Max", qty: 5, costKobo: 2100000000, date: "15 Nov 2026", location: "Medical Road" },
  { id: "3", poNo: "SPK-PO-1090", supplier: "Zealot Direct Shenzhen", item: "Zealot S69M Bluetooth Speaker", qty: 50, costKobo: 425000000, date: "10 Nov 2026", location: "Adepele Shop" },
];

export default function SparkPurchasesPage() {
  const [purchases] = useState<SparkPurchase[]>(PURCHASES);

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
            <h1 className="text-2xl font-bold text-heading">Inventory Supplier Purchases</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Direct stock procurement for Computer Village branches (Medical Road &amp; Adepele).
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Receive Stock Purchase Dialog")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Receive New Purchase</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">PO #</th>
                <th className="py-2.5">Supplier / Importer</th>
                <th className="py-2.5">Hardware Model</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5">Branch Location</th>
                <th className="py-2.5 text-right">Cost (₦)</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-spark">{p.poNo}</td>
                  <td className="py-3 font-bold text-heading">{p.supplier}</td>
                  <td className="py-3 text-muted">{p.item}</td>
                  <td className="py-3 text-center font-bold text-heading">{p.qty}</td>
                  <td className="py-3 text-muted">{p.location}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.costKobo)}
                  </td>
                  <td className="py-3 text-muted">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
