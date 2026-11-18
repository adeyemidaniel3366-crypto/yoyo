"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, Send } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface StockAlertRow {
  id: string;
  source: ServiceSlug;
  product: string;
  location: string;
  currentStock: string;
  threshold: number;
}

export default function ZinoSparkStockAlertPage() {
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  // Exactly the 19 items from user's uploaded screenshot media_1795026254014_7b81d508.jpg
  const alertData: StockAlertRow[] = [
    {
      id: "1",
      source: ServiceSlug.SPARK,
      product: "Zealot S69M (13360)",
      location: "Warehouse - Asset Corps Plaza Computer villgae",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "2",
      source: ServiceSlug.SPARK,
      product: "Sandisk ultra microSDXC UHS-I Card 80mb/s - 16GB (13444)",
      location: "Zino Spark Olayeni Shop",
      currentStock: "0.0 Pc(s)",
      threshold: 10,
    },
    {
      id: "3",
      source: ServiceSlug.SPARK,
      product: "JBL Sound System BAR 1300, 11.1 Chanel - 27kg (13099)",
      location: "Zino Spark Medical Road",
      currentStock: "0.0 Pc(s)",
      threshold: 2,
    },
    {
      id: "4",
      source: ServiceSlug.SPARK,
      product: "Verbatim Vi3000 SSD PCIe M.2 2280 internal SSD 1TB NVMe (13216)",
      location: "Zino Spark Adepele",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "5",
      source: ServiceSlug.SPARK,
      product: "Sandisk Cruzer Glide 3.0 USB FLASH Drive - 16GB (13346)",
      location: "Warehouse - Asset Corps Plaza Computer villgae",
      currentStock: "0.0 Pc(s)",
      threshold: 15,
    },
    {
      id: "6",
      source: ServiceSlug.SPARK,
      product: "Pull out - Pull-out HDD (pullout) - HGST 6TB (13413-2)",
      location: "Zino Spark Medical Road",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "7",
      source: ServiceSlug.SPARK,
      product: "Flash Drive Digirich sleek 2GB (13489)",
      location: "Zino Spark Adepele",
      currentStock: "0.0 Pc(s)",
      threshold: 10,
    },
    {
      id: "8",
      source: ServiceSlug.SPARK,
      product: "JBL PARTYBOX WIRELESS MIC (13203)",
      location: "Zino Spark Olayeni Shop",
      currentStock: "0.0 Pc(s)",
      threshold: 3,
    },
    {
      id: "9",
      source: ServiceSlug.SPARK,
      product: "Transcend SSD portable ESD410C 2000Mb/s 4TB (13285)",
      location: "Zino Spark Adepele",
      currentStock: "0.0 Pc(s)",
      threshold: 4,
    },
    {
      id: "10",
      source: ServiceSlug.SPARK,
      product: "Ezashy Jet flash drive 128gb (13404)",
      location: "Warehouse - Asset Corps Plaza Computer villgae",
      currentStock: "0.0 Pc(s)",
      threshold: 10,
    },
    {
      id: "11",
      source: ServiceSlug.SPARK,
      product: "Pull out - Pull-out HDD (pullout) - Seagate Enterprise capacity 6000GB (6TB) (13413-25)",
      location: "Zino Spark Olayeni Shop",
      currentStock: "0.0 Pc(s)",
      threshold: 4,
    },
    {
      id: "12",
      source: ServiceSlug.SPARK,
      product: "PULL OUT SSD - PULL OUT SSD - SSD SATA 256GB (13475-6)",
      location: "Zino Spark Medical Road",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "13",
      source: ServiceSlug.SPARK,
      product: "Samsung 990 PRO 4TB pcle 4.0 NVMe M.2 SSD 7450MB/s 4TB (13268)",
      location: "Zino Spark Adepele",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "14",
      source: ServiceSlug.SPARK,
      product: "Synology 8 Bay Rackstation RS1221RP+ (13376)",
      location: "Zino Spark Medical Road",
      currentStock: "0.0 Pc(s)",
      threshold: 2,
    },
    {
      id: "15",
      source: ServiceSlug.SPARK,
      product: "Lexar SL500 portable SSD with magnetic set 2,000Mb/s USB 3.2 Gen2x2 1TB (13458)",
      location: "Warehouse - Asset Corps Plaza Computer villgae",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "16",
      source: ServiceSlug.SPARK,
      product: "Lexar portable SSD SL500 2,000Mb/s USB 3.2 Gen2 2TB (13155)",
      location: "Zino Spark Olayeni Shop",
      currentStock: "0.0 Pc(s)",
      threshold: 5,
    },
    {
      id: "17",
      source: ServiceSlug.SPARK,
      product: "Synology 4 Bay DS425+ (13230)",
      location: "Zino Spark Adepele",
      currentStock: "0.0 Pc(s)",
      threshold: 2,
    },
    {
      id: "18",
      source: ServiceSlug.SPARK,
      product: "Sandisk Extreme PRO portable SSD 2000Mb/s - 4TB (13246)",
      location: "Zino Spark Olayeni Shop",
      currentStock: "0.0 Pc(s)",
      threshold: 4,
    },
    {
      id: "19",
      source: ServiceSlug.SPARK,
      product: "DIGIRICH V-CUT USB FLASH DRIVE 32GB (13317)",
      location: "Zino Spark Adepele",
      currentStock: "0.0 Pc(s)",
      threshold: 15,
    },
  ];

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
            className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-semibold text-heading focus:outline-none focus:border-active"
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
