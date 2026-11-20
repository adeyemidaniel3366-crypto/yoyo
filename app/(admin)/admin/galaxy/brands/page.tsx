"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, ShieldCheck } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface BrandItem {
  id: string;
  name: string;
  origin: string;
  warrantyPolicy: string;
  productsCount: number;
}

const BRANDS: BrandItem[] = [
  { id: "b1", name: "Samsung Electronics", origin: "South Korea", warrantyPolicy: "5-Year Manufacturer Warranty", productsCount: 14 },
  { id: "b2", name: "Apple Inc.", origin: "USA", warrantyPolicy: "1-Year Official AppleCare", productsCount: 8 },
  { id: "b3", name: "Lexar", origin: "USA", warrantyPolicy: "3-Year Lexar Limited Warranty", productsCount: 10 },
  { id: "b4", name: "Synology", origin: "Taiwan", warrantyPolicy: "3-Year Enterprise Replacement", productsCount: 5 },
  { id: "b5", name: "JBL by Harman", origin: "USA", warrantyPolicy: "1-Year Harman Warranty", productsCount: 12 },
  { id: "b6", name: "Zealot Audio", origin: "China", warrantyPolicy: "6-Month Fast Replacement", productsCount: 15 },
];

export default function GalaxyBrandsPage() {
  const [brands] = useState<BrandItem[]>(BRANDS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/galaxy" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Galaxy Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Authorized Brands &amp; Manufacturers</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Authorized electronics manufacturers, official warranty terms and product distribution partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Brand")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Brand Partner</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Brand Partner</th>
                <th className="py-2.5">Headquarters</th>
                <th className="py-2.5">Standard Warranty Coverage</th>
                <th className="py-2.5 text-center">Catalog Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{b.name}</td>
                  <td className="py-3 text-muted">{b.origin}</td>
                  <td className="py-3 font-semibold text-heading flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-galaxy" />
                    <span>{b.warrantyPolicy}</span>
                  </td>
                  <td className="py-3 text-center font-bold text-galaxy">{b.productsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
