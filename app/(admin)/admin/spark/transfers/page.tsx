"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Plus, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { NumberInput } from "@/components/ui/number-input";

interface StockTransfer {
  id: string;
  transferNo: string;
  fromLocation: string;
  toLocation: string;
  item: string;
  qty: number;
  date: string;
  status: "COMPLETED" | "IN_TRANSIT";
}

const TRANSFERS: StockTransfer[] = [];

export default function SparkTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(TRANSFERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newTransfer, setNewTransfer] = useState({
    fromLocation: "Medical Road Shop",
    toLocation: "Adepele Shop",
    item: "",
    qty: "5",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.item.trim()) return;

    const transferNo = `TRF-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

    const created: StockTransfer = {
      id: `trf_${Date.now()}`,
      transferNo,
      fromLocation: newTransfer.fromLocation,
      toLocation: newTransfer.toLocation,
      item: newTransfer.item.trim(),
      qty: Number(newTransfer.qty) || 1,
      date: today,
      status: "COMPLETED",
    };

    setTransfers([created, ...transfers]);
    setModalOpen(false);
    setNewTransfer({
      fromLocation: "Medical Road Shop",
      toLocation: "Adepele Shop",
      item: "",
      qty: "5",
    });
    showToast(`Stock transfer ${transferNo} dispatched from ${created.fromLocation} to ${created.toLocation}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-blue-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/spark" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Spark Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Inter-Branch Stock Transfers</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Shift stock between Computer Village shops (Medical Road, Adepele, Olayeni) and online fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Stock Transfer</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Transfer #</th>
                <th className="py-2.5">Origin (From)</th>
                <th className="py-2.5">Destination (To)</th>
                <th className="py-2.5">Device Model</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-spark">{t.transferNo}</td>
                  <td className="py-3 text-muted">{t.fromLocation}</td>
                  <td className="py-3 font-semibold text-heading">{t.toLocation}</td>
                  <td className="py-3 text-muted">{t.item}</td>
                  <td className="py-3 text-center font-bold text-heading">{t.qty}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-spark/10 text-spark flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Initiate Stock Transfer</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From (Origin)</label>
                  <select
                    value={newTransfer.fromLocation}
                    onChange={(e) => setNewTransfer({ ...newTransfer, fromLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                  >
                    <option value="Medical Road Shop">Medical Road Shop</option>
                    <option value="Adepele Shop">Adepele Shop</option>
                    <option value="Galaxy Warehouse">Galaxy Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">To (Destination)</label>
                  <select
                    value={newTransfer.toLocation}
                    onChange={(e) => setNewTransfer({ ...newTransfer, toLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                  >
                    <option value="Adepele Shop">Adepele Shop</option>
                    <option value="Medical Road Shop">Medical Road Shop</option>
                    <option value="Galaxy Warehouse">Galaxy Warehouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hardware / Device Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung 990 PRO 2TB NVMe"
                  value={newTransfer.item}
                  onChange={(e) => setNewTransfer({ ...newTransfer, item: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity to Transfer</label>
                <NumberInput
                  required
                  min={1}
                  value={newTransfer.qty}
                  onChange={(v) => setNewTransfer({ ...newTransfer, qty: v === "" ? "" : String(v) })}
                  className="rounded-xl focus:border-spark"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-spark text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Transfer Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
