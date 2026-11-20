"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Repeat, Plus, ArrowLeft, Search, Calendar, Play, Pause } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface RecurringProfile {
  id: string;
  profileName: string;
  client: string;
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  amountKobo: number;
  nextRun: string;
  isActive: boolean;
}

const RECURRING: RecurringProfile[] = [
  { id: "rec1", profileName: "SaaS Accounting Suite Retainer", client: "Prime Technologies PLC", frequency: "MONTHLY", amountKobo: 145000000, nextRun: "18 Dec 2026", isActive: true },
  { id: "rec2", profileName: "Cloud Infrastructure Support", client: "Apex Logistics Nigeria", frequency: "MONTHLY", amountKobo: 85000000, nextRun: "19 Dec 2026", isActive: true },
  { id: "rec3", profileName: "Quarterly Audit Advisory", client: "Zenith Global Partners", frequency: "QUARTERLY", amountKobo: 660000000, nextRun: "15 Jan 2027", isActive: true },
];

export default function BillstacksRecurringPage() {
  const [profiles, setProfiles] = useState<RecurringProfile[]>(RECURRING);

  const toggleProfile = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

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
            <h1 className="text-2xl font-bold text-heading">Recurring Invoices &amp; Subscriptions</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Automated monthly retainers, scheduled client billing, and subscription cadences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("New recurring profile")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Schedule</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Profile / Service</th>
                <th className="py-2.5">Client</th>
                <th className="py-2.5">Frequency</th>
                <th className="py-2.5">Next Run Date</th>
                <th className="py-2.5 text-right">Cadence Amount</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{p.profileName}</td>
                  <td className="py-3 text-muted">{p.client}</td>
                  <td className="py-3 font-mono font-semibold">{p.frequency}</td>
                  <td className="py-3 text-muted">{p.nextRun}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.isActive ? "ACTIVE SCHEDULE" : "PAUSED"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleProfile(p.id)}
                      className="px-3 py-1 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50 inline-flex items-center gap-1.5"
                    >
                      {p.isActive ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
                      <span>{p.isActive ? "Pause" : "Resume"}</span>
                    </button>
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
