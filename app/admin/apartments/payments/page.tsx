"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Printer,
  Download,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

interface PaymentRow {
  id: string;
  ref: string;
  guest: string;
  room: string;
  amountKobo: number;
  gateway: "PAYSTACK" | "FLUTTERWAVE" | "BANK_TRANSFER" | "POS";
  status: "PAID" | "PENDING" | "REFUNDED";
  date: string;
}

const PAYMENTS: PaymentRow[] = [
  { id: "p1", ref: "APT-PAY-98120", guest: "Adaeze Okafor", room: "RM-201 (Deluxe)", amountKobo: 9900000, gateway: "PAYSTACK", status: "PAID", date: "19 Nov 2026, 14:22" },
  { id: "p2", ref: "APT-PAY-98119", guest: "Engr. Tunde Bakare", room: "RM-101 (Classic)", amountKobo: 4400000, gateway: "BANK_TRANSFER", status: "PAID", date: "18 Nov 2026, 11:05" },
  { id: "p3", ref: "APT-PAY-98118", guest: "Chief Okonkwo", room: "RM-301 (2BR)", amountKobo: 38500000, gateway: "PAYSTACK", status: "PAID", date: "17 Nov 2026, 09:30" },
  { id: "p4", ref: "APT-PAY-98117", guest: "Dr. Babatunde Alabi", room: "RM-102 (Classic)", amountKobo: 1100000, gateway: "POS", status: "PAID", date: "10 Nov 2026, 17:40" },
];

export default function ApartmentPaymentsPage() {
  const [payments] = useState<PaymentRow[]>(PAYMENTS);
  const [search, setSearch] = useState("");

  const filtered = payments.filter(
    (p) =>
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.guest.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollectedKobo = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountKobo, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/apartments" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Apartments Online Payments</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Verified guest reservations, Paystack payment webhooks, caution fees and room receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-heading text-xs font-bold shadow-2xs hover:bg-gray-50"
        >
          <Printer className="w-4 h-4 text-muted" />
          <span>Print Statement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted font-medium">Total Booking Revenue (MTD)</p>
          <h3 className="text-2xl font-black text-heading mt-1">
            {formatCurrency(totalCollectedKobo)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% verified via Paystack &amp; Bank</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted font-medium">VAT &amp; Tourism Tax (10%)</p>
          <h3 className="text-2xl font-black text-heading mt-1">
            {formatCurrency(Math.round(totalCollectedKobo * 0.1))}
          </h3>
          <p className="text-[11px] text-muted mt-1">Remitted to Lagos State LIRS</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted font-medium">Caution Deposits Held</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">₦200,000</h3>
          <p className="text-[11px] text-muted mt-1">Refundable upon checkout inspection</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payment reference or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-apartment"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Reference #</th>
                <th className="py-2.5">Guest Name</th>
                <th className="py-2.5">Suite / Room</th>
                <th className="py-2.5">Gateway</th>
                <th className="py-2.5 text-right">Amount (₦)</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-apartment">{p.ref}</td>
                  <td className="py-3 font-medium text-heading">{p.guest}</td>
                  <td className="py-3 text-muted">{p.room}</td>
                  <td className="py-3 font-semibold text-heading">{p.gateway}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-3 text-muted">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
