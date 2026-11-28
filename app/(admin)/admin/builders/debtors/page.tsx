"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Phone,
  DollarSign,
  Plus,
  ArrowUpDown,
  Search,
  CheckCircle2,
  X,
  ArrowLeft,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { NumberInput } from "@/components/ui/number-input";

interface DebtorCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  initial: string;
  totalOwedKobo: number;
  oldestInvoiceDate: string;
  daysAgo: number;
  unpaidCount: number;
}

const SEED_DEBTORS: DebtorCustomer[] = [];

export default function TopBuildersDebtorsPage() {
  const { recordTransaction } = usePlatformStore();
  const [debtors, setDebtors] = useState<DebtorCustomer[]>(SEED_DEBTORS);
  const [sortBy, setSortBy] = useState<"highest" | "oldest">("highest");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add Customer modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "", address: "", initialDebtNaira: "" });

  // Payment modal
  const [payModalDebtor, setPayModalDebtor] = useState<DebtorCustomer | null>(null);
  const [payAmountNaira, setPayAmountNaira] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.phone.trim()) return;

    const debtKobo = Math.round(Number(newCust.initialDebtNaira || 0) * 100);
    const created: DebtorCustomer = {
      id: `deb_${Date.now()}`,
      name: newCust.name.trim(),
      phone: newCust.phone.trim(),
      address: newCust.address.trim() || "Local Contractor Site",
      initial: newCust.name.trim().charAt(0).toUpperCase(),
      totalOwedKobo: debtKobo,
      oldestInvoiceDate: new Date().toLocaleDateString("en-GB"),
      daysAgo: 0,
      unpaidCount: debtKobo > 0 ? 1 : 0,
    };

    setDebtors([created, ...debtors]);
    setAddModalOpen(false);
    setNewCust({ name: "", phone: "", address: "", initialDebtNaira: "" });
    showToast(`Customer ${created.name} registered successfully.`);
  };

  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalDebtor || !payAmountNaira) return;

    const payKobo = Math.round(Number(payAmountNaira) * 100);
    const newOwed = Math.max(0, payModalDebtor.totalOwedKobo - payKobo);

    setDebtors((prev) =>
      prev.map((d) => (d.id === payModalDebtor.id ? { ...d, totalOwedKobo: newOwed } : d))
    );

    recordTransaction({
      source: ServiceSlug.BUILDERS,
      activityType: "PAYMENT",
      activitySummary: `Debt settlement received from ${payModalDebtor.name} (${payMethod})`,
      invoiceNo: `REC-${Date.now().toString().slice(-6)}`,
      customer: payModalDebtor.name,
      amountKobo: payKobo,
      location: "Top Builders Main Yard",
      status: "PAID",
    });

    showToast(`Received ₦${Number(payAmountNaira).toLocaleString()} from ${payModalDebtor.name}. Ledger updated!`);
    setPayModalDebtor(null);
    setPayAmountNaira("");
  };

  const totalOwedKobo = debtors.reduce((sum, d) => sum + d.totalOwedKobo, 0);

  const sorted = [...debtors].sort((a, b) => {
    if (sortBy === "highest") return b.totalOwedKobo - a.totalOwedKobo;
    return b.daysAgo - a.daysAgo;
  });

  const filtered = sorted.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.address.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-emerald-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/builders" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Top Builders Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-builders" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">Debtors &amp; Receivables</h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Customers with outstanding balances in the Top Builders materials registry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-builders text-white text-xs font-bold hover:bg-builders-dark transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="p-5 rounded-2xl border border-border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Owed by Debtors</p>
          <h2 className="text-3xl font-black text-rose-600 mt-1">
            {formatCurrency(totalOwedKobo)}{" "}
            <span className="text-xs font-medium text-muted">owed by {debtors.length} customers</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortBy("highest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              sortBy === "highest" ? "bg-builders text-white" : "border border-border bg-white text-muted hover:text-heading"
            }`}
          >
            Highest Owed
          </button>
          <button
            type="button"
            onClick={() => setSortBy("oldest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              sortBy === "oldest" ? "bg-builders text-white" : "border border-border bg-white text-muted hover:text-heading"
            }`}
          >
            Oldest Debt
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer, phone, address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-builders"
        />
      </div>

      {/* Debtors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl border border-border bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={d.name} size="md" />
                  <div>
                    <h3 className="font-bold text-heading text-sm">{d.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{d.phone}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {d.daysAgo > 0 ? `${d.daysAgo}d ago` : "Today"}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Total Outstanding:</span>
                  <span className="font-black text-rose-600 text-sm">
                    {formatCurrency(d.totalOwedKobo)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Site Location:</span>
                  <span className="text-heading font-medium truncate max-w-[160px]">{d.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Oldest Invoice:</span>
                  <span className="text-heading font-medium">{d.oldestInvoiceDate}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border">
              <a
                href={`tel:${d.phone}`}
                className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border bg-white text-heading font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-muted" />
                <span>Call</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setPayModalDebtor(d);
                  setPayAmountNaira(String(d.totalOwedKobo / 100));
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-builders text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Receive Payment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Add New Debtor Customer</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Customer / Contractor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alhaji Musa Enterprises"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-builders"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08031234567"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-builders"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Site / Delivery Address</label>
                <input
                  type="text"
                  placeholder="e.g. Lekki Phase 1 Building Site"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-builders"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Initial Outstanding Debt (₦)</label>
                <NumberInput
                  placeholder="0"
                  prefix="₦"
                  value={newCust.initialDebtNaira}
                  onChange={(v) => setNewCust({ ...newCust, initialDebtNaira: v === "" ? "" : String(v) })}
                  className="rounded-xl focus:border-builders"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-builders text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {payModalDebtor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Receive Debt Payment</h3>
                  <p className="text-xs text-gray-500">{payModalDebtor.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPayModalDebtor(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-center text-xs">
              <span className="text-rose-700 font-medium">Current Debt Balance:</span>
              <span className="font-black text-rose-800 text-sm">
                {formatCurrency(payModalDebtor.totalOwedKobo)}
              </span>
            </div>

            <form onSubmit={handleReceivePayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Amount to Pay (₦) *</label>
                <NumberInput
                  required
                  min={1}
                  max={payModalDebtor.totalOwedKobo / 100}
                  prefix="₦"
                  value={payAmountNaira}
                  onChange={(v) => setPayAmountNaira(v === "" ? "" : String(v))}
                  className="rounded-xl focus:border-builders"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-builders bg-white text-gray-900"
                >
                  <option value="CASH">Cash Deposit</option>
                  <option value="MONIEPOINT_POS">Moniepoint POS Transfer</option>
                  <option value="UBA">UBA Direct Bank Transfer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPayModalDebtor(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-builders text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Record Payment &amp; Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
