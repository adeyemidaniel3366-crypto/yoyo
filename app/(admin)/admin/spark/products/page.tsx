"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Search,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Package,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG, LOCATIONS } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

interface SparkProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  costKobo: number;
  priceKobo: number;
  totalStock: number;
  location: string;
}

export default function SparkProductsPage() {
  const { products: storeProducts } = usePlatformStore();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const products: SparkProduct[] = React.useMemo(
    () =>
      storeProducts
        .filter((p) => p.source === ServiceSlug.SPARK)
        .map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.label || "Electronics",
          costKobo: p.costKobo || Math.round(p.priceKobo * 0.75),
          priceKobo: p.priceKobo,
          totalStock: p.totalStock,
          location: "Zino Spark Medical Road",
        })),
    [storeProducts]
  );

  const categories = React.useMemo(() => {
    const cats = new Set<string>(["ALL"]);
    products.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = selectedCategory === "ALL"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const columns: ColumnDef<SparkProduct>[] = [
    {
      key: "source",
      header: "Source",
      cell: () => <SourceBadge source={ServiceSlug.SPARK} size="sm" />,
    },
    {
      key: "sku",
      header: "SKU",
      accessorKey: "sku",
      cell: (row) => <span className="font-mono text-xs font-semibold text-gray-700">{row.sku}</span>,
    },
    {
      key: "name",
      header: "Product Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.name}</span>
          <span className="text-[11px] text-gray-400">{row.category}</span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      accessorKey: "location",
      cell: (row) => <span className="text-xs text-gray-600">{row.location}</span>,
    },
    {
      key: "costKobo",
      header: "Cost Price",
      accessorKey: "costKobo",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-600">{formatCurrency(row.costKobo)}</span>
      ),
    },
    {
      key: "priceKobo",
      header: "Selling Price",
      accessorKey: "priceKobo",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-gray-900">
          {formatCurrency(row.priceKobo)}
        </span>
      ),
    },
    {
      key: "totalStock",
      header: "Stock Alert",
      accessorKey: "totalStock",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          <AlertTriangle className="w-3 h-3" />
          {row.totalStock} Pc(s)
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Zino Spark Products Catalog</h1>
            <SourceBadge source={ServiceSlug.SPARK} size="md" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage electronics, components, and storage inventory across all 5 Computer Village branches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/spark/stock-alert"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Stock Alerts (19 Items)
          </Link>
          <Link
            href="/admin/spark/pos"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Open POS Register
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={filteredProducts}
          title="All Products & Inventory"
          searchPlaceholder="Search product by name, SKU or location..."
        />
      </div>
    </div>
  );
}
