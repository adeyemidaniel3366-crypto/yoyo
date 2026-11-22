"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Plus, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { NumberInput } from "@/components/ui/number-input";

interface StockAdjustment {
  id: string;
  item: string;
  location: string;
  type: "DEMO_DISPLAY" | "DAMAGED" | "AUDIT_RECONCILIATION" | "TRANSIT_LOSS";
  qtyChange: number;
  reason: string;
  date: string;
}

const ADJUSTMENTS: StockAdjustment[] = [
  { id: "1", item: "Lexar SL500 Portable SSD 2TB", location: "Medical Road", type: "DEMO_DISPLAY", qtyChange: -1, reason: "Transferred to customer demo testing station", date: "17 Nov 2026" },
  { id: "2", item: "Zealot S69M Bluetooth Speaker", location: "Adepele Shop", type: "DAMAGED", qtyChange: -1, reason: "Factory sound distortion; returned to distributor", date: "14 Nov 2026" },
];

export default function SparkAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(ADJUSTMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newAdj, setNewAdj] = useState({
    item: "",
    location: "Medical Road",
    type: "DEMO_DISPLAY" as "DEMO_DISPLAY" | "DAMAGED" | "AUDIT_RECONCILIATION" | "TRANSIT_LOSS",
    qtyChange: "-1",
    reason: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdj.item.trim() || !newAdj.reason.trim()) return;

    const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
    const created: StockAdjustment = {
      id: `adj_${Date.now()}`,
      item: newAdj.item.trim(),
      location: newAdj.location,
      type: newAdj.type,
      qtyChange: Number(newAdj.qtyChange) || -1,
      reason: newAdj.reason.trim(),
      date: today,
    };

    setAdjustments([created, ...adjustments]);
    setModalOpen(false);
    setNewAdj({
      item: "",
      location: "Medical Road",
      type: "DEMO_DISPLAY",
      qtyChange: "-1",
      reason: "",
    });
    showToast(`Inventory adjustment recorded for ${created.item}.`);
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
            <h1 className="text-2xl font-bold text-heading">Stock Adjustments &amp; Write-Offs</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Log inventory write-offs, floor display demo models, or damaged warranty claims.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Adjustment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Hardware Model</th>
                <th className="py-2.5">Shop Location</th>
                <th className="py-2.5">Adjustment Reason</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5">Explanation</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adjustments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{a.item}</td>
                  <td className="py-3 text-muted">{a.location}</td>
                  <td className="py-3 font-mono font-semibold text-rose-600">{a.type}</td>
                  <td className="py-3 text-center font-black text-rose-600">{a.qtyChange}</td>
                  <td className="py-3 text-muted">{a.reason}</td>
                  <td className="py-3 text-muted">{a.date}</td>
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
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Record Stock Adjustment</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Description / SKU *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung 990 PRO 2TB"
                  value={newAdj.item}
                  onChange={(e) => setNewAdj({ ...newAdj, item: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Branch Location</label>
                  <select
                    value={newAdj.location}
                    onChange={(e) => setNewAdj({ ...newAdj, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                  >
                    <option value="Medical Road">Medical Road</option>
                    <option value="Adepele Shop">Adepele Shop</option>
                    <option value="Galaxy Warehouse">Galaxy Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Adjustment Type</label>
                  <select
                    value={newAdj.type}
                    onChange={(e) => setNewAdj({ ...newAdj, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                  >
                    <option value="DEMO_DISPLAY">Floor Demo Display</option>
                    <option value="DAMAGED">Damaged / Defect</option>
                    <option value="AUDIT_RECONCILIATION">Audit Reconciliation</option>
                    <option value="TRANSIT_LOSS">Transit Loss</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity Offset</label>
                  <NumberInput
                    required
                    allowNegative
                    value={newAdj.qtyChange}
                    onChange={(v) => setNewAdj({ ...newAdj, qtyChange: v === "" ? "" : String(v) })}
                    className="rounded-xl focus:border-spark"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Audit Notes / Reason *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scratched display unit"
                    value={newAdj.reason}
                    onChange={(e) => setNewAdj({ ...newAdj, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                  />
                </div>
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
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
