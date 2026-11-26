"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Package,
  ShoppingBag,
  TrendingUp,
  Star,
  Tag,
  ArrowRight,
  Truck,
  CheckCircle2,
  Plus,
  ExternalLink,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";
import { GALAXY_CATEGORIES } from "@/lib/shop-data";

export default function DeviceGalaxyDashboardPage() {
  const { products: storeProducts, invoices } = usePlatformStore();
  const [liveOrders, setLiveOrders] = useState<any[] | null>(null);

  // Filter products belonging to Galaxy
  const galaxyProducts = useMemo(
    () => storeProducts.filter((p) => p.source === ServiceSlug.GALAXY && p.status !== "ARCHIVED"),
    [storeProducts]
  );

  // Calculate live financial and inventory metrics
  const galaxyTransactions = useMemo(
    () => invoices.filter((inv) => inv.source === ServiceSlug.GALAXY),
    [invoices]
  );

  const totalRevenueKobo = useMemo(
    () => galaxyTransactions.reduce((acc, inv) => acc + (inv.amountKobo || 0), 0),
    [galaxyTransactions]
  );

  const lowStockCount = useMemo(
    () => galaxyProducts.filter((p) => p.totalStock <= (p.lowStockAt || 3)).length,
    [galaxyProducts]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    galaxyProducts.forEach((p) => {
      const cat = p.label || "Other";
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [galaxyProducts]);

  useEffect(() => {
    fetch("/api/galaxy/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && Array.isArray(res.data)) {
          const mapped = res.data.map((ord: any) => ({
            id: ord.id,
            orderNo: ord.orderNo,
            customer: ord.contact?.name || ord.guestName || "Customer",
            itemsCount: Array.isArray(ord.items)
              ? ord.items.length
              : Array.isArray(ord.lines)
              ? ord.lines.length
              : 1,
            amountKobo: ord.totalKobo || 0,
            status: ord.status,
            paymentStatus: ord.paymentStatus || "PAID",
            date: typeof ord.createdAt === "string" ? ord.createdAt.slice(0, 10) : "Today",
          }));
          setLiveOrders(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const defaultOrders = [
    {
      id: "ord_1",
      orderNo: "DG-892104",
      customer: "Engr. Tunde Bakare",
      itemsCount: 3,
      amountKobo: 24500000,
      status: "PROCESSING",
      paymentStatus: "PAID",
      date: "Today, 11:45 AM",
    },
    {
      id: "ord_2",
      orderNo: "DG-892103",
      customer: "Amaka Nwachukwu",
      itemsCount: 1,
      amountKobo: 48000000,
      status: "SHIPPED",
      paymentStatus: "PAID",
      date: "Yesterday",
    },
    {
      id: "ord_3",
      orderNo: "DG-892102",
      customer: "Chief Okonkwo",
      itemsCount: 2,
      amountKobo: 485000000,
      status: "DELIVERED",
      paymentStatus: "PAID",
      date: "16 Nov 2026",
    },
    {
      id: "ord_4",
      orderNo: "DG-892101",
      customer: "Kazeem Bello",
      itemsCount: 1,
      amountKobo: 22000000,
      status: "PENDING",
      paymentStatus: "PENDING",
      date: "15 Nov 2026",
    },
  ];

  const galaxyOrders = liveOrders && liveOrders.length > 0 ? liveOrders : defaultOrders;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-border p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              <Image
                src="/logos/device-galaxy.png"
                alt="Device Galaxy"
                width={38}
                height={38}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-heading tracking-tight">
                  Device Galaxy E-Commerce
                </h1>
                <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
              </div>
              <p className="text-xs text-muted mt-0.5">
                Online electronics catalog, orders, categories, flash deals &amp; inventory.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-white text-heading hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <span>Live Shopping App</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>

          <Link
            href="/admin/products/new?service=galaxy"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Device</span>
          </Link>
        </div>
      </div>

      {/* 4 Unified Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Online Storefront Revenue</p>
          <h3 className="text-2xl font-black text-heading mt-1">
            {formatCurrency(totalRevenueKobo > 0 ? totalRevenueKobo : 509500000)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{galaxyTransactions.length} processed orders</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Active Devices in Catalog</p>
          <h3 className="text-2xl font-black text-galaxy mt-1">{galaxyProducts.length} Devices</h3>
          <p className="text-[11px] text-muted mt-1">Synced to public shop</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Low Stock Alerts</p>
          <h3 className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? "text-amber-500" : "text-heading"}`}>
            {lowStockCount}
          </h3>
          <p className="text-[11px] text-muted mt-1">Devices under reorder threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Orders In Pipeline</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{galaxyOrders.length}</h3>
          <p className="text-[11px] text-muted mt-1">Lagos dispatch &amp; delivery</p>
        </div>
      </div>

      {/* Shop By Category Breakdown Banner */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-galaxy" />
            <h3 className="text-sm font-bold text-heading">Storefront Catalog Categories</h3>
          </div>
          <Link
            href="/admin/galaxy/products"
            className="text-xs font-bold text-galaxy hover:underline"
          >
            Manage Catalog Products →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {GALAXY_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            return (
              <div
                key={cat}
                className="px-3 py-1.5 rounded-xl border border-border bg-gray-50 flex items-center gap-2 text-xs font-semibold text-heading"
              >
                <span>{cat}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-galaxy-tint text-galaxy">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-galaxy" />
            <h3 className="text-sm font-bold text-heading">Recent E-Commerce Store Orders</h3>
          </div>
          <Link href="/shop/checkout" target="_blank" className="text-xs font-bold text-galaxy hover:underline">
            Test Checkout Flow →
          </Link>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Order #</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-center">Items</th>
                <th className="py-2.5 text-right">Total</th>
                <th className="py-2.5 text-center">Payment</th>
                <th className="py-2.5 text-center">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {galaxyOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-galaxy">{ord.orderNo}</td>
                  <td className="py-3 font-medium text-heading">{ord.customer}</td>
                  <td className="py-3 text-muted">{ord.date}</td>
                  <td className="py-3 text-center">{ord.itemsCount}</td>
                  <td className="py-3 text-right font-bold text-heading">
                    {formatCurrency(ord.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={ord.paymentStatus} size="sm" />
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={ord.status} size="sm" />
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
