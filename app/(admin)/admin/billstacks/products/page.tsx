"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Plus, ArrowLeft, Search, X, CheckCircle2, Trash2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { NumberInput } from "@/components/ui/number-input";

export default function BillstacksProductsPage() {
  const { products: storeProducts, saveProduct, deleteProduct } = usePlatformStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    rateNaira: "",
    billingType: "RECURRING_MONTHLY",
    taxRate: "7.5% VAT",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  const items = React.useMemo(
    () =>
      storeProducts
        .filter((p) => p.source === ServiceSlug.BILLSTACKS)
        .map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          rateKobo: p.priceKobo,
          billingType: p.label || "RECURRING_MONTHLY",
          taxRate: "7.5% VAT",
          createdAt: p.createdAt || "2026-11-20",
        })),
    [storeProducts]
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.rateNaira.trim()) return;

    const rateKobo = Math.round(Number(newItem.rateNaira) * 100);
    const sku = newItem.sku.trim() || `BS-${newItem.name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const saved = saveProduct({
      source: ServiceSlug.BILLSTACKS,
      name: newItem.name.trim(),
      sku,
      label: newItem.billingType,
      description: `${newItem.billingType} (${newItem.taxRate})`,
      priceKobo: rateKobo,
      priceDisplay: `${formatCurrency(rateKobo)} / month`,
      imageUrl: "",
      images: [],
      status: "ACTIVE",
      totalStock: 999,
      lowStockAt: 0,
      createdAt: newItem.createdAt,
    });

    setModalOpen(false);
    setNewItem({
      name: "",
      sku: "",
      rateNaira: "",
      billingType: "RECURRING_MONTHLY",
      taxRate: "7.5% VAT",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    showToast(`Billing service item "${saved.name}" added and synced across platform.`);
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
            <h1 className="text-2xl font-bold text-heading">Billing Products &amp; Services</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Catalog of billable services, retainer subscriptions, and standard invoice line items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Billing Service</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">SKU / Code</th>
                <th className="py-2.5">Service Item Name</th>
                <th className="py-2.5">Billing Type</th>
                <th className="py-2.5">Applicable Tax</th>
                <th className="py-2.5">Date Added</th>
                <th className="py-2.5 text-right">Standard Rate (₦)</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{it.sku}</td>
                  <td className="py-3 font-semibold text-heading">{it.name}</td>
                  <td className="py-3 font-mono text-muted">{it.billingType}</td>
                  <td className="py-3 text-muted">{it.taxRate}</td>
                  <td className="py-3 text-muted font-mono">{it.createdAt}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(it.rateKobo)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        deleteProduct(it.id);
                        showToast(`Removed "${it.name}" from Billstacks catalog.`);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Add Billing Service</h3>
                  <p className="text-xs text-gray-500">Add line-item or subscription plan to catalog</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service / Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dedicated DevOps Retainer"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Standard Rate (₦) *
                  </label>
                  <NumberInput
                    required
                    min={1}
                    placeholder="e.g. 500,000"
                    prefix="₦"
                    value={newItem.rateNaira}
                    onChange={(v) => setNewItem({ ...newItem, rateNaira: v === "" ? "" : String(v) })}
                    className="rounded-xl text-xs focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="Optional (Auto)"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Type</label>
                  <select
                    value={newItem.billingType}
                    onChange={(e) => setNewItem({ ...newItem, billingType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                  >
                    <option value="RECURRING_MONTHLY">Monthly Retainer</option>
                    <option value="RECURRING_ANNUAL">Annual License</option>
                    <option value="ONE_TIME">One-Off Project</option>
                    <option value="PER_HOUR">Hourly Consulting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Rate</label>
                  <select
                    value={newItem.taxRate}
                    onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                  >
                    <option value="7.5% VAT">7.5% Standard VAT</option>
                    <option value="0% EXEMPT">0% Exempt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date Added</label>
                <input
                  type="date"
                  value={newItem.createdAt}
                  onChange={(e) => setNewItem({ ...newItem, createdAt: e.target.value })}
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
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
