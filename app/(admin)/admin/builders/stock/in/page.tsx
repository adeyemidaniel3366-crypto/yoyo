"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackagePlus,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Truck,
  Hash,
  AlertCircle,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { NumberInput } from "@/components/ui/number-input";

interface StockInItem {
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  supplier: string;
  invoiceNo: string;
  costKobo: number;
  date: string;
}

export default function TopBuildersStockInPage() {
  const [supplier, setSupplier] = useState("Dangote Cement Plc");
  const [invoiceNo, setInvoiceNo] = useState("DNG-2026-991");
  const [selectedProduct, setSelectedProduct] = useState("prod_tb_1");
  const [quantity, setQuantity] = useState<number>(100);
  const [unitCost, setUnitCost] = useState<number>(7500);
  const [notes, setNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [history, setHistory] = useState<StockInItem[]>([
    {
      productId: "prod_tb_1",
      productName: "Dangote Cement 50kg (Grade 42.5N)",
      qty: 300,
      unit: "bags",
      supplier: "Dangote Cement Plc",
      invoiceNo: "DNG-2026-840",
      costKobo: 225000000,
      date: "2026-11-16",
    },
    {
      productId: "prod_tb_2",
      productName: "Elephant Supaset Cement 50kg",
      qty: 150,
      unit: "bags",
      supplier: "Lafarge Africa Plc",
      invoiceNo: "LAF-2026-112",
      costKobo: 111000000,
      date: "2026-11-14",
    },
    {
      productId: "prod_tb_5",
      productName: "12mm TMT High Yield Iron Rod (12m length)",
      qty: 50,
      unit: "lengths",
      supplier: "Tiger TMT Mills",
      invoiceNo: "TGR-2026-554",
      costKobo: 44000000,
      date: "2026-11-12",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: StockInItem = {
      productId: selectedProduct,
      productName:
        selectedProduct === "prod_tb_1"
          ? "Dangote Cement 50kg (Grade 42.5N)"
          : selectedProduct === "prod_tb_5"
          ? "12mm TMT High Yield Iron Rod (12m length)"
          : "Granite (30-ton tipper load, 3/4 inch)",
      qty: Number(quantity),
      unit: selectedProduct === "prod_tb_1" ? "bags" : "units",
      supplier,
      invoiceNo,
      costKobo: Number(quantity) * Number(unitCost) * 100,
      date: new Date().toISOString().split("T")[0],
    };

    setHistory([newItem, ...history]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/builders/stock"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Stock In (Receive Inventory)</h1>
            <SourceBadge source={ServiceSlug.BUILDERS} size="md" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Top Builders Yard: Record supplier deliveries, incoming trucks, and cement offloading.
          </p>
        </div>

        <Link
          href="/admin/builders/stock"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
        >
          View Stock Sheet
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            Delivery recorded successfully! Yard stock count updated and logged in chronological activity.
          </p>
        </div>
      )}

      {/* Stock In Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-emerald-600" />
          Record Inward Delivery
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Supplier / Factory
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Waybill / Invoice No.
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Material / Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
            >
              <option value="prod_tb_1">Dangote Cement 50kg (Grade 42.5N)</option>
              <option value="prod_tb_2">Elephant Supaset Cement 50kg</option>
              <option value="prod_tb_5">12mm TMT High Yield Iron Rod (12m)</option>
              <option value="prod_tb_6">16mm TMT High Yield Iron Rod (12m)</option>
              <option value="prod_tb_9">Granite (30-ton tipper load, 3/4 inch)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Quantity Received
            </label>
            <NumberInput
              min={1}
              value={quantity}
              onChange={(v) => setQuantity(typeof v === "number" ? v : 0)}
              required
              className="h-10 text-sm border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Unit Cost (₦)
            </label>
            <NumberInput
              min={0}
              prefix="₦"
              value={unitCost}
              onChange={(v) => setUnitCost(typeof v === "number" ? v : 0)}
              required
              className="h-10 text-sm border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Total Delivery Value
            </label>
            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-900">
              {formatCurrency(Number(quantity) * Number(unitCost) * 100)}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Delivery Notes / Vehicle Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Truck Reg: KJA-482-XA, Driver: Sunday"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              Confirm Delivery & Add Stock
            </button>
          </div>
        </form>
      </div>

      {/* Recent Deliveries Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Recent Delivery Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Waybill No</th>
                <th className="px-4 py-3">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-600">{item.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    +{item.qty} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.supplier}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.invoiceNo}</td>
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">
                    {formatCurrency(item.costKobo)}
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
