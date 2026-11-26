"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Smartphone,
  Plus,
  Search,
  ArrowLeft,
  Star,
  Eye,
  Trash2,
  ExternalLink,
  Filter,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { GALAXY_CATEGORIES } from "@/lib/shop-data";

export default function GalaxyProductsPage() {
  const { products: storeProducts, deleteProduct } = usePlatformStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const galaxyProducts = useMemo(
    () => storeProducts.filter((p) => p.source === ServiceSlug.GALAXY && p.status !== "ARCHIVED"),
    [storeProducts]
  );

  const filtered = useMemo(() => {
    return galaxyProducts.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.label && p.label.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (selectedCategory !== "ALL" && p.label !== selectedCategory) return false;
      return true;
    });
  }, [galaxyProducts, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/galaxy" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Galaxy Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Device Galaxy Store Catalog</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Manage electronic devices, NVMe SSDs, NAS servers and audio accessories sold on the public storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-white text-xs font-bold text-heading hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>
          <Link
            href="/admin/products/new?service=galaxy"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </Link>
        </div>
      </div>

      {/* Catalog Table Card */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-lg">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gadgets, SSDs, models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-1.5 border border-border rounded-xl px-2.5 h-9 bg-white">
              <Filter className="w-3.5 h-3.5 text-muted" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-semibold text-xs text-heading focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {GALAXY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-muted font-medium">
            Showing {filtered.length} of {galaxyProducts.length} items
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5 w-16">Image</th>
                <th className="py-2.5">SKU</th>
                <th className="py-2.5">Device Name</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Retail Price</th>
                <th className="py-2.5 text-center">Stock</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Smartphone className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-muted">{p.sku}</td>
                  <td className="py-3">
                    <p className="font-bold text-heading line-clamp-1">{p.name}</p>
                    {p.isFeatured && (
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> Featured on Homepage
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-md bg-galaxy-tint text-galaxy font-extrabold text-[10px] uppercase whitespace-nowrap">
                      {p.label || "Electronics"}
                    </span>
                  </td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.priceKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`font-bold ${
                        p.totalStock === 0
                          ? "text-rose-600"
                          : p.totalStock <= 3
                          ? "text-amber-600"
                          : "text-heading"
                      }`}
                    >
                      {p.totalStock} units
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/shop/products/${p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-muted hover:text-galaxy hover:bg-gray-100"
                        title="View Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-colors"
                        title="Delete from Catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
