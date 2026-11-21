"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Truck, Plus, ArrowLeft, Search, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

interface PurchaseOrder {
  id: string;
  poNo: string;
  vendor: string;
  itemsSummary: string;
  amountKobo: number;
  deliveryDate: string;
  status: "PAID" | "PENDING" | "RECEIVED";
}

const ORDERS: PurchaseOrder[] = [
  { id: "po1", poNo: "PO-2026-081", vendor: "Dangote Cement PLC", itemsSummary: "1,200 Bags Grade 42.5R Cement", amountKobo: 960000000, deliveryDate: "24 Nov 2026", status: "PENDING" },
  { id: "po2", poNo: "PO-2026-080", vendor: "Schneider Electric West Africa", itemsSummary: "48x 3-Phase Smart Circuit Breakers", amountKobo: 340000000, deliveryDate: "21 Nov 2026", status: "RECEIVED" },
];

export default function BillstacksPurchaseOrdersPage() {
  const { recordTransaction } = usePlatformStore();
  const [orders, setOrders] = useState<PurchaseOrder[]>(ORDERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newPo, setNewPo] = useState({
    vendor: "",
    itemsSummary: "",
    amountNaira: "",
    deliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPo.vendor.trim() || !newPo.itemsSummary.trim() || !newPo.amountNaira.trim()) return;

    const amountKobo = Math.round(Number(newPo.amountNaira) * 100);
    const poNo = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const created: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNo,
      vendor: newPo.vendor.trim(),
      itemsSummary: newPo.itemsSummary.trim(),
      amountKobo,
      deliveryDate: newPo.deliveryDate,
      status: "PENDING",
    };

    setOrders([created, ...orders]);

    recordTransaction({
      source: ServiceSlug.BILLSTACKS,
      activityType: "ORDER",
      activitySummary: `Procurement PO ${poNo} issued to ${created.vendor} for ${created.itemsSummary}`,
      invoiceNo: poNo,
      customer: created.vendor,
      amountKobo,
      location: "Central Group Procurement",
      status: "PENDING",
    });

    setModalOpen(false);
    setNewPo({
      vendor: "",
      itemsSummary: "",
      amountNaira: "",
      deliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    });
    showToast(`Purchase Order ${poNo} created and logged to procurement schedule.`);
  };

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
            <h1 className="text-2xl font-bold text-heading">Supplier Purchase Orders</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Procurement orders sent to suppliers across all group subsidiaries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Purchase Order</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">PO #</th>
                <th className="py-2.5">Vendor / Supplier</th>
                <th className="py-2.5">Items Summary</th>
                <th className="py-2.5">Expected Delivery</th>
                <th className="py-2.5 text-right">Order Total (₦)</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{po.poNo}</td>
                  <td className="py-3 font-semibold text-heading">{po.vendor}</td>
                  <td className="py-3 text-muted">{po.itemsSummary}</td>
                  <td className="py-3 text-muted">{po.deliveryDate}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(po.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={po.status} size="sm" />
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
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">New Purchase Order</h3>
                  <p className="text-xs text-gray-500">Issue official supply request to vendor</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Vendor / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dangote Cement PLC"
                  value={newPo.vendor}
                  onChange={(e) => setNewPo({ ...newPo, vendor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Items / Materials Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Bags 42.5R Portland Cement"
                  value={newPo.itemsSummary}
                  onChange={(e) => setNewPo({ ...newPo, itemsSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    PO Value (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4200000"
                    value={newPo.amountNaira}
                    onChange={(e) => setNewPo({ ...newPo, amountNaira: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    required
                    value={newPo.deliveryDate}
                    onChange={(e) => setNewPo({ ...newPo, deliveryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
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
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
