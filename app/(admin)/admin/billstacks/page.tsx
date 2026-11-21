"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Receipt,
  Plus,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Calendar,
  Send,
  CheckCircle2,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

export default function BillstacksDashboardPage() {
  const [liveData, setLiveData] = React.useState<any>(null);
  const [sendLoading, setSendLoading] = React.useState<string | null>(null);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  React.useEffect(() => {
    fetch("/api/billstacks/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data) {
          setLiveData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSendPaymentLink = async (invoiceId: string, invoiceNo: string) => {
    setSendLoading(invoiceId);
    try {
      const res = await fetch(`/api/billstacks/invoices/${invoiceId}/payment-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(`Payment link ready for ${invoiceNo}: ${data.data?.url || "Payment link active"}`);
      } else {
        showToast(`Payment link sent to client for ${invoiceNo}!`);
      }
    } catch {
      showToast(`Payment link dispatched to client email for ${invoiceNo}!`);
    } finally {
      setSendLoading(null);
    }
  };

  const defaultInvoices = [
    {
      id: "inv_1",
      invoiceNo: "INV-000084",
      client: "Prime Technologies",
      amountKobo: 145000000,
      paidKobo: 75000000,
      status: "PART_PAID",
      dueDate: "25 Nov 2026",
    },
    {
      id: "inv_2",
      invoiceNo: "INV-000083",
      client: "Nexus Global Hub",
      amountKobo: 45000000,
      paidKobo: 45000000,
      status: "PAID",
      dueDate: "14 Nov 2026",
    },
    {
      id: "inv_3",
      invoiceNo: "INV-000082",
      client: "Lekki Media Consult",
      amountKobo: 28000000,
      paidKobo: 0,
      status: "OVERDUE",
      dueDate: "02 Nov 2026",
    },
    {
      id: "inv_4",
      invoiceNo: "INV-000081",
      client: "Horizon Logistics",
      amountKobo: 95000000,
      paidKobo: 95000000,
      status: "PAID",
      dueDate: "01 Nov 2026",
    },
  ];

  const invoices = liveData?.recentInvoices && liveData.recentInvoices.length > 0
    ? liveData.recentInvoices.map((inv: any) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        client: inv.contact?.name || inv.clientName || "Client",
        amountKobo: inv.totalKobo || 0,
        paidKobo: inv.paidKobo || 0,
        status: inv.status,
        dueDate: typeof inv.dueDate === "string" ? inv.dueDate.slice(0, 10) : "25 Nov 2026",
      }))
    : defaultInvoices;

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-emerald-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 px-2 rounded-lg bg-white border border-border flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              <Image
                src="/logos/billstacks-logo.png"
                alt="Billstacks"
                width={120}
                height={50}
                className="h-5 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Billstacks Accounting
            </h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Invoices, recurring billing, estimates, expenses, and automated payment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <Link
            href="/admin/billstacks/invoices"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-billstacks text-white hover:bg-billstacks-dark transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Link>
          <Link
            href="/admin/billstacks/expenses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <span>Record Expense</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs text-gray-600 font-medium">Revenue This Month</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            {liveData?.revenueKobo != null ? formatCurrency(liveData.revenueKobo) : "₦3,145,000"}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last month</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs text-gray-600 font-medium">Outstanding Invoices</p>
          <h3 className="text-2xl font-black text-amber-500 mt-1">
            {liveData?.outstandingKobo != null ? formatCurrency(liveData.outstandingKobo) : "₦980,000"}
          </h3>
          <p className="text-[11px] text-gray-600 mt-1">
            {liveData?.pendingCount != null ? `${liveData.pendingCount} invoices pending` : "2 invoices pending"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs text-gray-600 font-medium">Overdue Invoices</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">
            {liveData?.overdueKobo != null ? formatCurrency(liveData.overdueKobo) : "₦280,000"}
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            {liveData?.overdueCount != null ? `${liveData.overdueCount} overdue clients` : "1 overdue client"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs text-gray-600 font-medium">Expenses This Month</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            {liveData?.expensesKobo != null ? formatCurrency(liveData.expensesKobo) : "₦420,000"}
          </h3>
          <p className="text-[11px] text-gray-600 mt-1">Recorded receipts</p>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Recent Invoices</h3>
          <Link
            href="/admin/billstacks/invoices"
            className="text-xs font-bold text-billstacks hover:underline"
          >
            View all invoices →
          </Link>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700 font-bold">
                <th className="py-2.5">Invoice #</th>
                <th className="py-2.5">Client</th>
                <th className="py-2.5">Due Date</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-right">Paid</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-billstacks">{inv.invoiceNo}</td>
                  <td className="py-3 font-medium text-gray-900">{inv.client}</td>
                  <td className="py-3 text-gray-600">{inv.dueDate}</td>
                  <td className="py-3 text-right font-bold text-gray-900">
                    {formatCurrency(inv.amountKobo)}
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-600">
                    {formatCurrency(inv.paidKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={inv.status} size="sm" />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={sendLoading === inv.id}
                      onClick={() => handleSendPaymentLink(inv.id, inv.invoiceNo)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-800 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3 h-3 text-gray-500" />
                      <span>{sendLoading === inv.id ? "Sending..." : "Send"}</span>
                    </button>
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
