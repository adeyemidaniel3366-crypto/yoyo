"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, Send } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { usePlatformStore } from "@/lib/platform-store";

interface StockAlertRow {
  id: string;
  source: ServiceSlug;
  product: string;
  location: string;
  currentStock: string;
  threshold: number;
}

export default function ZinoSparkStockAlertPage() {
  const { products: storeProducts } = usePlatformStore();
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  const alertData: StockAlertRow[] = React.useMemo(
    () =>
      storeProducts
        .filter(
          (p) =>
            p.source === ServiceSlug.SPARK &&
            (p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK" || p.totalStock <= p.lowStockAt)
        )
        .map((p) => ({
          id: p.id,
          source: ServiceSlug.SPARK,
          product: `${p.name} (${p.sku})`,
          location: "Zino Spark Medical Road",
          currentStock: `${p.totalStock} Pc(s)`,
          threshold: p.lowStockAt,
        })),
    [storeProducts]
  );

  const columns: ColumnDef<StockAlertRow>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-heading">{row.product}</span>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      cell: (row) => (
        <span className="text-body font-medium">{row.location}</span>
      ),
    },
    {
      key: "currentStock",
      header: "Current stock",
      align: "right",
      sortable: true,
      cell: (row) => (
        <span className="font-extrabold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
          {row.currentStock}
        </span>
      ),
    },
  ];

  const filtered = alertData.filter((item) => {
    if (selectedLocation === "ALL") return true;
    return item.location.toLowerCase().includes(selectedLocation.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/spark"
            className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-heading transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h1 className="text-2xl font-bold text-heading tracking-tight">
                Product Stock Alert
              </h1>
              <SourceBadge source={ServiceSlug.SPARK} size="sm" />
            </div>
            <p className="text-xs text-muted mt-0.5">
              Live inventory items at or below low-stock threshold across the 5 retail locations.
            </p>
          </div>
        </div>

        {/* Location Dropdown matching screenshot */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-active"
          >
            <option value="ALL">Select location (All locations)</option>
            <option value="Adepele">Zino Spark Adepele</option>
            <option value="Medical Road">Zino Spark Medical Road</option>
            <option value="Olayeni">Zino Spark Olayeni Shop</option>
            <option value="Asset Corps">Warehouse - Asset Corps Plaza</option>
          </select>
        </div>
      </div>

      {/* Exact Table Matching Screenshot */}
      <DataTable
        columns={columns}
        data={filtered}
        showSourceColumn={true}
        showExportButtons={true}
        searchPlaceholder="Search product name or code..."
        emptyMessage="No stock alert items matching filter"
      />
    </div>
  );
}
