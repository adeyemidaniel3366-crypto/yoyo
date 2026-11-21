"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingDown, Plus, ArrowLeft, Search, Filter, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

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
  const { recordTransaction } = usePlatformStore();
  const [expenses, setExpenses] = useState<ExpenseRow[]>(EXPENSES);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newExp, setNewExp] = useState({
    category: "Cloud Hosting",
    description: "",
    vendor: "",
    amountNaira: "",
    paymentMode: "Bank Transfer",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.description.trim() || !newExp.vendor.trim() || !newExp.amountNaira.trim()) return;

    const amountKobo = Math.round(Number(newExp.amountNaira) * 100);
    const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
    const expenseId = `exp_${Date.now()}`;

    const created: ExpenseRow = {
      id: expenseId,
      category: newExp.category,
      description: newExp.description.trim(),
      vendor: newExp.vendor.trim(),
      amountKobo,
      date: today,
      paymentMode: newExp.paymentMode,
    };

    setExpenses([created, ...expenses]);

    recordTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "EXPENSE",
      activitySummary: `${created.category}: ${created.description} (${created.vendor})`,
      invoiceNo: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      customer: created.vendor,
      amountKobo,
      location: "Billstacks Cloud HQ",
      status: "PAID",
    });

    setModalOpen(false);
    setNewExp({
      category: "Cloud Hosting",
      description: "",
      vendor: "",
      amountNaira: "",
      paymentMode: "Bank Transfer",
    });
    showToast(`Expense of ₦${Number(created.amountKobo / 100).toLocaleString()} recorded and deducted from executive summary!`);
  };

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenseKobo = expenses.reduce((acc, it) => acc + it.amountKobo, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-emerald-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Total Expenses (Current)</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">
            {formatCurrency(totalExpenseKobo)}
          </h3>
          <p className="text-[11px] text-muted mt-1">{expenses.length} Total Disbursements</p>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Log Operating Expense</h3>
                  <p className="text-xs text-gray-500">Record company overhead & deduction</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                >
                  <option value="Cloud Hosting">Cloud Hosting & Infrastructure</option>
                  <option value="Office & Power">Office & Power Utilities</option>
                  <option value="Software Licensing">Software Licensing</option>
                  <option value="Legal & Audit">Legal & Advisory</option>
                  <option value="Marketing">Marketing & Ad Spend</option>
                  <option value="Equipment & Repair">Equipment & Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS server cluster payment"
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vendor / Payee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services"
                    value={newExp.vendor}
                    onChange={(e) => setNewExp({ ...newExp, vendor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150000"
                    value={newExp.amountNaira}
                    onChange={(e) => setNewExp({ ...newExp, amountNaira: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={newExp.paymentMode}
                  onChange={(e) => setNewExp({ ...newExp, paymentMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                >
                  <option value="Bank Transfer">Bank Transfer / NIP</option>
                  <option value="Corporate Card">Corporate Debit / Credit Card</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="Petty Cash">Petty Cash</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold hover:opacity-95 shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
