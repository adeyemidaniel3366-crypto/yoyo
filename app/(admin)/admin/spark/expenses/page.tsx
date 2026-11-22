"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DollarSign, Plus, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { NumberInput } from "@/components/ui/number-input";

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
  const { recordTransaction } = usePlatformStore();
  const [expenses, setExpenses] = useState<SparkExpense[]>(EXPENSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newExp, setNewExp] = useState({
    category: "Power & Fuel",
    title: "",
    location: "Medical Road",
    amountNaira: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.title.trim() || !newExp.amountNaira.trim()) return;

    const amountKobo = Math.round(Number(newExp.amountNaira) * 100);
    const expDate = newExp.date || new Date().toISOString().slice(0, 10);
    const expId = `exp_${Date.now()}`;

    const created: SparkExpense = {
      id: expId,
      category: newExp.category,
      title: newExp.title.trim(),
      location: newExp.location,
      amountKobo,
      date: expDate,
    };

    setExpenses([created, ...expenses]);

    recordTransaction({
      source: ServiceSlug.SPARK,
      activityType: "EXPENSE",
      activitySummary: `${created.category}: ${created.title} (${created.location})`,
      invoiceNo: `SPK-EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: created.location,
      amountKobo,
      location: created.location,
      status: "PAID",
      createdAt: expDate,
    });

    setModalOpen(false);
    setNewExp({ category: "Power & Fuel", title: "", location: "Medical Road", amountNaira: "", date: new Date().toISOString().slice(0, 10) });
    showToast(`Branch expense recorded and synced to executive dashboard.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-blue-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-spark/10 text-spark flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Log Branch Daily Expense</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expense Category</label>
                <select
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                >
                  <option value="Power & Fuel">Power &amp; Diesel Fuel</option>
                  <option value="Security & Association">CAPDAN Market &amp; Security Levies</option>
                  <option value="Logistics">Dispatch Courier &amp; Logistics</option>
                  <option value="Maintenance">Shop Maintenance &amp; Fittings</option>
                  <option value="Stationery">POS Paper Rolls &amp; Stationery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50L Generator Diesel Supply"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Shop Location</label>
                  <select
                    value={newExp.location}
                    onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                  >
                    <option value="Medical Road">Medical Road</option>
                    <option value="Adepele Shop">Adepele Shop</option>
                    <option value="Olayeni Office">Olayeni Office</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Amount (₦) *</label>
                  <NumberInput
                    required
                    min={1}
                    prefix="₦"
                    placeholder="e.g. 25,000"
                    value={newExp.amountNaira}
                    onChange={(v) => setNewExp({ ...newExp, amountNaira: v === "" ? "" : String(v) })}
                    className="rounded-xl focus:border-spark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={newExp.date}
                  onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-spark text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
