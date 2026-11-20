"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Plus, ArrowLeft, Search } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/money";

interface PurchaseOrder {
  id: string;
  poNo: string;
  vendor: string;
  itemsSummary: string;
  amountKobo: number;
  deliveryDate: string;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
}

const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "po1", poNo: "PO-2026-881", vendor: "SanDisk Official West Africa", itemsSummary: "100× Extreme PRO 4TB SSD", amountKobo: 3200000000, deliveryDate: "28 Nov 2026", status: "PENDING" },
  { id: "po2", poNo: "PO-2026-880", vendor: "Dangote Cement Depot", itemsSummary: "500 Bags 42.5R Cement", amountKobo: 410000000, deliveryDate: "19 Nov 2026", status: "DELIVERED" },
];

export default function BillstacksPurchaseOrdersPage() {
  const [orders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/billstacks" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Billstacks Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Supplier Purchase Orders</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Procurement orders sent to suppliers across all group subsidiaries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Create Purchase Order")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Purchase Order</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">PO #</th>
                <th className="py-2.5">Vendor / Supplier</th>
                <th className="py-2.5">Items Summary</th>
                <th className="py-2.5">Expected Delivery</th>
                <th className="py-2.5 text-right">Order Total (₦)</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-billstacks">{po.poNo}</td>
                  <td className="py-3 font-semibold text-heading">{po.vendor}</td>
                  <td className="py-3 text-muted">{po.itemsSummary}</td>
                  <td className="py-3 text-muted">{po.deliveryDate}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(po.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={po.status} size="sm" />
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
