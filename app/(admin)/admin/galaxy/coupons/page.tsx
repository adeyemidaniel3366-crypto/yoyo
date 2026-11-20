"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tag, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface CouponRow {
  id: string;
  code: string;
  discount: string;
  minSpend: string;
  usedCount: number;
  maxUses: number;
  expiry: string;
  active: boolean;
}

const COUPONS: CouponRow[] = [
  { id: "1", code: "ZINO2026", discount: "10% Discount", minSpend: "₦50,000", usedCount: 18, maxUses: 100, expiry: "31 Dec 2026", active: true },
  { id: "2", code: "WELCOME10", discount: "10% Discount", minSpend: "₦20,000", usedCount: 42, maxUses: 200, expiry: "31 Dec 2026", active: true },
  { id: "3", code: "BLACKFRIDAY", discount: "15% Flash Deal", minSpend: "₦100,000", usedCount: 88, maxUses: 100, expiry: "30 Nov 2026", active: true },
];

export default function GalaxyCouponsPage() {
  const [coupons] = useState<CouponRow[]>(COUPONS);

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
            <h1 className="text-2xl font-bold text-heading">Storefront Promotional Coupons</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Create discount coupon codes, flash deal percentage vouchers, and minimum spend limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Create Discount Coupon")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Coupon Code</th>
                <th className="py-2.5">Discount Benefit</th>
                <th className="py-2.5">Min Spend</th>
                <th className="py-2.5 text-center">Usage Count</th>
                <th className="py-2.5">Expiry Date</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-black text-sm text-galaxy">{c.code}</td>
                  <td className="py-3 font-bold text-heading">{c.discount}</td>
                  <td className="py-3 text-muted">{c.minSpend}</td>
                  <td className="py-3 text-center font-bold text-heading">
                    {c.usedCount} / {c.maxUses}
                  </td>
                  <td className="py-3 text-muted">{c.expiry}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      ACTIVE
                    </span>
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
