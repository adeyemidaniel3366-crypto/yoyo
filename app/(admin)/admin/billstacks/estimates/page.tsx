"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Plus, ArrowLeft, Search, Check, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { NumberInput } from "@/components/ui/number-input";

interface EstimateRow {
  id: string;
  estimateNo: string;
  client: string;
  amountKobo: number;
  validUntil: string;
  status: "ACCEPTED" | "PENDING" | "DECLINED";
}

const ESTIMATES: EstimateRow[] = [];

export default function BillstacksEstimatesPage() {
  const { recordTransaction } = usePlatformStore();
  const [estimates, setEstimates] = useState<EstimateRow[]>(ESTIMATES);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newEst, setNewEst] = useState({
    client: "",
    amountNaira: "",
    validDays: "14",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEst.client.trim() || !newEst.amountNaira.trim()) return;

    const amountKobo = Math.round(Number(newEst.amountNaira) * 100);
    const estimateNo = `EST-${Math.floor(10000 + Math.random() * 90000)}`;
    const validDate = new Date(Date.now() + Number(newEst.validDays) * 86400000).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const created: EstimateRow = {
      id: `est_${Date.now()}`,
      estimateNo,
      client: newEst.client.trim(),
      amountKobo,
      validUntil: validDate,
      status: "PENDING",
    };

    setEstimates([created, ...estimates]);
    setModalOpen(false);
    setNewEst({ client: "", amountNaira: "", validDays: "14", notes: "" });
    showToast(`Estimate ${estimateNo} created for ${created.client}`);
  };

  const handleConvertToInvoice = (est: EstimateRow) => {
    const invNo = `INV-${est.estimateNo.replace("EST-", "")}`;
    setEstimates(
      estimates.map((item) => (item.id === est.id ? { ...item, status: "ACCEPTED" } : item))
    );

    recordTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "INVOICE",
      activitySummary: `Converted from quote ${est.estimateNo} for ${est.client}`,
      invoiceNo: invNo,
      customer: est.client,
      amountKobo: est.amountKobo,
      location: "Billstacks Cloud HQ",
      status: "UNPAID",
    });

    showToast(`Converted ${est.estimateNo} into active Invoice ${invNo}! Synced to Executive Dashboard.`);
  };

  const filtered = estimates.filter(
    (e) =>
      e.estimateNo.toLowerCase().includes(search.toLowerCase()) ||
      e.client.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-heading">Quotations &amp; Estimates</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Create, send, and convert price quotes into live invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Estimate</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search estimate # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-billstacks"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Estimate #</th>
                <th className="py-2.5">Client</th>
                <th className="py-2.5">Valid Until</th>
                <th className="py-2.5 text-right">Quote Value</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((est) => (
                <tr key={est.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{est.estimateNo}</td>
                  <td className="py-3 font-semibold text-heading">{est.client}</td>
                  <td className="py-3 text-muted">{est.validUntil}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(est.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        est.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : est.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {est.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {est.status !== "ACCEPTED" ? (
                      <button
                        type="button"
                        onClick={() => handleConvertToInvoice(est)}
                        className="px-3 py-1 rounded-lg border border-border text-xs font-semibold text-billstacks hover:bg-billstacks/10 transition-colors"
                      >
                        Convert to Invoice
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Invoiced
                      </span>
                    )}
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
                <div className="w-10 h-10 rounded-2xl bg-billstacks/10 flex items-center justify-center text-billstacks">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">New Price Estimate</h3>
                  <p className="text-xs text-gray-500">Draft a formal quotation for client approval</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEstimate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client / Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Bank Corporate"
                  value={newEst.client}
                  onChange={(e) => setNewEst({ ...newEst, client: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quote Amount (₦) *
                  </label>
                  <NumberInput
                    required
                    min={1}
                    placeholder="e.g. 1,850,000"
                    prefix="₦"
                    value={newEst.amountNaira}
                    onChange={(v) => setNewEst({ ...newEst, amountNaira: v === "" ? "" : String(v) })}
                    className="rounded-xl text-xs focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Validity (Days)
                  </label>
                  <select
                    value={newEst.validDays}
                    onChange={(e) => setNewEst({ ...newEst, validDays: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                  >
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Scope / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Invoicing software license & support"
                  value={newEst.notes}
                  onChange={(e) => setNewEst({ ...newEst, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
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
                  Create Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
