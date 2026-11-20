"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Plus, ArrowLeft } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface BillstackItem {
  id: string;
  name: string;
  sku: string;
  rateKobo: number;
  billingType: "ONE_TIME" | "RECURRING_MONTHLY" | "PER_HOUR";
  taxRate: string;
}

const ITEMS: BillstackItem[] = [
  { id: "b1", name: "Enterprise Cloud ERP Retainer", sku: "BS-ERP-MONTHLY", rateKobo: 145000000, billingType: "RECURRING_MONTHLY", taxRate: "7.5% VAT" },
  { id: "b2", name: "Custom API & FinTech Integration", sku: "BS-ENG-HOURLY", rateKobo: 2500000, billingType: "PER_HOUR", taxRate: "7.5% VAT" },
  { id: "b3", name: "Annual Corporate Financial Audit", sku: "BS-AUDIT-ANNUAL", rateKobo: 450000000, billingType: "ONE_TIME", taxRate: "7.5% VAT" },
];

export default function BillstacksProductsPage() {
  const [items] = useState<BillstackItem[]>(ITEMS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/billstacks" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Billstacks Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Billing Products &amp; Services</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Catalog of billable services, retainer subscriptions, and standard invoice line items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Billing Item")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Billing Service</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">SKU / Code</th>
                <th className="py-2.5">Service Item Name</th>
                <th className="py-2.5">Billing Type</th>
                <th className="py-2.5">Applicable Tax</th>
                <th className="py-2.5 text-right">Standard Rate (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{it.sku}</td>
                  <td className="py-3 font-semibold text-heading">{it.name}</td>
                  <td className="py-3 font-mono text-muted">{it.billingType}</td>
                  <td className="py-3 text-muted">{it.taxRate}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(it.rateKobo)}
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
