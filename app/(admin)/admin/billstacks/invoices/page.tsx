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
  X,
  CheckCircle2,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { NumberInput } from "@/components/ui/number-input";

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  client: string;
  amountKobo: number;
  issueDate: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "OVERDUE" | "PARTIAL";
}

const INVOICES: InvoiceRow[] = [];

export default function BillstacksInvoicesPage() {
  const { recordTransaction } = usePlatformStore();
  const [invoices, setInvoices] = useState<InvoiceRow[]>(INVOICES);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newInv, setNewInv] = useState({
    client: "",
    amountNaira: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    description: "Cloud Accounting & Invoicing Services",
    status: "UNPAID" as "PAID" | "UNPAID" | "OVERDUE" | "PARTIAL",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.client.trim() || !newInv.amountNaira.trim()) return;

    const amountKobo = Math.round(Number(newInv.amountNaira) * 100);
    const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const issueDateVal = newInv.issueDate || new Date().toISOString().slice(0, 10);

    const created: InvoiceRow = {
      id: `inv_${Date.now()}`,
      invoiceNo,
      client: newInv.client.trim(),
      amountKobo,
      issueDate: issueDateVal,
      dueDate: newInv.dueDate,
      status: newInv.status,
    };

    setInvoices([created, ...invoices]);

    recordTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "INVOICE",
      activitySummary: `${newInv.description} for ${created.client}`,
      invoiceNo,
      customer: created.client,
      amountKobo,
      location: "Billstacks Cloud HQ",
      status: created.status,
      createdAt: issueDateVal,
    });

    setCreateModalOpen(false);
    setNewInv({
      client: "",
      amountNaira: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      description: "Cloud Accounting & Invoicing Services",
      status: "UNPAID",
    });
    showToast(`Invoice ${invoiceNo} issued to ${created.client} and logged to dashboard.`);
  };

  const handleSendReminder = (inv: InvoiceRow) => {
    showToast(`Payment reminder email dispatched to ${inv.client} for ${inv.invoiceNo}!`);
  };

  const filtered = invoices.filter(
    (i) =>
      i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      i.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
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
            <h1 className="text-2xl font-bold text-heading">Client Invoices Management</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            B2B invoices, payment links, auto-reminders, and revenue collection ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
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
                        onClick={() => handleSendReminder(inv)}
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

      {/* Create Invoice Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-billstacks/10 flex items-center justify-center text-billstacks">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Create New Invoice</h3>
                  <p className="text-xs text-gray-500">Generate B2B invoice with unified platform logging</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dangote Cement PLC"
                  value={newInv.client}
                  onChange={(e) => setNewInv({ ...newInv, client: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Invoice Amount (₦) *
                  </label>
                  <NumberInput
                    required
                    min={1}
                    placeholder="e.g. 750,000"
                    prefix="₦"
                    value={newInv.amountNaira}
                    onChange={(v) => setNewInv({ ...newInv, amountNaira: v === "" ? "" : String(v) })}
                    className="rounded-xl text-xs focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInv.issueDate}
                    onChange={(e) => setNewInv({ ...newInv, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInv.dueDate}
                    onChange={(e) => setNewInv({ ...newInv, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service / Billing Description
                </label>
                <input
                  type="text"
                  value={newInv.description}
                  onChange={(e) => setNewInv({ ...newInv, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Initial Payment Status
                </label>
                <select
                  value={newInv.status}
                  onChange={(e) => setNewInv({ ...newInv, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                >
                  <option value="UNPAID">UNPAID (Pending collection)</option>
                  <option value="PAID">PAID (Instant receipt)</option>
                  <option value="PARTIAL">PARTIAL (Split payment)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold hover:opacity-95 shadow-sm"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
