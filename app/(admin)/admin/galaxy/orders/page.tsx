"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Search,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

interface Order {
  id: string;
  orderNo: string;
  customer: string;
  phone: string;
  itemsSummary: string;
  amountKobo: number;
  deliveryMethod: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING";
  date: string;
}

const ORDERS: Order[] = [];

export default function GalaxyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [search, setSearch] = useState("");

  const filtered = orders.filter(
    (o) =>
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id: string, next: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o))
    );
  };

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
            <h1 className="text-2xl font-bold text-heading">Online Storefront Orders</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Fulfill online customer orders, assign dispatch riders, and track delivery receipts.
          </p>
        </div>

        <Link
          href="/shop"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm"
        >
          <span>View Public Storefront →</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Order #</th>
                <th className="py-2.5">Customer &amp; Phone</th>
                <th className="py-2.5">Ordered Devices</th>
                <th className="py-2.5">Shipping Method</th>
                <th className="py-2.5 text-right">Order Value</th>
                <th className="py-2.5 text-center">Payment</th>
                <th className="py-2.5 text-center">Fulfillment Status</th>
                <th className="py-2.5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-galaxy">{ord.orderNo}</td>
                  <td className="py-3">
                    <p className="font-semibold text-heading">{ord.customer}</p>
                    <p className="text-[11px] text-muted">{ord.phone}</p>
                  </td>
                  <td className="py-3 text-muted max-w-xs truncate">{ord.itemsSummary}</td>
                  <td className="py-3 text-muted">{ord.deliveryMethod}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(ord.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={ord.paymentStatus} size="sm" />
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={ord.status} size="sm" />
                  </td>
                  <td className="py-3 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => updateStatus(ord.id, e.target.value as Order["status"])}
                      className="px-2 py-1 rounded-lg border border-border text-xs font-semibold text-gray-900 bg-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
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
