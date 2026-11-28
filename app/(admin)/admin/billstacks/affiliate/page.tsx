"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, ArrowLeft, TrendingUp, DollarSign } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface PartnerRow {
  id: string;
  partner: string;
  code: string;
  referrals: number;
  revenueKobo: number;
  commissionKobo: number;
}

const PARTNERS: PartnerRow[] = [];

export default function BillstacksAffiliatePage() {
  const [partners] = useState<PartnerRow[]>(PARTNERS);

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
            <h1 className="text-2xl font-bold text-heading">Affiliate &amp; Partner Referrals</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Track referral partner conversions, promo code signups, and commission payouts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Partner Name</th>
                <th className="py-2.5">Referral Code</th>
                <th className="py-2.5 text-center">Converted Signups</th>
                <th className="py-2.5 text-right">Attributed Revenue</th>
                <th className="py-2.5 text-right">Commission Due (10%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{p.partner}</td>
                  <td className="py-3 font-mono font-bold text-billstacks">{p.code}</td>
                  <td className="py-3 text-center font-bold text-heading">{p.referrals}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.revenueKobo)}
                  </td>
                  <td className="py-3 text-right font-black text-emerald-600">
                    {formatCurrency(p.commissionKobo)}
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
