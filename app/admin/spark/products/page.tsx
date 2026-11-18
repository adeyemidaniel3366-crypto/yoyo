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
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const products: SparkProduct[] = [
    {
      id: "sp_1",
      sku: "13360",
      name: "Zealot S69M Bluetooth Speaker",
      category: "Audio",
      costKobo: 2200000,
      priceKobo: 2850000,
      totalStock: 0,
      location: "Warehouse — Asset Corps Plaza Computer Village",
    },
    {
      id: "sp_2",
      sku: "13444",
      name: "Sandisk ultra microSDXC UHS-I Card 80mb/s - 16GB",
      category: "Storage",
      costKobo: 320000,
      priceKobo: 450000,
      totalStock: 0,
      location: "Zino Spark Olayeni Shop",
    },
    {
      id: "sp_3",
      sku: "13099",
      name: "JBL Sound System BAR 1300, 11.1 Chanel - 27kg",
      category: "Audio",
      costKobo: 125000000,
      priceKobo: 145000000,
      totalStock: 0,
      location: "Zino Spark Medical Road",
    },
    {
      id: "sp_4",
      sku: "13216",
      name: "Verbatim Vi3000 SSD PCIe M.2 2280 internal SSD 1TB NVMe",
      category: "Storage",
      costKobo: 6200000,
      priceKobo: 7800000,
      totalStock: 0,
      location: "Zino Spark Adepele",
    },
    {
      id: "sp_5",
      sku: "13346",
      name: "Sandisk Cruzer Glide 3.0 USB FLASH Drive - 16GB",
      category: "Storage",
      costKobo: 280000,
      priceKobo: 380000,
      totalStock: 0,
      location: "Warehouse — Asset Corps Plaza Computer Village",
    },
    {
      id: "sp_6",
      sku: "13268",
      name: "Samsung 990 PRO 4TB pcle 4.0 NVMe M.2 SSD 7450MB/s 4TB",
      category: "Storage",
      costKobo: 32000000,
      priceKobo: 37500000,
      totalStock: 0,
      location: "Zino Spark Adepele",
    },
    {
      id: "sp_7",
      sku: "13376",
      name: "Synology 8 Bay Rackstation RS1221RP+",
      category: "Networking",
      costKobo: 145000000,
      priceKobo: 172000000,
      totalStock: 0,
      location: "Zino Spark Medical Road",
    },
    {
      id: "sp_8",
      sku: "13230",
      name: "Synology 4 Bay DS425+",
      category: "Networking",
      costKobo: 68000000,
      priceKobo: 79500000,
      totalStock: 0,
      location: "Zino Spark Adepele",
    },
    {
      id: "sp_9",
      sku: "13246",
      name: "Sandisk Extreme PRO portable SSD 2000Mb/s - 4TB",
      category: "Storage",
      costKobo: 31000000,
      priceKobo: 36000000,
      totalStock: 0,
      location: "Zino Spark Olayeni Shop",
    },
    {
      id: "sp_10",
      sku: "13317",
      name: "DIGIRICH V-CUT USB FLASH DRIVE 32GB",
      category: "Storage",
      costKobo: 380000,
      priceKobo: 550000,
      totalStock: 0,
      location: "Zino Spark Adepele",
    },
  ];

  const filteredProducts = selectedCategory === "ALL"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const columns: ColumnDef<SparkProduct>[] = [
    {
      header: "Source",
      id: "source",
      cell: () => <SourceBadge source={ServiceSlug.SPARK} size="sm" />,
    },
    {
      header: "SKU",
      accessorKey: "sku",
      cell: (row) => <span className="font-mono text-xs font-semibold text-gray-700">{row.sku}</span>,
    },
    {
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
      header: "Location",
      accessorKey: "location",
      cell: (row) => <span className="text-xs text-gray-600">{row.location}</span>,
    },
    {
      header: "Cost Price",
      accessorKey: "costKobo",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-600">{formatCurrency(row.costKobo)}</span>
      ),
    },
    {
      header: "Selling Price",
      accessorKey: "priceKobo",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-gray-900">
          {formatCurrency(row.priceKobo)}
        </span>
      ),
    },
    {
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
        {["ALL", "Audio", "Storage", "Networking"].map((cat) => (
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
          source={ServiceSlug.SPARK}
        />
      </div>
    </div>
  );
}
