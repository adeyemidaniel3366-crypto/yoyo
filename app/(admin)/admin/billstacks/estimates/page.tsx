"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Plus, ArrowLeft, Search, Check, X } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface EstimateRow {
  id: string;
  estimateNo: string;
  client: string;
  amountKobo: number;
  validUntil: string;
  status: "ACCEPTED" | "PENDING" | "DECLINED";
}

const ESTIMATES: EstimateRow[] = [
  { id: "est1", estimateNo: "EST-00041", client: "Dangote Refinery Tech Unit", amountKobo: 350000000, validUntil: "30 Nov 2026", status: "PENDING" },
  { id: "est2", estimateNo: "EST-00040", client: "Flutterwave Engineering", amountKobo: 120000000, validUntil: "28 Nov 2026", status: "ACCEPTED" },
  { id: "est3", estimateNo: "EST-00039", client: "Interswitch HQ", amountKobo: 480000000, validUntil: "15 Nov 2026", status: "ACCEPTED" },
];

export default function BillstacksEstimatesPage() {
  const [estimates] = useState<EstimateRow[]>(ESTIMATES);
  const [search, setSearch] = useState("");

  const filtered = estimates.filter(
    (e) =>
      e.estimateNo.toLowerCase().includes(search.toLowerCase()) ||
      e.client.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-heading">Quotations &amp; Estimates</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Create, send, and convert price quotes into live invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("New quote dialog")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Estimate</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search estimate # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-billstacks"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Estimate #</th>
                <th className="py-2.5">Client</th>
                <th className="py-2.5">Valid Until</th>
                <th className="py-2.5 text-right">Quote Value</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((est) => (
                <tr key={est.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{est.estimateNo}</td>
                  <td className="py-3 font-semibold text-heading">{est.client}</td>
                  <td className="py-3 text-muted">{est.validUntil}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(est.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        est.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : est.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {est.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Converting ${est.estimateNo} into an active Invoice`)}
                      className="px-3 py-1 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50"
                    >
                      Convert to Invoice
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
