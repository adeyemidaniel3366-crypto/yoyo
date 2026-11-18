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
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/money";

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

export default function TopBuildersDebtorsPage() {
  const [sortBy, setSortBy] = useState<"highest" | "oldest">("highest");
  const [searchTerm, setSearchTerm] = useState("");

  // Exactly 6 Seed Customers totaling ₦834,500
  const debtors: DebtorCustomer[] = [
    {
      id: "deb_4",
      name: "Mama Bose Ventures",
      phone: "08000000104",
      address: "Iba Market, Lane 3",
      initial: "M",
      totalOwedKobo: 28130000,
      oldestInvoiceDate: "13/07/2026",
      daysAgo: 128,
      unpaidCount: 2,
    },
    {
      id: "deb_5",
      name: "Chief Okonkwo",
      phone: "08000000105",
      address: "Lekki Phase 1 (site)",
      initial: "C",
      totalOwedKobo: 19500000,
      oldestInvoiceDate: "15/08/2026",
      daysAgo: 95,
      unpaidCount: 1,
    },
    {
      id: "deb_1",
      name: "Adewumi Builders",
      phone: "08000000101",
      address: "Plot 14, Okokomaiko, Ojo",
      initial: "A",
      totalOwedKobo: 14000000,
      oldestInvoiceDate: "02/09/2026",
      daysAgo: 77,
      unpaidCount: 1,
    },
    {
      id: "deb_2",
      name: "Ibrahim & Sons Construction",
      phone: "08000000102",
      address: "Alaba Rago Road, Ojo",
      initial: "I",
      totalOwedKobo: 12500000,
      oldestInvoiceDate: "20/09/2026",
      daysAgo: 59,
      unpaidCount: 1,
    },
    {
      id: "deb_3",
      name: "Pastor Femi Adebayo",
      phone: "08000000103",
      address: "Christ Grace Church site, Iba",
      initial: "P",
      totalOwedKobo: 7200000,
      oldestInvoiceDate: "12/10/2026",
      daysAgo: 37,
      unpaidCount: 1,
    },
    {
      id: "deb_6",
      name: "Kelechi & Co. Plumbing",
      phone: "08000000106",
      address: "LASU Gate, Ojo",
      initial: "K",
      totalOwedKobo: 2120000,
      oldestInvoiceDate: "28/10/2026",
      daysAgo: 21,
      unpaidCount: 1,
    },
  ];

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-heading tracking-tight">Debtors</h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Customers with unpaid invoices in the Top Builders materials registry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add customer")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-builders text-white text-xs font-bold hover:bg-builders-dark transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="p-5 rounded-xl border border-border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Owed by Debtors</p>
          <h2 className="text-3xl font-black text-rose-600 mt-1">
            ₦834,500 <span className="text-xs font-medium text-muted">owed by 6 customers</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-muted">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortBy("highest")}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === "highest" ? "bg-heading text-white border-heading" : "bg-white text-heading border-border hover:bg-gray-50"
            }`}
          >
            Highest Owed
          </button>
          <button
            type="button"
            onClick={() => setSortBy("oldest")}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === "oldest" ? "bg-heading text-white border-heading" : "bg-white text-heading border-border hover:bg-gray-50"
            }`}
          >
            Oldest Debt
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search debtor name, phone, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-heading placeholder:text-muted focus:outline-none focus:border-builders"
        />
      </div>

      {/* Debtor Cards Grid Matching Exact Spec */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl border border-border p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Initial + Name + Phone */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={d.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-heading text-sm truncate">{d.name}</h4>
                  <p className="text-xs text-muted truncate">{d.phone}</p>
                  <p className="text-[11px] text-muted truncate mt-0.5">{d.address}</p>
                </div>
              </div>

              {/* Stats 3 Columns Box */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-gray-50 border border-border text-center text-xs my-3">
                <div>
                  <p className="text-[10px] text-muted uppercase font-bold">Total Owed</p>
                  <p className="font-black text-rose-600 mt-0.5">
                    {formatCurrency(d.totalOwedKobo)}
                  </p>
                </div>
                <div className="border-x border-border">
                  <p className="text-[10px] text-muted uppercase font-bold">Oldest Inv.</p>
                  <p className="font-bold text-heading mt-0.5">{d.oldestInvoiceDate}</p>
                  <p className="text-[9px] text-rose-600 font-semibold">{d.daysAgo} days ago</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase font-bold">Invoices</p>
                  <p className="font-bold text-heading mt-0.5">{d.unpaidCount} unpaid</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border">
              <a
                href={`tel:${d.phone}`}
                className="inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border bg-white text-heading font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-muted" />
                <span>Call</span>
              </a>
              <button
                type="button"
                onClick={() => alert(`Recording payment for ${d.name}`)}
                className="inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-builders text-white font-bold text-xs hover:bg-builders-dark transition-colors shadow-2xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Receive Payment</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
