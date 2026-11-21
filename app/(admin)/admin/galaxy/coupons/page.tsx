"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Plus, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface CouponRow {
  id: string;
  code: string;
  discount: string;
  minSpend: string;
  usedCount: number;
  maxUses: number;
  expiry: string;
  active: boolean;
}

const COUPONS: CouponRow[] = [
  { id: "1", code: "ZINO2026", discount: "10% Discount", minSpend: "₦50,000", usedCount: 18, maxUses: 100, expiry: "31 Dec 2026", active: true },
  { id: "2", code: "WELCOME10", discount: "10% Discount", minSpend: "₦20,000", usedCount: 42, maxUses: 200, expiry: "31 Dec 2026", active: true },
  { id: "3", code: "BLACKFRIDAY", discount: "15% Flash Deal", minSpend: "₦100,000", usedCount: 88, maxUses: 100, expiry: "30 Nov 2026", active: true },
];

export default function GalaxyCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>(COUPONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPct: "10",
    minSpendNaira: "25000",
    maxUses: "100",
    expiry: "31 Dec 2026",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    const code = newCoupon.code.trim().toUpperCase();
    const created: CouponRow = {
      id: `cp_${Date.now()}`,
      code,
      discount: `${newCoupon.discountPct}% Discount`,
      minSpend: `₦${Number(newCoupon.minSpendNaira || 0).toLocaleString()}`,
      usedCount: 0,
      maxUses: Number(newCoupon.maxUses || 100),
      expiry: newCoupon.expiry,
      active: true,
    };

    setCoupons([created, ...coupons]);
    setModalOpen(false);
    setNewCoupon({
      code: "",
      discountPct: "10",
      minSpendNaira: "25000",
      maxUses: "100",
      expiry: "31 Dec 2026",
    });
    showToast(`Coupon voucher code "${created.code}" created and live on storefront!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-rose-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/galaxy" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Galaxy Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Storefront Promotional Coupons</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Create discount coupon codes, flash deal percentage vouchers, and minimum spend limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Coupon Code</th>
                <th className="py-2.5">Discount Benefit</th>
                <th className="py-2.5">Min Spend</th>
                <th className="py-2.5 text-center">Usage Count</th>
                <th className="py-2.5">Expiry Date</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-black text-sm text-galaxy">{c.code}</td>
                  <td className="py-3 font-bold text-heading">{c.discount}</td>
                  <td className="py-3 text-muted">{c.minSpend}</td>
                  <td className="py-3 text-center font-bold text-heading">
                    {c.usedCount} / {c.maxUses}
                  </td>
                  <td className="py-3 text-muted">{c.expiry}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-muted"
                      }`}
                    >
                      {c.active ? "ACTIVE" : "EXPIRED"}
                    </span>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-galaxy/10 text-galaxy flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Create Discount Coupon</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono font-bold focus:outline-none focus:border-galaxy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount (% Off) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="99"
                    value={newCoupon.discountPct}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPct: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Spend (₦)</label>
                  <input
                    type="number"
                    value={newCoupon.minSpendNaira}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minSpendNaira: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={newCoupon.expiry}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
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
                  className="px-5 py-2.5 rounded-xl bg-galaxy text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
