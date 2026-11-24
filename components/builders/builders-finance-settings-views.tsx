"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Wallet,
  ArrowDown,
  Clock,
  Phone,
  FileText,
  ChevronLeft,
  Banknote,
  CreditCard,
  Building2,
  Printer,
  Download,
  Shield,
  Upload,
  Lock,
  Info,
  X,
  Trash2,
  Check,
  History,
  Filter,
} from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import {
  BuilderDebtorCustomer,
  BuilderExpenseRecord,
  BuilderSaleRecord,
  BuilderProduct,
  BuilderUserRecord,
  BuilderBusinessSettings,
  BuilderAuditEntry,
} from "./builders-types";

/* ============================================================================
   IMAGE 9 — DEBTORS VIEW
   ============================================================================ */
export function DebtorsView({
  customers,
  paymentAccounts,
  onAddCustomerClick,
  onReceivePayment,
  showToast,
}: {
  customers: BuilderDebtorCustomer[];
  paymentAccounts: { name: string; active: boolean }[];
  onAddCustomerClick: () => void;
  onReceivePayment: (customerId: string, amountNaira: number, method: string) => void;
  showToast: (msg: string) => void;
}) {
  const [tab, setTab] = useState<"Debtors" | "All customers">("Debtors");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"highest" | "oldest">("highest");
  const [payingCustomer, setPayingCustomer] = useState<BuilderDebtorCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [viewingInvoicesCustomer, setViewingInvoicesCustomer] =
    useState<BuilderDebtorCustomer | null>(null);

  const debtorsOnly = useMemo(
    () => customers.filter((c) => c.totalOwedNaira > 0),
    [customers]
  );

  const totalOwedAll = useMemo(
    () => debtorsOnly.reduce((sum, c) => sum + c.totalOwedNaira, 0),
    [debtorsOnly]
  );

  const filtered = useMemo(() => {
    const base = tab === "Debtors" ? debtorsOnly : customers;
    const searched = base.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase())
    );
    return [...searched].sort((a, b) =>
      sortBy === "highest" ? b.totalOwedNaira - a.totalOwedNaira : b.daysAgo - a.daysAgo
    );
  }, [tab, debtorsOnly, customers, search, sortBy]);

  const activeMethods = ["Cash", ...paymentAccounts.filter((a) => a.active).map((a) => a.name)];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Debtors</h1>
          <p className="text-xs text-slate-500 mt-0.5">Customers with unpaid invoices.</p>
        </div>
        <button
          type="button"
          onClick={onAddCustomerClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add customer</span>
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="inline-flex rounded-lg bg-slate-200/75 p-1 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setTab("Debtors")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === "Debtors" ? "bg-white text-[#1D63ED] shadow-2xs" : "text-slate-600"
            }`}
          >
            Debtors
          </button>
          <button
            type="button"
            onClick={() => setTab("All customers")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === "All customers" ? "bg-white text-[#1D63ED] shadow-2xs" : "text-slate-600"
            }`}
          >
            All customers
          </button>
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-100/80 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
          />
        </div>
      </div>

      {/* Summary & Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
          <Wallet className="w-5 h-5 text-rose-600" />
          <div>
            <p className="text-lg font-black text-rose-700 leading-none tabular-nums">
              ₦{totalOwedAll.toLocaleString()}
            </p>
            <p className="text-[10px] text-rose-600 mt-0.5">
              owed by {debtorsOnly.length} customers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSortBy("highest")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              sortBy === "highest"
                ? "bg-[#1D63ED] border-[#1D63ED] text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Highest owed</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy("oldest")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              sortBy === "oldest"
                ? "bg-[#1D63ED] border-[#1D63ED] text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Oldest debt</span>
          </button>
        </div>
      </div>

      {/* Debtors Card List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No matching customers found.
          </div>
        ) : (
          filtered.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:border-blue-200 transition-colors"
            >
              {/* Customer Avatar & Info */}
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <div className="w-9 h-9 rounded-full bg-[#EEF4FF] text-[#1D63ED] font-extrabold text-xs flex items-center justify-center shrink-0">
                  {cust.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-xs text-[#12264A]">{cust.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{cust.phone}</p>
                  {cust.address && (
                    <p className="text-[11px] text-slate-400">{cust.address}</p>
                  )}
                </div>
              </div>

              {/* Total Owed */}
              <div className="min-w-[110px]">
                <p className="text-[10px] text-slate-400">Total owed</p>
                <p className="text-sm font-black text-rose-600 tabular-nums">
                  ₦{cust.totalOwedNaira.toLocaleString()}
                </p>
              </div>

              {/* Oldest Invoice */}
              <div className="min-w-[110px]">
                <p className="text-[10px] text-slate-400">Oldest invoice</p>
                <p className="text-xs font-bold text-[#12264A]">{cust.oldestInvoiceDate}</p>
                <p className="text-[10px] text-slate-400">{cust.daysAgo} days ago</p>
              </div>

              {/* Unpaid Count */}
              <div className="flex items-center gap-2 min-w-[110px]">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-[#12264A]">
                    {cust.unpaidInvoicesCount} unpaid
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewingInvoicesCustomer(cust)}
                    className="text-[11px] text-[#1D63ED] hover:underline font-semibold"
                  >
                    View invoices
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <a
                  href={`tel:${cust.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(`Calling ${cust.name} (${cust.phone})...`);
                  }}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  disabled={cust.totalOwedNaira <= 0}
                  onClick={() => {
                    setPayingCustomer(cust);
                    setPaymentAmount(cust.totalOwedNaira);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-2xs"
                >
                  Receive payment
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receive Payment Modal */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#12264A]">Receive Debt Payment</h3>
                <p className="text-[11px] text-slate-500">
                  {payingCustomer.name} · Total owed: ₦
                  {payingCustomer.totalOwedNaira.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayingCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#12264A] mb-1">Amount Received (₦)</label>
                <NumberInput
                  value={paymentAmount}
                  onChange={(v) => setPaymentAmount(Number(v) || 0)}
                  min={1}
                  max={payingCustomer.totalOwedNaira}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block font-bold text-[#12264A] mb-1">Paid Into</label>
                <div className="grid grid-cols-3 gap-2">
                  {activeMethods.slice(0, 3).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`h-9 px-2 rounded-lg font-bold border ${
                        paymentMethod === m
                          ? "bg-[#1D63ED] border-[#1D63ED] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingCustomer(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (paymentAmount > 0) {
                    onReceivePayment(payingCustomer.id, paymentAmount, paymentMethod);
                    setPayingCustomer(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#1D63ED] text-white font-bold"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Unpaid Invoices Modal */}
      {viewingInvoicesCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#12264A]">
                  Unpaid Invoices — {viewingInvoicesCustomer.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Oldest: {viewingInvoicesCustomer.oldestInvoiceDate} ({viewingInvoicesCustomer.daysAgo} days ago)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingInvoicesCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {viewingInvoicesCustomer.invoiceNumbers.map((invNo) => (
                <div key={invNo} className="p-3 flex items-center justify-between">
                  <span className="font-bold text-[#1D63ED]">{invNo}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                    Unpaid
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingInvoicesCustomer(null)}
                className="px-4 py-2 rounded-lg bg-[#1D63ED] text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   IMAGE 10 — ADD CUSTOMER VIEW
   ============================================================================ */
export function AddCustomerView({
  onCancel,
  onSaveCustomer,
}: {
  onCancel: () => void;
  onSaveCustomer: (customer: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveCustomer({
      name: name.trim(),
      phone: phone.trim() || "—",
      address: address.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="max-w-xl mx-auto py-4 space-y-4 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Add customer</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Customers are also added automatically when someone buys on credit.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-[#12264A] mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">
              Address / area (optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-[#12264A] mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            Add customer
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================================
   IMAGE 11 — EXPENSES VIEW
   ============================================================================ */
export function ExpensesView({
  expenses,
  categories,
  paymentAccounts,
  onAddExpense,
  onDeleteExpense,
}: {
  expenses: BuilderExpenseRecord[];
  categories: string[];
  paymentAccounts: { name: string; active: boolean }[];
  onAddExpense: (exp: {
    date: string;
    category: string;
    description: string;
    amountNaira: number;
    paidFrom: string;
  }) => void;
  onDeleteExpense: (id: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState("2026-11-23");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paidFrom, setPaidFrom] = useState("Cash");

  const dayExpenses = useMemo(
    () => expenses.filter((e) => e.date === selectedDate),
    [expenses, selectedDate]
  );

  const totalDayExpenses = useMemo(
    () => dayExpenses.reduce((sum, e) => sum + e.amountNaira, 0),
    [dayExpenses]
  );

  const activeMethods = ["Cash", ...paymentAccounts.filter((a) => a.active).map((a) => a.name)];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    onAddExpense({
      date: selectedDate,
      category: selectedCategory || categories[0] || "Miscellaneous",
      description: description.trim() || selectedCategory || "Shop expense",
      amountNaira: amount,
      paidFrom,
    });
    setDescription("");
    setAmount(0);
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Expenses</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Day-to-day money spent by the shop: the Expenses column of the sales book.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Image 11 Left) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-rose-600" />
              <div>
                <p className="text-[10px] text-slate-600 font-medium">
                  Total expenses ({selectedDate === "2026-11-23" ? "today" : selectedDate})
                </p>
                <p className="text-lg font-black text-rose-600 tabular-nums">
                  ₦{totalDayExpenses.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().slice(0, 10));
                }}
                className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {dayExpenses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              No expenses recorded.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {dayExpenses.map((exp) => (
                <div key={exp.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#12264A]">{exp.description}</p>
                    <p className="text-[11px] text-slate-400">
                      {exp.category} · Paid from {exp.paidFrom}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-rose-600 tabular-nums">
                      ₦{exp.amountNaira.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Add Expense Form (Image 11 Right) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs"
        >
          <h2 className="font-extrabold text-[#12264A] text-sm">Add expense</h2>

          <div>
            <label className="block font-bold text-[#12264A] text-[11px] mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#1D63ED] border-[#1D63ED] text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#12264A] text-[11px] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">e.g. Fuel for delivery van</p>
          </div>

          <div>
            <label className="block font-bold text-[#12264A] text-[11px] mb-1">Amount (₦)</label>
            <NumberInput
              value={amount}
              onChange={(v) => setAmount(Number(v) || 0)}
              min={0}
              className="h-9 bg-slate-100/80"
            />
          </div>

          <div>
            <label className="block font-bold text-[#12264A] text-[11px] mb-1.5">Paid from</label>
            <div className="grid grid-cols-3 gap-2">
              {activeMethods.slice(0, 3).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaidFrom(m)}
                  className={`py-2 px-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-colors ${
                    paidFrom === m
                      ? "border-[#1D63ED] bg-[#EEF4FF] text-[#1D63ED] font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m === "Cash" ? (
                    <Banknote className="w-3.5 h-3.5" />
                  ) : m.includes("POS") ? (
                    <CreditCard className="w-3.5 h-3.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px] truncate max-w-full">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Save expense
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE 12 — TODAY'S ACCOUNT VIEW
   ============================================================================ */
export function TodaysAccountView({
  todaySales,
  todayExpenses,
  isTodayClosed,
  onCloseToday,
}: {
  todaySales: BuilderSaleRecord[];
  todayExpenses: BuilderExpenseRecord[];
  isTodayClosed: boolean;
  onCloseToday: () => void;
}) {
  const hasAnyActivity = todaySales.length > 0 || todayExpenses.length > 0;

  const cashSales = todaySales
    .filter((s) => s.paymentMethod === "Cash")
    .reduce((sum, s) => sum + s.amountPaidNaira, 0);
  const transferSales = todaySales
    .filter((s) => s.paymentMethod !== "Cash")
    .reduce((sum, s) => sum + s.amountPaidNaira, 0);
  const cashExpenses = todayExpenses
    .filter((e) => e.paidFrom === "Cash")
    .reduce((sum, e) => sum + e.amountNaira, 0);
  const drawerBalance = cashSales - cashExpenses;

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">
          Today&apos;s account
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Mon, 23 Nov 2026</p>
      </div>

      {!hasAnyActivity ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-slate-500 text-xs shadow-2xs">
          Nothing was recorded on this day, so there is nothing to close.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-sm text-[#12264A]">
              End-of-Day Cash Drawer Reconciliation
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isTodayClosed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isTodayClosed ? "Day Closed ✓" : "Open"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500">Cash Received</p>
              <p className="text-base font-black text-[#12264A] mt-0.5">
                ₦{cashSales.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500">POS &amp; Bank</p>
              <p className="text-base font-black text-[#12264A] mt-0.5">
                ₦{transferSales.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
              <p className="text-[10px] text-rose-600">Cash Expenses</p>
              <p className="text-base font-black text-rose-700 mt-0.5">
                ₦{cashExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-[10px] text-emerald-700">Cash in Drawer</p>
              <p className="text-base font-black text-emerald-800 mt-0.5">
                ₦{drawerBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCloseToday}
              className="px-5 py-2.5 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold"
            >
              {isTodayClosed ? "Re-open / Update Day" : "Close Today's Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   IMAGE 13 — REPORTS VIEW
   ============================================================================ */
export function ReportsView({
  sales,
  products,
  debtors,
  expenses,
  onNavigateToDebtors,
  showToast,
}: {
  sales: BuilderSaleRecord[];
  products: BuilderProduct[];
  debtors: BuilderDebtorCustomer[];
  expenses: BuilderExpenseRecord[];
  onNavigateToDebtors: () => void;
  showToast: (msg: string) => void;
}) {
  const [periodPreset, setPeriodPreset] = useState<
    "Today" | "Yesterday" | "This week" | "This month" | "Last month"
  >("This month");
  const [fromDate, setFromDate] = useState("2026-11-01");
  const [toDate, setToDate] = useState("2026-11-23");
  const [subTab, setSubTab] = useState<"Sales" | "Payments" | "Stock" | "Debtors" | "Expenses">(
    "Sales"
  );
  const [showTable, setShowTable] = useState(false);

  const periodSales = useMemo(() => {
    return sales.filter((s) => s.date >= fromDate && s.date <= toDate);
  }, [sales, fromDate, toDate]);

  const totalSalesVal = useMemo(
    () => periodSales.reduce((sum, s) => sum + s.totalAmountNaira, 0),
    [periodSales]
  );
  const numSales = periodSales.length;
  const avgSale = numSales > 0 ? Math.round(totalSalesVal / numSales) : 0;
  const moneyReceived = useMemo(
    () => periodSales.reduce((sum, s) => sum + s.amountPaidNaira, 0),
    [periodSales]
  );
  const stillOwed = useMemo(
    () => periodSales.reduce((sum, s) => sum + s.outstandingNaira, 0),
    [periodSales]
  );

  // Aggregate top products in period
  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { itemNo: string; name: string; unit: string; qty: number; value: number }
    >();
    periodSales.forEach((s) => {
      s.items.forEach((it) => {
        const cleanName = it.description.replace(/\s*\([^)]*\)$/, "");
        const prev = map.get(it.itemNo) || {
          itemNo: it.itemNo,
          name: cleanName,
          unit: it.unit,
          qty: 0,
          value: 0,
        };
        prev.qty += it.qty;
        prev.value += it.totalAmountNaira;
        map.set(it.itemNo, prev);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [periodSales]);

  // Aggregate sales by rep
  const salesByRep = useMemo(() => {
    const map = new Map<string, { rep: string; count: number; value: number }>();
    periodSales.forEach((s) => {
      const prev = map.get(s.salesRep) || { rep: s.salesRep, count: 0, value: 0 };
      prev.count += 1;
      prev.value += s.totalAmountNaira;
      map.set(s.salesRep, prev);
    });
    return Array.from(map.values());
  }, [periodSales]);

  // Daily chart points 01..23 Nov 2026
  const novDays = Array.from({ length: 23 }, (_, i) => {
    const dayNum = String(i + 1).padStart(2, "0");
    const iso = `2026-11-${dayNum}`;
    const val = periodSales
      .filter((s) => s.date === iso)
      .reduce((sum, s) => sum + s.totalAmountNaira, 0);
    return { dayNum, iso, val };
  });

  const handleExportCsv = () => {
    const headers = "Invoice,Date,Customer,Total,Paid,Outstanding,Status\n";
    const rows = periodSales
      .map(
        (s) =>
          `${s.invoiceNo},${s.date},"${s.customerName}",${s.totalAmountNaira},${s.amountPaidNaira},${s.outstandingNaira},${s.status}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top-builders-report-${fromDate}-to-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported report CSV!");
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sales, payments, stock, debtors and expenses over any period.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Period Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(["Today", "Yesterday", "This week", "This month", "Last month"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPeriodPreset(p);
              if (p === "Today") {
                setFromDate("2026-11-23");
                setToDate("2026-11-23");
              } else if (p === "Yesterday") {
                setFromDate("2026-11-22");
                setToDate("2026-11-22");
              } else if (p === "This week") {
                setFromDate("2026-11-16");
                setToDate("2026-11-23");
              } else if (p === "This month") {
                setFromDate("2026-11-01");
                setToDate("2026-11-23");
              } else {
                setFromDate("2026-10-01");
                setToDate("2026-10-31");
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              periodPreset === p
                ? "bg-[#EEF4FF] border-[#95B6F7] text-[#1D63ED]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Date Range Pickers */}
      <div className="flex flex-wrap items-end gap-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={() => showToast(`Updated report for ${fromDate} to ${toDate}`)}
          className="h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-800"
        >
          Show
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-5 border-b border-slate-200 text-xs font-bold">
        {(["Sales", "Payments", "Stock", "Debtors", "Expenses"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSubTab(t)}
            className={`pb-2.5 border-b-2 transition-colors ${
              subTab === t
                ? "border-[#1D63ED] text-[#1D63ED]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-bold text-slate-500">
        Sun, 1 Nov 2026 to Mon, 23 Nov 2026
      </p>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] text-slate-400">Total sales</p>
          <p className="text-xl font-black text-[#12264A] mt-1 tabular-nums">
            ₦{totalSalesVal.toLocaleString()}
          </p>
          <p className="text-[10px] text-rose-500 mt-1">↓ 100% vs 09/10/26–31/10/26</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] text-slate-400">Number of sales</p>
          <p className="text-xl font-black text-[#12264A] mt-1 tabular-nums">{numSales}</p>
          <p className="text-[10px] text-rose-500 mt-1">↓ 98% vs 09/10/26–31/10/26</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] text-slate-400">Average sale</p>
          <p className="text-xl font-black text-[#12264A] mt-1 tabular-nums">
            ₦{avgSale.toLocaleString()}
          </p>
          <p className="text-[10px] text-rose-500 mt-1">↓ 87% vs 09/10/26–31/10/26</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] text-slate-400">Money received</p>
          <p className="text-xl font-black text-[#12264A] mt-1 tabular-nums">
            ₦{moneyReceived.toLocaleString()}
          </p>
          <p className="text-[10px] text-rose-500 mt-1">↓ 100% vs 09/10/26–31/10/26</p>
        </div>
      </div>

      {stillOwed > 0 && (
        <p className="text-[11px] text-slate-600">
          Of these sales, <strong className="text-rose-600">₦{stillOwed.toLocaleString()}</strong> is
          still owed.{" "}
          <button
            type="button"
            onClick={onNavigateToDebtors}
            className="text-[#1D63ED] font-bold hover:underline"
          >
            See debtors
          </button>
        </p>
      )}

      {/* Daily Sales Chart Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-[#12264A] text-sm">Daily sales: Nov 2026</h3>

        <div className="flex items-end gap-2 h-44 pt-4 pb-2 border-b border-slate-200 relative">
          {/* Y-Axis labels */}
          <div className="flex flex-col justify-between h-full text-[9px] text-slate-400 pr-2 shrink-0">
            <span>₦30k</span>
            <span>₦20k</span>
            <span>₦10k</span>
            <span>₦0</span>
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end justify-between h-full gap-1">
            {novDays.map((d) => {
              const heightPct = d.val > 0 ? Math.min(100, Math.round((d.val / 35000) * 100)) : 0;
              return (
                <div
                  key={d.dayNum}
                  className="flex-1 flex flex-col items-center justify-end h-full group"
                >
                  <div className="w-full flex items-end justify-center h-full">
                    {d.val > 0 && (
                      <div
                        style={{ height: `${heightPct}%` }}
                        title={`${d.iso}: ₦${d.val.toLocaleString()}`}
                        className="w-3 sm:w-4 bg-[#1D63ED] rounded-t transition-all group-hover:bg-blue-700"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis day labels */}
        <div className="flex items-center justify-between pl-8 text-[9px] text-slate-400">
          {["01", "03", "05", "07", "09", "11", "13", "15", "17", "19", "21", "23"].map((lbl) => (
            <span key={lbl}>{lbl}</span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="text-[11px] font-bold text-[#1D63ED] hover:underline flex items-center gap-1"
        >
          <span>{showTable ? "▾ Hide table" : "▸ Show as a table"}</span>
        </button>

        {showTable && (
          <div className="border-t border-slate-100 pt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-1.5">Date</th>
                  <th className="py-1.5 text-right">Sales Value (₦)</th>
                </tr>
              </thead>
              <tbody>
                {novDays
                  .filter((d) => d.val > 0)
                  .map((d) => (
                    <tr key={d.iso} className="border-b border-slate-50">
                      <td className="py-1.5">{d.iso}</td>
                      <td className="py-1.5 text-right font-bold">₦{d.val.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom 2 Cards: Top products & Sales by rep */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="font-extrabold text-[#12264A] text-sm">Top products</h3>
            <p className="text-[11px] text-slate-400">Best sellers by value in this period.</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px]">
                <th className="py-2 w-8">#</th>
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Quantity</th>
                <th className="py-2 text-right">Value (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((tp, idx) => (
                <tr key={tp.itemNo}>
                  <td className="py-2.5 text-slate-400">{idx + 1}</td>
                  <td className="py-2.5">
                    <span className="font-mono text-slate-400 mr-1.5">{tp.itemNo}</span>
                    <strong className="text-[#12264A]">{tp.name}</strong>
                  </td>
                  <td className="py-2.5 text-right text-slate-600">
                    {tp.qty} {tp.unit}
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#12264A] tabular-nums">
                    {tp.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="font-extrabold text-[#12264A] text-sm">Sales by rep</h3>
            <p className="text-[11px] text-slate-400">Who sold how much in this period.</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px]">
                <th className="py-2">Sales rep</th>
                <th className="py-2 text-right">Sales</th>
                <th className="py-2 text-right">Value (₦)</th>
                <th className="py-2 pl-4">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesByRep.map((rep) => {
                const pct =
                  totalSalesVal > 0 ? Math.round((rep.value / totalSalesVal) * 100) : 100;
                return (
                  <tr key={rep.rep}>
                    <td className="py-2.5 font-bold text-[#12264A]">{rep.rep}</td>
                    <td className="py-2.5 text-right tabular-nums">{rep.count}</td>
                    <td className="py-2.5 text-right font-bold tabular-nums">
                      {rep.value.toLocaleString()}
                    </td>
                    <td className="py-2.5 pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{pct}%</span>
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-[#1D63ED] rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="font-extrabold text-[#12264A]">
                <td className="py-2.5">Total</td>
                <td className="py-2.5 text-right tabular-nums">{numSales}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {totalSalesVal.toLocaleString()}
                </td>
                <td className="py-2.5"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE 14 — SETTINGS > USERS & ROLES VIEW
   ============================================================================ */
export function UsersRolesView({
  users,
  onSaveUser,
  onDeleteUser,
}: {
  users: BuilderUserRecord[];
  onSaveUser: (user: BuilderUserRecord) => void;
  onDeleteUser: (id: string) => void;
}) {
  const [subTab, setSubTab] = useState<"Users" | "Roles">("Users");
  const [editingUser, setEditingUser] = useState<BuilderUserRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<BuilderUserRecord["role"]>("Sales Rep");
  const [status, setStatus] = useState<"Active" | "Suspended">("Active");

  const openAddModal = () => {
    setEditingUser(null);
    setName("");
    setUsername("");
    setPhone("");
    setRole("Sales Rep");
    setStatus("Active");
    setModalOpen(true);
  };

  const openEditModal = (u: BuilderUserRecord) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setPhone(u.phone === "—" ? "" : u.phone);
    setRole(u.role);
    setStatus(u.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;
    const fmtUsername = username.startsWith("@") ? username.trim() : `@${username.trim()}`;
    onSaveUser({
      id: editingUser?.id || `bu_${Date.now()}`,
      name: name.trim(),
      username: fmtUsername,
      phone: phone.trim() || "—",
      role,
      status,
      lastSignIn: editingUser?.lastSignIn || "Never",
      isCurrentUser: editingUser?.isCurrentUser,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">
            Users &amp; Roles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Who can sign in, and what each role is allowed to do.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add user</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-lg bg-slate-200/75 p-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setSubTab("Users")}
          className={`px-3.5 py-1.5 rounded-md transition-colors ${
            subTab === "Users" ? "bg-white text-[#1D63ED] shadow-2xs" : "text-slate-600"
          }`}
        >
          Users
        </button>
        <button
          type="button"
          onClick={() => setSubTab("Roles")}
          className={`px-3.5 py-1.5 rounded-md transition-colors ${
            subTab === "Roles" ? "bg-white text-[#1D63ED] shadow-2xs" : "text-slate-600"
          }`}
        >
          Roles
        </button>
      </div>

      {subTab === "Users" ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1D63ED] text-white font-bold text-[11px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last sign-in</th>
                  <th className="py-3 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-[#12264A]">
                      {u.name}{" "}
                      {u.isCurrentUser && (
                        <span className="font-normal text-slate-400">(you)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{u.username}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      {u.role === "Owner" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1D63ED] text-white font-bold text-[10px]">
                          <Shield className="w-2.5 h-2.5" />
                          <span>Owner</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D63ED] font-bold text-[10px]">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.lastSignIn}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="text-[#1D63ED] hover:underline font-bold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              role: "Owner",
              desc: "Full access to sales book, stock sheets, debtors, reports, users, business settings and backups.",
              perms: ["Record & edit sales", "Manage stock & prices", "Receive debtor payments", "View all reports", "Manage users & settings"],
            },
            {
              role: "Sales Rep",
              desc: "Can record daily cash & credit sales, add customers, log shop expenses and view stock availability.",
              perms: ["Create cash & credit sales", "View daily sales book", "Add customers & receive payments", "Record daily shop expenses"],
            },
            {
              role: "Storekeeper",
              desc: "Manages yard stock sheets, records supplier stock-in deliveries and physical stock counts.",
              perms: ["Record Stock In waybills", "Update daily Stock Sheet", "Record physical stock count"],
            },
          ].map((r) => (
            <div key={r.role} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#1D63ED] font-extrabold text-xs">
                {r.role}
              </span>
              <p className="text-slate-600 leading-relaxed">{r.desc}</p>
              <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                {r.perms.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#12264A]">
                {editingUser ? `Edit ${editingUser.name}` : "Add user"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#12264A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-[#12264A] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#12264A] mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#12264A] mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as BuilderUserRecord["role"])}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales Rep">Sales Rep</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Storekeeper">Storekeeper</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#12264A] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {editingUser && !editingUser.isCurrentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUser(editingUser.id);
                    setModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold"
                >
                  Delete user
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1D63ED] text-white font-bold"
                >
                  Save user
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   IMAGE 15 — SETTINGS > BUSINESS SETTINGS VIEW
   ============================================================================ */
export function BusinessSettingsView({
  settings,
  onUpdateSettings,
  onDownloadBackup,
  showToast,
}: {
  settings: BuilderBusinessSettings;
  onUpdateSettings: (next: BuilderBusinessSettings) => void;
  onDownloadBackup: () => void;
  showToast: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<BuilderBusinessSettings>(settings);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<"POS terminal" | "Bank transfer">("POS terminal");
  const [newAccNum, setNewAccNum] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...draft, logoUrl: String(reader.result || "/logos/builders-logo.png") };
      setDraft(next);
      onUpdateSettings(next);
      showToast("Business logo updated!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your business details, receipts, numbering, payment accounts and backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Business info & Payment accounts */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: Business Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="font-extrabold text-[#12264A] text-sm">Business information</h2>
              <p className="text-[11px] text-slate-400">
                This appears on receipts, invoices and reports.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Business Logo Column */}
              <div className="w-28 shrink-0 space-y-2 text-center">
                <p className="text-[11px] font-bold text-[#12264A] text-left">Business logo</p>
                <div className="w-28 h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 overflow-hidden">
                  {draft.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.logoUrl}
                      alt="Business Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">No logo</span>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-1.5 px-2 rounded-lg border border-[#95B6F7] text-[#1D63ED] font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-blue-50"
                >
                  <Upload className="w-3 h-3" />
                  <span>Change logo</span>
                </button>
                <p className="text-[9px] text-slate-400 leading-tight text-left">
                  PNG, JPG or WebP, up to 2 MB. Square or wide works best.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...draft, logoUrl: "" };
                    setDraft(next);
                    onUpdateSettings(next);
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  Remove logo
                </button>
              </div>

              {/* Business Form Fields */}
              <div className="flex-1 w-full space-y-3.5">
                <div>
                  <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={draft.businessName}
                    onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                      RC number
                    </label>
                    <input
                      type="text"
                      value={draft.rcNumber}
                      onChange={(e) => setDraft({ ...draft, rcNumber: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Printed below the logo, e.g. RC: 8863574
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={draft.tagline}
                      onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      e.g. Building A Solid Foundation...
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                    Deals in
                  </label>
                  <textarea
                    rows={2}
                    value={draft.dealsIn}
                    onChange={(e) => setDraft({ ...draft, dealsIn: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    The list at the top of the invoice header.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                    Business address
                  </label>
                  <textarea
                    rows={2}
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                      Phone number(s)
                    </label>
                    <input
                      type="text"
                      value={draft.phones}
                      onChange={(e) => setDraft({ ...draft, phones: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Receipts and Invoices Section */}
            <div className="pt-4 border-t border-slate-200 space-y-3.5">
              <h3 className="font-extrabold text-[#12264A] text-xs">Receipts and invoices</h3>

              <div>
                <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                  Invoice terms
                </label>
                <textarea
                  rows={2}
                  value={draft.invoiceTerms}
                  onChange={(e) => setDraft({ ...draft, invoiceTerms: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Printed at the bottom of the A4 invoice.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                  Receipt footer
                </label>
                <textarea
                  rows={2}
                  value={draft.receiptFooter}
                  onChange={(e) => setDraft({ ...draft, receiptFooter: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Printed at the bottom of the 80mm receipt, e.g. Thank you for your patronage!
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                  Top bar message
                </label>
                <textarea
                  rows={2}
                  value={draft.topBarMessage}
                  onChange={(e) => setDraft({ ...draft, topBarMessage: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-800"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Scrolls across the top of every page for your staff, e.g. Cement price goes up on
                  Monday. Leave empty to show your tagline and what you deal in.
                </p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={draft.allowNegativeStock}
                  onChange={(e) =>
                    setDraft({ ...draft, allowNegativeStock: e.target.checked })
                  }
                  className="w-3.5 h-3.5 mt-0.5 rounded accent-[#1D63ED]"
                />
                <div>
                  <span className="font-bold text-[#12264A] block">
                    Allow selling more than the stock shows
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Leave off unless goods often arrive before they&apos;re entered. Stock can then
                    go below zero.
                  </span>
                </div>
              </label>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(draft);
                    showToast("Business details saved!");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Save business details
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Accounts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="font-extrabold text-[#12264A] text-sm">Payment accounts</h2>
              <p className="text-[11px] text-slate-400">
                Where POS and transfer money lands. Turned-off accounts stay on old records.
              </p>
            </div>

            <div className="space-y-2">
              {draft.paymentAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#12264A]">{acc.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          acc.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {acc.active ? "Active" : "Off"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {acc.type} {acc.accountNumber ? `· ${acc.accountNumber}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = {
                        ...draft,
                        paymentAccounts: draft.paymentAccounts.map((a) =>
                          a.id === acc.id ? { ...a, active: !a.active } : a
                        ),
                      };
                      setDraft(next);
                      onUpdateSettings(next);
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900"
                  >
                    {acc.active ? "Turn off" : "Turn on"}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-3">
              <div>
                <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                  Account name
                </label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Opay POS, GTBank"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">e.g. Opay POS, GTBank</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#12264A] text-[11px] mb-1">Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="POS terminal">POS terminal</option>
                    <option value="Bank transfer">Bank transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#12264A] text-[11px] mb-1">
                    Account number (optional)
                  </label>
                  <input
                    type="text"
                    value={newAccNum}
                    onChange={(e) => setNewAccNum(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100/80"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newAccName.trim()) return;
                  const next = {
                    ...draft,
                    paymentAccounts: [
                      ...draft.paymentAccounts,
                      {
                        id: `pa_${Date.now()}`,
                        name: newAccName.trim(),
                        type: newAccType,
                        accountNumber: newAccNum.trim(),
                        active: true,
                      },
                    ],
                  };
                  setDraft(next);
                  onUpdateSettings(next);
                  setNewAccName("");
                  setNewAccNum("");
                  showToast("Payment account added!");
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700"
              >
                + Add account
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Backup, Numbering & Expense Categories */}
        <div className="lg:col-span-4 space-y-5">
          {/* Backup Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div>
              <h2 className="font-extrabold text-[#12264A] text-sm">Backup</h2>
              <p className="text-[11px] text-slate-400">
                A copy of all your data to keep somewhere safe.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-400">Last backup</p>
              <p
                className={`font-extrabold text-xs mt-0.5 ${
                  settings.lastBackup === "Never" ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {settings.lastBackup}
              </p>
            </div>

            <button
              type="button"
              onClick={onDownloadBackup}
              className="w-full h-9 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download backup now</span>
            </button>

            <div className="p-2.5 rounded-lg bg-[#EEF4FF] text-[#15357A] text-[10px] flex items-start gap-2 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-[#1D63ED] shrink-0 mt-0.5" />
              <span>
                Includes every sale, payment, stock record, customer, expense and setting. Keep it
                off this phone too: email it to yourself or save it to Google Drive. Do this at
                least once a week.
              </span>
            </div>
          </div>

          {/* Numbering Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div>
              <h2 className="font-extrabold text-[#12264A] text-sm">Numbering</h2>
              <p className="text-[11px] text-slate-400">
                The prefix and next number for each kind of document.
              </p>
            </div>

            {[
              {
                label: "Invoice / receipt",
                prefixKey: "invoicePrefix" as const,
                nextKey: "invoiceNext" as const,
                pad: 6,
              },
              {
                label: "Old debt (from paper book)",
                prefixKey: "oldDebtPrefix" as const,
                nextKey: "oldDebtNext" as const,
                pad: 5,
              },
              {
                label: "Payment receipt",
                prefixKey: "paymentPrefix" as const,
                nextKey: "paymentNext" as const,
                pad: 6,
              },
              {
                label: "Stock sheet",
                prefixKey: "stockSheetPrefix" as const,
                nextKey: "stockSheetNext" as const,
                pad: 5,
              },
            ].map((doc) => {
              const prefix = draft.numbering[doc.prefixKey];
              const nextVal = draft.numbering[doc.nextKey];
              const formattedNext = `${prefix}${String(nextVal).padStart(doc.pad, "0")}`;

              return (
                <div
                  key={doc.label}
                  className="p-3.5 rounded-xl border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#12264A] text-[11px]">{doc.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Next: <strong className="text-[#12264A]">{formattedNext}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-0.5">Prefix</label>
                      <div className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-between text-slate-600 font-mono text-[11px]">
                        <span>{prefix}</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-0.5">Next number</label>
                      <input
                        type="number"
                        value={nextVal}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            numbering: {
                              ...draft.numbering,
                              [doc.nextKey]: Number(e.target.value) || 1,
                            },
                          })
                        }
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-100/80 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 leading-normal">
                    The prefix is locked because numbers have been issued. The next number can only
                    go up, e.g. to carry on from the paper booklet.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings(draft);
                      showToast(`Saved ${doc.label} numbering!`);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-[10px] text-slate-700"
                  >
                    Save
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expense Categories Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div>
              <h2 className="font-extrabold text-[#12264A] text-sm">Expense categories</h2>
              <p className="text-[11px] text-slate-400">The choices on the Expenses page.</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {draft.expenseCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const next = {
                      ...draft,
                      expenseCategories: draft.expenseCategories.filter((c) => c !== cat),
                    };
                    setDraft(next);
                    onUpdateSettings(next);
                  }}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-slate-700"
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400">
              Tap a category to turn it off or on. Old expenses keep theirs.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block font-bold text-[#12264A] text-[10px]">New category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-100/80"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCategory.trim()) return;
                  const next = {
                    ...draft,
                    expenseCategories: [...draft.expenseCategories, newCategory.trim()],
                  };
                  setDraft(next);
                  onUpdateSettings(next);
                  setNewCategory("");
                  showToast("Expense category added!");
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-[11px] text-slate-700"
              >
                + Add category
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SETTINGS > AUDIT LOG VIEW (3rd Subpage under Settings)
   ============================================================================ */
export function AuditLogView({ logs }: { logs: BuilderAuditEntry[] }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
    user: "All",
    action: "All",
  });

  const users = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.actor) set.add(l.actor);
    });
    return Array.from(set).sort();
  }, [logs]);

  const actions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [logs]);

  const handleApply = () => {
    setAppliedFilters({
      fromDate,
      toDate,
      user: selectedUser,
      action: selectedAction,
    });
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedUser("All");
    setSelectedAction("All");
    setSearch("");
    setCatFilter("All");
    setAppliedFilters({
      fromDate: "",
      toDate: "",
      user: "All",
      action: "All",
    });
  };

  const parseLogIsoDate = (ts: string): string | null => {
    if (!ts) return null;
    const match = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const [, d, m, y] = match;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const isoMatch = ts.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0];
    return null;
  };

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      // Date filters
      const logIso = parseLogIsoDate(l.timestamp);
      if (appliedFilters.fromDate && logIso && logIso < appliedFilters.fromDate) {
        return false;
      }
      if (appliedFilters.toDate && logIso && logIso > appliedFilters.toDate) {
        return false;
      }

      // User filter
      if (appliedFilters.user !== "All" && l.actor !== appliedFilters.user) {
        return false;
      }

      // Action filter
      if (appliedFilters.action !== "All" && l.action !== appliedFilters.action) {
        return false;
      }

      // Category filter
      if (catFilter !== "All" && l.category !== catFilter) {
        return false;
      }

      // Search query
      if (
        search.trim() &&
        !l.action.toLowerCase().includes(search.toLowerCase()) &&
        !l.actor.toLowerCase().includes(search.toLowerCase()) &&
        !l.details.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [logs, appliedFilters, catFilter, search]);

  const hasActiveFilters =
    !!appliedFilters.fromDate ||
    !!appliedFilters.toDate ||
    appliedFilters.user !== "All" ||
    appliedFilters.action !== "All" ||
    catFilter !== "All" ||
    !!search.trim();

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-[#12264A] tracking-tight">Audit Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Every sign-in, sale, stock sheet movement, debt payment and setting change.
        </p>
      </div>

      {/* Top Filter Bar (Matching Uploaded Image) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* From date */}
          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-[#1D63ED] focus:bg-white transition-colors"
            />
          </div>

          {/* To date */}
          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-[#1D63ED] focus:bg-white transition-colors"
            />
          </div>

          {/* User */}
          <div className="lg:col-span-2 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-[#1D63ED] focus:bg-white transition-colors truncate"
            >
              <option value="All">All users</option>
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="lg:col-span-2 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-[#1D63ED] focus:bg-white transition-colors truncate"
            >
              <option value="All">All actions</option>
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Apply & Reset Buttons */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 h-9 px-3 rounded-lg bg-[#1D63ED] hover:bg-blue-600 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-3 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-xs transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Search & Category Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search details or keywords..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1D63ED]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 text-xs focus:outline-none focus:border-[#1D63ED]"
          >
            <option value="All">All categories</option>
            <option value="Sale">Sales</option>
            <option value="Stock">Stock</option>
            <option value="Debtor">Debtors</option>
            <option value="Expense">Expenses</option>
            <option value="Settings">Settings</option>
            <option value="Auth">Sign-ins</option>
          </select>

          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            Showing <strong>{filtered.length}</strong> of {logs.length}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#1D63ED] text-white font-bold text-[11px]">
              <th className="py-3 px-4">Date &amp; Time</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 space-y-2">
                  <p className="font-semibold">No audit logs found matching your filters.</p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[#1D63ED] hover:underline font-bold text-xs"
                    >
                      Clear all filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#12264A]">{log.actor}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D63ED] font-bold text-[10px]">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.action}</td>
                  <td className="py-3 px-4 text-slate-500">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
