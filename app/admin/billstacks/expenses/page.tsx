"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingDown, Plus, ArrowLeft, Search, Filter } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  vendor: string;
  amountKobo: number;
  date: string;
  paymentMode: string;
}

const EXPENSES: ExpenseRow[] = [
  { id: "e1", category: "Cloud Hosting", description: "AWS & Vercel Enterprise Cloud Compute", vendor: "Amazon Web Services", amountKobo: 12000000, date: "19 Nov 2026", paymentMode: "Corporate Card" },
  { id: "e2", category: "Office & Power", description: "Diesel Generator Refueling (1,000L)", vendor: "TotalEnergies Nigeria", amountKobo: 13500000, date: "18 Nov 2026", paymentMode: "Bank Transfer" },
  { id: "e3", category: "Software Licensing", description: "Google Workspace & Slack Enterprise", vendor: "Google Cloud", amountKobo: 4500000, date: "15 Nov 2026", paymentMode: "Corporate Card" },
  { id: "e4", category: "Legal & Audit", description: "Quarterly Tax Filing & Advisory", vendor: "KPMG Nigeria", amountKobo: 35000000, date: "10 Nov 2026", paymentMode: "Bank Transfer" },
];

export default function BillstacksExpensesPage() {
  const [expenses] = useState<ExpenseRow[]>(EXPENSES);
  const [search, setSearch] = useState("");

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenseKobo = expenses.reduce((acc, it) => acc + it.amountKobo, 0);

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
            <h1 className="text-2xl font-bold text-heading">Operating Expenses Tracker</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Record corporate overheads, vendor disbursements, server hosting and office bills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Log expense dialog")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Total Expenses (MTD)</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">
            {formatCurrency(totalExpenseKobo)}
          </h3>
          <p className="text-[11px] text-muted mt-1">November 2026 Total</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Cloud &amp; Infrastructure</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦165,000</h3>
          <p className="text-[11px] text-muted mt-1">AWS &amp; Vercel</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Facility &amp; Diesel Overhead</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦135,000</h3>
          <p className="text-[11px] text-muted mt-1">Backup generator fuel</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor, description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-billstacks"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Expense Description</th>
                <th className="py-2.5">Vendor / Payee</th>
                <th className="py-2.5">Payment Mode</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-semibold text-billstacks">{e.category}</td>
                  <td className="py-3 font-medium text-heading">{e.description}</td>
                  <td className="py-3 text-muted">{e.vendor}</td>
                  <td className="py-3 text-muted">{e.paymentMode}</td>
                  <td className="py-3 text-muted">{e.date}</td>
                  <td className="py-3 text-right font-black text-rose-600">
                    {formatCurrency(e.amountKobo)}
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
