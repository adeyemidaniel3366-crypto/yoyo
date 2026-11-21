"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Printer,
  Calendar,
  Lock,
  ArrowRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

interface DaySaleRecord {
  id: string;
  invoiceNo: string;
  time: string;
  customer: string;
  items: { name: string; qty: number; unit: string; total: number }[];
  total: number;
  paid: number;
  outstanding: number;
  status: string;
  paymentMethod: string;
  remarks?: string;
  signedBy: string;
}

interface DaySheet {
  date: string;
  salesCount: number;
  income: number;
  expenses: number;
  cashReceived: number;
  transferred: number;
  balance: number;
  isClosed: boolean;
  sales: DaySaleRecord[];
}

const DEFAULT_DAYS: DaySheet[] = [
  {
    date: "Wed, 18 Nov 2026",
    salesCount: 1,
    income: 392000,
    expenses: 0,
    cashReceived: 392000,
    transferred: 0,
    balance: 392000,
    isClosed: false,
    sales: [
      {
        id: "s106",
        invoiceNo: "INV-000106",
        time: "10:45 AM",
        customer: "Adewumi Builders",
        items: [{ name: "Dangote Cement 50kg", qty: 40, unit: "bag", total: 392000 }],
        total: 392000,
        paid: 392000,
        outstanding: 0,
        status: "PAID",
        paymentMethod: "CASH",
        remarks: "Delivered to Okokomaiko site",
        signedBy: "Cashier CE",
      },
    ],
  },
  {
    date: "Tue, 17 Nov 2026",
    salesCount: 2,
    income: 480000,
    expenses: 25000,
    cashReceived: 285000,
    transferred: 195000,
    balance: 260000,
    isClosed: true,
    sales: [
      {
        id: "s105",
        invoiceNo: "INV-000105",
        time: "02:15 PM",
        customer: "Chief Okonkwo",
        items: [
          { name: "Iron Rod 16mm", qty: 10, unit: "lgth", total: 215000 },
          { name: "Binding Wire", qty: 15, unit: "kg", total: 24000 },
        ],
        total: 239000,
        paid: 100000,
        outstanding: 139000,
        status: "PART_PAID",
        paymentMethod: "MONIEPOINT_POS",
        remarks: "Balance promised on Friday",
        signedBy: "Cashier CE",
      },
    ],
  },
  {
    date: "Mon, 16 Nov 2026",
    salesCount: 3,
    income: 750000,
    expenses: 12000,
    cashReceived: 500000,
    transferred: 250000,
    balance: 488000,
    isClosed: true,
    sales: [],
  },
];

export default function DailySalesBookPage() {
  const [viewMode, setViewMode] = useState<"cards" | "ledger">("cards");
  const [expandedDay, setExpandedDay] = useState<string | null>("2026-11-18");
  const [dayList, setDayList] = useState<DaySheet[]>(DEFAULT_DAYS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCloseDay = (dateStr: string) => {
    setDayList((prev) =>
      prev.map((d) => (d.date === dateStr ? { ...d, isClosed: true } : d))
    );
    showToast(`Daily sales book for ${dateStr} reconciled and locked.`);
  };

  const toggleDay = (d: string) => {
    setExpandedDay(expandedDay === d ? null : d);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-emerald-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-builders" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Daily Sales Book
            </h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            One page per day, formatted like the traditional physical sales book.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/builders/sales/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-builders text-white text-xs font-bold hover:bg-builders-dark transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {/* Date Range & View Mode Toolbar */}
      <div className="p-4 rounded-xl border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-muted">Showing period:</span>
          <span className="font-bold text-heading">Last 30 Days (Nov 2026)</span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg font-semibold">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "cards" ? "bg-white text-heading shadow-2xs" : "text-muted hover:text-heading"
            }`}
          >
            Cards View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("ledger")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "ledger" ? "bg-white text-heading shadow-2xs" : "text-muted hover:text-heading"
            }`}
          >
            Ledger Table
          </button>
        </div>
      </div>

      {/* Day Cards List */}
      <div className="space-y-4">
        {dayList.map((day) => {
          const isExpanded = expandedDay === day.date;

          return (
            <div
              key={day.date}
              className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden transition-all"
            >
              {/* Day Header Trigger */}
              <div
                onClick={() => toggleDay(day.date)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-heading text-sm">{day.date}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {day.salesCount} {day.salesCount === 1 ? "sale" : "sales"}
                  </span>
                  {day.isClosed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>Closed</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="hidden sm:block text-right">
                    <span className="text-muted">Income: </span>
                    <span className="font-bold text-heading">₦{day.income.toLocaleString()}</span>
                    <span className="text-muted ml-3">Expenses: </span>
                    <span className="font-bold text-rose-600">₦{day.expenses.toLocaleString()}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded Day Details */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-border bg-gray-50/30 space-y-5">
                  {/* Ledger Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-3.5 rounded-xl bg-white border border-border text-xs text-center">
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Cash Received</p>
                      <p className="font-bold text-heading mt-0.5">₦{day.cashReceived.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Transferred</p>
                      <p className="font-bold text-heading mt-0.5">₦{day.transferred.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Total Income</p>
                      <p className="font-bold text-emerald-600 mt-0.5">₦{day.income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Total Expenses</p>
                      <p className="font-bold text-rose-600 mt-0.5">₦{day.expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold">Balance in Drawer</p>
                      <p className="font-bold text-heading mt-0.5">₦{day.balance.toLocaleString()}</p>
                    </div>
                    <div>
                      {!day.isClosed ? (
                        <button
                          type="button"
                          onClick={() => handleCloseDay(day.date)}
                          className="w-full py-1.5 rounded-md bg-active text-white font-bold text-[11px] hover:bg-indigo-700 transition-colors"
                        >
                          Close Day
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold block pt-1">Day Closed</span>
                      )}
                    </div>
                  </div>

                  {/* Individual Sale Records in this day */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-heading uppercase tracking-wider">
                      Sales in this book:
                    </h4>

                    {day.sales.length > 0 ? (
                      day.sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-4 rounded-xl border border-border bg-white shadow-2xs space-y-3 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-builders">{sale.invoiceNo}</span>
                              <span className="text-muted">{sale.time}</span>
                              <span className="font-bold text-heading">{sale.customer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={sale.status} size="sm" />
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-gray-50 text-[11px] font-semibold text-heading transition-colors"
                              >
                                <Printer className="w-3 h-3 text-muted" />
                                <span>Print Receipt</span>
                              </button>
                            </div>
                          </div>

                          {/* Items table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-muted text-[11px] border-b border-border">
                                  <th className="py-1">Description</th>
                                  <th className="py-1 text-center">Qty</th>
                                  <th className="py-1 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items.map((it, idx) => (
                                  <tr key={idx} className="border-b border-border/40">
                                    <td className="py-1.5 font-medium">{it.name}</td>
                                    <td className="py-1.5 text-center">{it.qty} {it.unit}</td>
                                    <td className="py-1.5 text-right font-bold">₦{it.total.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Footer definers */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-muted">
                            <div>
                              <span>Paid: </span>
                              <span className="font-bold text-heading">₦{sale.paid.toLocaleString()}</span>
                            </div>
                            <div>
                              <span>Outstanding: </span>
                              <span className={sale.outstanding > 0 ? "font-bold text-rose-600" : "font-bold text-heading"}>
                                ₦{sale.outstanding.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span>Method: </span>
                              <span className="font-bold text-heading">{sale.paymentMethod}</span>
                            </div>
                            <div>
                              <span>Sign: </span>
                              <span className="font-bold text-heading">{sale.signedBy}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted italic">No individual sales recorded for this date.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
