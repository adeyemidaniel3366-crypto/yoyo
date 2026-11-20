"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Layers, Pencil, Trash2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  productsCount: number;
  featured: boolean;
}

const CATEGORIES: CategoryItem[] = [
  { id: "c1", name: "SSDs & High-Speed Storage", slug: "ssds-storage", productsCount: 12, featured: true },
  { id: "c2", name: "Laptops & Mobile Workstations", slug: "laptops", productsCount: 8, featured: true },
  { id: "c3", name: "NAS & Enterprise Servers", slug: "nas-servers", productsCount: 4, featured: true },
  { id: "c4", name: "Portable Audio & Bluetooth Speakers", slug: "audio", productsCount: 15, featured: false },
  { id: "c5", name: "Docking Stations & Hubs", slug: "hubs", productsCount: 9, featured: false },
];

export default function GalaxyCategoriesPage() {
  const [categories] = useState<CategoryItem[]>(CATEGORIES);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/galaxy" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Galaxy Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Storefront Product Categories</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Organize gadgets and electronics into structured storefront navigation and filter menus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Category")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Category</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Category Name</th>
                <th className="py-2.5">URL Slug</th>
                <th className="py-2.5 text-center">Active Products</th>
                <th className="py-2.5 text-center">Featured on Menu</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{c.name}</td>
                  <td className="py-3 font-mono text-muted">{c.slug}</td>
                  <td className="py-3 text-center font-bold text-galaxy">{c.productsCount}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.featured ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-muted"
                      }`}
                    >
                      {c.featured ? "FEATURED" : "STANDARD"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Edit ${c.name}`)}
                      className="px-3 py-1 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50"
                    >
                      Edit
                    </button>
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
