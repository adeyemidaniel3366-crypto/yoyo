"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Package,
  Sparkles,
  Eye,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { NumberInput } from "@/components/ui/number-input";

export default function NewProductPage() {
  const router = useRouter();
  const { saveProduct } = usePlatformStore();

  const [form, setForm] = useState({
    source: ServiceSlug.GALAXY,
    name: "",
    sku: "",
    label: "",
    description: "",
    priceNgn: 45000,
    costNgn: 32000,
    totalStock: 15,
    lowStockAt: 3,
    imageUrl: "",
    createdAt: new Date().toISOString().slice(0, 10),
    isFeatured: true,
    isNew: true,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) {
      setErrorMsg("Product name and SKU are required.");
      return;
    }
    setErrorMsg(null);

    const priceKobo = Math.round(Number(form.priceNgn) * 100);
    const costKobo = Math.round(Number(form.costNgn) * 100);

    saveProduct({
      source: form.source,
      sku: form.sku.trim(),
      name: form.name.trim(),
      label: form.label.trim() || "Featured Product",
      description: form.description.trim() || form.name.trim(),
      priceKobo,
      costKobo,
      priceDisplay: formatCurrency(priceKobo),
      imageUrl: form.imageUrl.trim(),
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      status: "ACTIVE",
      totalStock: Number(form.totalStock) || 10,
      lowStockAt: Number(form.lowStockAt) || 3,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      createdAt: form.createdAt,
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push("/admin/products");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/products"
              className="text-xs text-muted hover:text-active flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-heading">Add New Product or Service</h1>
          <p className="text-xs text-muted">
            Create an active product or inventory listing across any of the 6 platform services.
          </p>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Saved! Redirecting...
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-heading uppercase tracking-wider">
              1. Basic Information &amp; Service Classification
            </h2>

            <div>
              <label className="text-xs font-semibold text-heading block mb-1">
                Assign to Service / Department *
              </label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as ServiceSlug })}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs text-gray-900 bg-white focus:outline-none focus:border-active"
              >
                <option value={ServiceSlug.GALAXY}>Device Galaxy (Online Storefront)</option>
                <option value={ServiceSlug.SPARK}>Zino Spark (Computer Village POS &amp; Wholesale)</option>
                <option value={ServiceSlug.BUILDERS}>Top Builders (Building Materials Yard)</option>
                <option value={ServiceSlug.APARTMENTS}>Zino Apartments (Rooms &amp; Suites)</option>
                <option value={ServiceSlug.BILLSTACKS}>Billstacks (Subscriptions &amp; Services)</option>
                <option value={ServiceSlug.VISITORS}>Visitor Management (Passes &amp; Badges)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung 990 PRO 4TB NVMe SSD"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  SKU / Unique Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAM-990PRO-4TB"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Category / Badge Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSDs &amp; Storage, Flagship POS, Top Seller"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Date Added
                </label>
                <input
                  type="date"
                  value={form.createdAt}
                  onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-heading block mb-1">
                Detailed Description &amp; Specifications
              </label>
              <textarea
                rows={3}
                placeholder="Key features, warranty, and contents in the box..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active resize-none"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-heading uppercase tracking-wider">
              2. Pricing &amp; Stock Levels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Selling Price (₦ NGN) *
                </label>
                            <NumberInput
                              value={form.priceNgn}
                              onChange={(v) => setForm({ ...form, priceNgn: v as number })}
                              placeholder="e.g. 45000"
                              min={0}
                              step={100}
                              allowNegative={false}
                              allowDecimal={false}
                              prefix="₦"
                  required
                />
                <p className="text-[10px] text-muted mt-1">
                  Format: {formatCurrency(Math.round(form.priceNgn * 100))}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Cost / Acquisition Price (₦ NGN)
                </label>
                            <NumberInput
                  value={form.costNgn}
                              onChange={(v) => setForm({ ...form, costNgn: v as number })}
                              placeholder="e.g. 32000"
                              min={0}
                              step={100}
                              allowNegative={false}
                              allowDecimal={false}
                              prefix="₦"
                />
                <p className="text-[10px] text-muted mt-1">
                  Margin: {formatCurrency(Math.round((form.priceNgn - form.costNgn) * 100))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Initial Stock Quantity
                </label>
                            <NumberInput
                  value={form.totalStock}
                              onChange={(v) => setForm({ ...form, totalStock: v as number })}
                              placeholder="e.g. 15"
                              min={0}
                              step={1}
                              allowNegative={false}
                              allowDecimal={false}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">
                  Low Stock Alert Threshold
                </label>
                            <NumberInput
                  value={form.lowStockAt}
                              onChange={(v) => setForm({ ...form, lowStockAt: v as number })}
                              placeholder="e.g. 3"
                              min={0}
                              step={1}
                              allowNegative={false}
                              allowDecimal={false}
                />
              </div>
            </div>
          </div>

          {/* Media URL */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-heading uppercase tracking-wider">
              3. Product Imagery
            </h2>

            <div>
              <label className="text-xs font-semibold text-heading block mb-1">
                Image Web URL or Hosted Image Link
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active"
              />
              <p className="text-[11px] text-muted mt-1">
                Tip: Paste any direct product image link. It will automatically fit cleanly into square storefront cards.
              </p>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-border text-active"
                />
                <span className="text-xs font-semibold text-heading">Feature on Storefront Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                  className="rounded border-border text-active"
                />
                <span className="text-xs font-semibold text-heading">Mark with "NEW" Badge</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-active hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish Product</span>
            </button>
          </div>
        </div>

        {/* Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs sticky top-24 space-y-4">
            <h3 className="text-xs font-black text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-galaxy" />
              <span>Live Card Preview</span>
            </h3>

            {/* Simulated Storefront Card */}
            <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-square w-full rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-3 overflow-hidden mb-3">
                  {form.isNew && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white">
                      NEW
                    </span>
                  )}
                  {form.imageUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.imageUrl}
                      alt={form.name || "Preview"}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 space-y-1">
                      <Package className="w-8 h-8 opacity-40" />
                      <span className="text-[10px] font-mono">No Cover Image</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] font-bold text-muted uppercase">
                  {form.label || "Category"}
                </p>
                <h4 className="font-bold text-heading text-xs mt-0.5 line-clamp-2">
                  {form.name || "Product Name"}
                </h4>
                <p className="text-xs font-black text-heading mt-2">
                  {formatCurrency(Math.round(form.priceNgn * 100))}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted">
                <span>SKU: {form.sku || "—"}</span>
                <span className="font-semibold text-emerald-600">
                  {form.totalStock} in stock
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted text-center">
              This is how customers will see this item on the public storefront.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
