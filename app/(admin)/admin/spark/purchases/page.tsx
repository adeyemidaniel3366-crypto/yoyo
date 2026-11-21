"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PackagePlus, Plus, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

interface SparkPurchase {
  id: string;
  poNo: string;
  supplier: string;
  item: string;
  qty: number;
  costKobo: number;
  date: string;
  location: string;
}

const PURCHASES: SparkPurchase[] = [
  { id: "1", poNo: "SPK-PO-1092", supplier: "Samsung Official West Africa", item: "Samsung 990 PRO 4TB NVMe SSD", qty: 20, costKobo: 760000000, date: "18 Nov 2026", location: "Medical Road" },
  { id: "2", poNo: "SPK-PO-1091", supplier: "Apple Authorized Importer", item: "MacBook Pro 16\" M3 Max", qty: 5, costKobo: 2100000000, date: "15 Nov 2026", location: "Medical Road" },
  { id: "3", poNo: "SPK-PO-1090", supplier: "Zealot Direct Shenzhen", item: "Zealot S69M Bluetooth Speaker", qty: 50, costKobo: 425000000, date: "10 Nov 2026", location: "Adepele Shop" },
];

export default function SparkPurchasesPage() {
  const { recordTransaction } = usePlatformStore();
  const [purchases, setPurchases] = useState<SparkPurchase[]>(PURCHASES);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newPo, setNewPo] = useState({
    supplier: "",
    item: "",
    qty: "10",
    costNaira: "",
    location: "Medical Road",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPo.supplier.trim() || !newPo.item.trim() || !newPo.costNaira.trim()) return;

    const costKobo = Math.round(Number(newPo.costNaira) * 100);
    const poNo = `SPK-PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

    const created: SparkPurchase = {
      id: `po_${Date.now()}`,
      poNo,
      supplier: newPo.supplier.trim(),
      item: newPo.item.trim(),
      qty: Number(newPo.qty) || 1,
      costKobo,
      date: today,
      location: newPo.location,
    };

    setPurchases([created, ...purchases]);

    recordTransaction({
      source: ServiceSlug.SPARK,
      activityType: "ORDER",
      activitySummary: `Stock Purchase ${poNo}: ${created.qty}x ${created.item} received at ${created.location}`,
      invoiceNo: poNo,
      customer: created.supplier,
      amountKobo: costKobo,
      location: created.location,
      status: "PAID",
    });

    setModalOpen(false);
    setNewPo({ supplier: "", item: "", qty: "10", costNaira: "", location: "Medical Road" });
    showToast(`Purchase order ${poNo} received and inventory updated at ${created.location}.`);
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
            <h1 className="text-2xl font-bold text-heading">Inventory Supplier Purchases</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Direct stock procurement for Computer Village branches (Medical Road &amp; Adepele).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Receive New Purchase</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">PO #</th>
                <th className="py-2.5">Supplier / Importer</th>
                <th className="py-2.5">Hardware Model</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5">Branch Location</th>
                <th className="py-2.5 text-right">Cost (₦)</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-spark">{p.poNo}</td>
                  <td className="py-3 font-bold text-heading">{p.supplier}</td>
                  <td className="py-3 text-muted">{p.item}</td>
                  <td className="py-3 text-center font-bold text-heading">{p.qty}</td>
                  <td className="py-3 text-muted">{p.location}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.costKobo)}
                  </td>
                  <td className="py-3 text-muted">{p.date}</td>
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
                  <PackagePlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Receive Stock Purchase</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Supplier / Importer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kingston Technology Direct"
                  value={newPo.supplier}
                  onChange={(e) => setNewPo({ ...newPo, supplier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Description / SKU *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kingston KC3000 2TB PCIe 4.0 SSD"
                  value={newPo.item}
                  onChange={(e) => setNewPo({ ...newPo, item: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPo.qty}
                    onChange={(e) => setNewPo({ ...newPo, qty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Cost (₦) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1950000"
                    value={newPo.costNaira}
                    onChange={(e) => setNewPo({ ...newPo, costNaira: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Destination Branch</label>
                <select
                  value={newPo.location}
                  onChange={(e) => setNewPo({ ...newPo, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-spark bg-white text-gray-900"
                >
                  <option value="Medical Road">Zino Spark - Medical Road Branch</option>
                  <option value="Adepele Shop">Zino Spark - Adepele Shop</option>
                  <option value="Main Warehouse">Zino Spark - Central Warehouse</option>
                </select>
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
                  Receive Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
