"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  ArrowLeft,
  Search,
  Download,
  Send,
  Eye,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  client: string;
  amountKobo: number;
  issueDate: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "OVERDUE" | "PARTIAL";
}

const INVOICES: InvoiceRow[] = [
  { id: "inv1", invoiceNo: "INV-000084", client: "Prime Technologies PLC", amountKobo: 145000000, issueDate: "18 Nov 2026", dueDate: "25 Nov 2026", status: "PAID" },
  { id: "inv2", invoiceNo: "INV-000085", client: "Apex Logistics Nigeria", amountKobo: 85000000, issueDate: "19 Nov 2026", dueDate: "26 Nov 2026", status: "UNPAID" },
  { id: "inv3", invoiceNo: "INV-000086", client: "Zenith Global Partners", amountKobo: 220000000, issueDate: "15 Nov 2026", dueDate: "22 Nov 2026", status: "PAID" },
  { id: "inv4", invoiceNo: "INV-000087", client: "Konga Logistics Hub", amountKobo: 64000000, issueDate: "10 Nov 2026", dueDate: "17 Nov 2026", status: "OVERDUE" },
];

export default function BillstacksInvoicesPage() {
  const [invoices] = useState<InvoiceRow[]>(INVOICES);
  const [search, setSearch] = useState("");

  const filtered = invoices.filter(
    (i) =>
      i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      i.client.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl font-bold text-heading">Client Invoices Management</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            B2B invoices, payment links, auto-reminders, and revenue collection ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Create Invoice dialog opened")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Invoice</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-billstacks"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Invoice #</th>
                <th className="py-2.5">Client / Organization</th>
                <th className="py-2.5">Issue Date</th>
                <th className="py-2.5">Due Date</th>
                <th className="py-2.5 text-right">Amount (₦)</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{inv.invoiceNo}</td>
                  <td className="py-3 font-semibold text-heading">{inv.client}</td>
                  <td className="py-3 text-muted">{inv.issueDate}</td>
                  <td className="py-3 text-muted">{inv.dueDate}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(inv.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={inv.status} size="sm" />
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => alert(`Sending payment reminder for ${inv.invoiceNo}`)}
                        className="p-1.5 rounded-lg text-muted hover:text-billstacks hover:bg-gray-100"
                        title="Send Reminder Email"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-gray-100"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
