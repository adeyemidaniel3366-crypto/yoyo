"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Plus, ArrowLeft, Search, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface BillstackItem {
  id: string;
  name: string;
  sku: string;
  rateKobo: number;
  billingType: string;
  taxRate: string;
}

const ITEMS: BillstackItem[] = [
  { id: "b1", name: "Enterprise Cloud ERP Retainer", sku: "BS-ERP-MONTHLY", rateKobo: 145000000, billingType: "RECURRING_MONTHLY", taxRate: "7.5% VAT" },
  { id: "b2", name: "Custom API & FinTech Integration", sku: "BS-ENG-HOURLY", rateKobo: 2500000, billingType: "PER_HOUR", taxRate: "7.5% VAT" },
  { id: "b3", name: "Annual Corporate Financial Audit", sku: "BS-AUDIT-ANNUAL", rateKobo: 450000000, billingType: "ONE_TIME", taxRate: "7.5% VAT" },
];

export default function BillstacksProductsPage() {
  const [items, setItems] = useState<BillstackItem[]>(ITEMS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    rateNaira: "",
    billingType: "RECURRING_MONTHLY",
    taxRate: "7.5% VAT",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.rateNaira.trim()) return;

    const rateKobo = Math.round(Number(newItem.rateNaira) * 100);
    const sku = newItem.sku.trim() || `BS-${newItem.name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const created: BillstackItem = {
      id: `it_${Date.now()}`,
      name: newItem.name.trim(),
      sku,
      rateKobo,
      billingType: newItem.billingType,
      taxRate: newItem.taxRate,
    };

    setItems([...items, created]);
    setModalOpen(false);
    setNewItem({
      name: "",
      sku: "",
      rateNaira: "",
      billingType: "RECURRING_MONTHLY",
      taxRate: "7.5% VAT",
    });
    showToast(`Billing service item "${created.name}" added to catalog.`);
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
                <th className="py-2.5 text-right">Standard Rate (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{it.sku}</td>
                  <td className="py-3 font-semibold text-heading">{it.name}</td>
                  <td className="py-3 font-mono text-muted">{it.billingType}</td>
                  <td className="py-3 text-muted">{it.taxRate}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(it.rateKobo)}
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
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500000"
                    value={newItem.rateNaira}
                    onChange={(e) => setNewItem({ ...newItem, rateNaira: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
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
