"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

export default function DeviceGalaxyDashboardPage() {
  const [liveOrders, setLiveOrders] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    fetch("/api/galaxy/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && Array.isArray(res.data)) {
          const mapped = res.data.map((ord: any) => ({
            id: ord.id,
            orderNo: ord.orderNo,
            customer: ord.contact?.name || ord.guestName || "Customer",
            itemsCount: Array.isArray(ord.lines) ? ord.lines.length : 1,
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
            <div className="w-8 h-8 rounded-lg bg-galaxy-tint flex items-center justify-center text-galaxy">
              <Smartphone className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Device Galaxy E-Commerce
            </h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            E-commerce orders, online catalog inventory, categories, reviews & coupons.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-galaxy text-white hover:bg-galaxy-dark transition-colors shadow-sm"
          >
            <span>Live Storefront →</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Online Revenue (Month)</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦4,250,000</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+21.5% vs last month</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Orders Pending</p>
          <h3 className="text-2xl font-black text-amber-500 mt-1">1</h3>
          <p className="text-[11px] text-muted mt-1">Awaiting dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Orders Shipped Today</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">3</h3>
          <p className="text-[11px] text-muted mt-1">Via GIG Logistics</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-2xs">
          <p className="text-xs text-muted font-medium">Pending Reviews</p>
          <h3 className="text-2xl font-black text-heading mt-1">1</h3>
          <p className="text-[11px] text-muted mt-1">5-star rating waiting approval</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 className="text-base font-semibold text-heading">Recent Online Orders</h3>
          <Link href="/admin/galaxy/orders" className="text-xs font-bold text-galaxy hover:underline">
            View all orders →
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
