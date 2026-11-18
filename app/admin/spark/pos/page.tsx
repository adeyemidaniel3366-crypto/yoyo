"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { ServiceSlug, LOCATIONS } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface SparkProduct {
  sku: string;
  name: string;
  category: string;
  priceKobo: number;
  stock: number;
}

interface PosCartItem {
  product: SparkProduct;
  qty: number;
  discountKobo: number;
}

export default function ZinoSparkPosPage() {
  const [selectedLocation, setSelectedLocation] = useState("loc_spark_medical");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "POS" | "TRANSFER">("CASH");
  const [amountPaidKobo, setAmountPaidKobo] = useState<number | "">("");
  const [parkedSales, setParkedSales] = useState<PosCartItem[][]>([]);

  // Seed electronics products from screenshot
  const sparkCatalog: SparkProduct[] = [
    { sku: "13268", name: "Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD", category: "SSD", priceKobo: 48000000, stock: 12 },
    { sku: "13458", name: "Lexar SL500 Portable SSD 1TB with Magnetic Set", category: "SSD", priceKobo: 18500000, stock: 24 },
    { sku: "13376", name: "Synology 8 Bay Rackstation RS1221RP+", category: "NAS", priceKobo: 245000000, stock: 4 },
    { sku: "13216", name: "Verbatim Vi3000 SSD PCIe M.2 1TB NVMe", category: "SSD", priceKobo: 14500000, stock: 18 },
    { sku: "13203", name: "JBL PartyBox Wireless Mic Set", category: "Audio", priceKobo: 12500000, stock: 8 },
    { sku: "13285", name: "Transcend SSD Portable ESD410C 4TB", category: "SSD", priceKobo: 42000000, stock: 6 },
    { sku: "13346", name: "SanDisk Cruzer Glide 3.0 USB 16GB", category: "Flash", priceKobo: 350000, stock: 85 },
    { sku: "13444", name: "SanDisk Ultra MicroSDXC 16GB 80MB/s", category: "Memory", priceKobo: 280000, stock: 60 },
  ];

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        handleCompleteSale();
      } else if (e.key === "Escape") {
        setCart([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart]);

  const addToCart = (product: SparkProduct) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.sku === product.sku);
      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, discountKobo: 0 }];
    });
  };

  const totalKobo = cart.reduce(
    (sum, item) => sum + (item.product.priceKobo * item.qty - item.discountKobo),
    0
  );

  const handleParkSale = () => {
    if (cart.length === 0) return;
    setParkedSales((prev) => [...prev, cart]);
    setCart([]);
    alert("Sale parked successfully! You can resume it anytime.");
  };

  const handleResumeSale = (idx: number) => {
    setCart(parkedSales[idx]);
    setParkedSales((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    alert(`POS Sale completed! Amount: ${formatCurrency(totalKobo)}.\nPrinting receipt on thermal printer...`);
    setCart([]);
    setAmountPaidKobo("");
  };

  const filteredProducts = sparkCatalog.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.includes(searchQuery)
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
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
              <h1 className="text-xl font-bold text-heading">Zino Spark Sell (POS)</h1>
              <SourceBadge source={ServiceSlug.SPARK} size="sm" />
            </div>
            <p className="text-xs text-muted">
              Keyboard-first point of sale · F9 to pay, Esc to clear
            </p>
          </div>
        </div>

        {/* Location switcher & Parked badge */}
        <div className="flex items-center gap-3">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-semibold text-heading focus:outline-none focus:border-active"
          >
            <option value="loc_spark_medical">Zino Spark Medical Road</option>
            <option value="loc_spark_adepele">Zino Spark Adepele</option>
            <option value="loc_spark_olayeni">Zino Spark Olayeni Shop</option>
          </select>

          {parkedSales.length > 0 && (
            <button
              type="button"
              onClick={() => handleResumeSale(0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Parked ({parkedSales.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* POS Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Product Scanner & Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Scan barcode or type SKU (e.g. 13268)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-lg border-2 border-border focus:border-active bg-white text-xs font-semibold text-heading placeholder:text-muted focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <div
                key={p.sku}
                onClick={() => addToCart(p)}
                className="p-3.5 rounded-xl border border-border hover:border-active/60 hover:shadow-2xs transition-all cursor-pointer select-none flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted font-bold mb-1">
                    <span>SKU #{p.sku}</span>
                    <span>{p.stock} in stock</span>
                  </div>
                  <h4 className="font-bold text-heading text-xs line-clamp-2">{p.name}</h4>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="font-extrabold text-blue-600 text-sm">
                    {formatCurrency(p.priceKobo)}
                  </span>
                  <span className="text-[10px] font-bold text-active uppercase">Tap to add</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart, Total & Tender (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-heading text-sm">Active Cart ({cart.length} items)</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleParkSale}
                  className="p-1.5 rounded hover:bg-gray-100 text-muted hover:text-heading text-xs font-semibold"
                  title="Park Sale"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="p-1.5 rounded hover:bg-rose-50 text-muted hover:text-rose-600 text-xs font-semibold"
                  title="Clear Cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.product.sku}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-border text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-heading truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted">
                        {formatCurrency(item.product.priceKobo)} × {item.qty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-heading">
                        {formatCurrency(item.product.priceKobo * item.qty)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted border-2 border-dashed border-border rounded-xl">
                  Cart is empty. Scan barcode or tap products.
                </div>
              )}
            </div>

            {/* Total Panel */}
            <div className="p-4 rounded-xl bg-gray-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">TOTAL DUE</p>
                <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalKobo)}</p>
              </div>
              <span className="text-xs text-gray-400 font-semibold">{customer}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-heading uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(["CASH", "POS", "TRANSFER"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-lg font-bold transition-colors ${
                      paymentMethod === m
                        ? "bg-active text-white shadow-2xs"
                        : "bg-gray-100 text-heading hover:bg-gray-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-5 pt-3 border-t border-border">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
              className="w-full py-3 rounded-xl bg-active hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Complete Sale & Print Receipt [F9]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
