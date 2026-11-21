"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, ShieldCheck, Tag, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface BrandItem {
  id: string;
  name: string;
  origin: string;
  warrantyPolicy: string;
  productsCount: number;
}

const BRANDS: BrandItem[] = [
  { id: "b1", name: "Samsung Electronics", origin: "South Korea", warrantyPolicy: "2-Year Samsung Global Care", productsCount: 24 },
  { id: "b2", name: "Kingston Technology", origin: "USA", warrantyPolicy: "5-Year Manufacturer Warranty", productsCount: 18 },
  { id: "b3", name: "Lexar", origin: "USA", warrantyPolicy: "3-Year Lexar Limited Warranty", productsCount: 10 },
  { id: "b4", name: "Synology", origin: "Taiwan", warrantyPolicy: "3-Year Enterprise Replacement", productsCount: 5 },
  { id: "b5", name: "JBL by Harman", origin: "USA", warrantyPolicy: "1-Year Harman Warranty", productsCount: 12 },
  { id: "b6", name: "Zealot Audio", origin: "China", warrantyPolicy: "6-Month Fast Replacement", productsCount: 15 },
];

export default function GalaxyBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>(BRANDS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState({
    name: "",
    origin: "",
    warrantyPolicy: "1-Year Official Manufacturer Warranty",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name.trim() || !newBrand.origin.trim()) return;

    const created: BrandItem = {
      id: `br_${Date.now()}`,
      name: newBrand.name.trim(),
      origin: newBrand.origin.trim(),
      warrantyPolicy: newBrand.warrantyPolicy.trim(),
      productsCount: 0,
    };

    setBrands([...brands, created]);
    setModalOpen(false);
    setNewBrand({
      name: "",
      origin: "",
      warrantyPolicy: "1-Year Official Manufacturer Warranty",
    });
    showToast(`Brand partner "${created.name}" registered successfully.`);
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
            <h1 className="text-2xl font-bold text-heading">Authorized Brands &amp; Manufacturers</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Authorized electronics manufacturers, official warranty terms and product distribution partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Brand Partner</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Brand Partner</th>
                <th className="py-2.5">Headquarters</th>
                <th className="py-2.5">Standard Warranty Coverage</th>
                <th className="py-2.5 text-center">Catalog Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{b.name}</td>
                  <td className="py-3 text-muted">{b.origin}</td>
                  <td className="py-3 font-semibold text-heading flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-galaxy" />
                    <span>{b.warrantyPolicy}</span>
                  </td>
                  <td className="py-3 text-center font-bold text-galaxy">{b.productsCount}</td>
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
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Add Brand Partner</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anker Innovations"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Country / HQ Origin *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USA / China"
                  value={newBrand.origin}
                  onChange={(e) => setNewBrand({ ...newBrand, origin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Standard Warranty Terms</label>
                <input
                  type="text"
                  value={newBrand.warrantyPolicy}
                  onChange={(e) => setNewBrand({ ...newBrand, warrantyPolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
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
                  className="px-5 py-2.5 rounded-xl bg-galaxy text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
