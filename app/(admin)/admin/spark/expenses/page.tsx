"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, DollarSign } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface SparkExpense {
  id: string;
  category: string;
  title: string;
  location: string;
  amountKobo: number;
  date: string;
}

const EXPENSES: SparkExpense[] = [
  { id: "1", category: "Power & Fuel", title: "Diesel generator supply for Computer Village complex", location: "Medical Road", amountKobo: 8500000, date: "18 Nov 2026" },
  { id: "2", category: "Security & Association", title: "CAPDAN Computer Village Security & Cleanliness Levy", location: "Adepele Shop", amountKobo: 2500000, date: "15 Nov 2026" },
  { id: "3", category: "Logistics", title: "Dispatch bike transport to Ikeja Post Office", location: "Olayeni Office", amountKobo: 1200000, date: "14 Nov 2026" },
];

export default function SparkExpensesPage() {
  const [expenses] = useState<SparkExpense[]>(EXPENSES);

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
            <h1 className="text-2xl font-bold text-heading">Branch Daily Expenses</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Computer Village shop operating costs, CAPDAN levies, diesel generator expenses and repairs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Log Branch Expense")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Daily Expense</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Expense Description</th>
                <th className="py-2.5">Shop Location</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-semibold text-spark">{e.category}</td>
                  <td className="py-3 font-medium text-heading">{e.title}</td>
                  <td className="py-3 text-muted">{e.location}</td>
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
