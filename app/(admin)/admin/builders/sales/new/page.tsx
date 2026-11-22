"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  CheckCircle2,
  ArrowLeft,
  HardHat,
  User,
  CreditCard,
  Truck,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { recordPlatformTransaction, usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { NumberInput } from "@/components/ui/number-input";

interface BuilderProduct {
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number; // In Naira
  stock: number;
}

interface CartItem {
  product: BuilderProduct;
  qty: number;
}

export default function TopBuildersNewSalePage() {
  const router = useRouter();
  const { products: storeProducts } = usePlatformStore();

  const products: BuilderProduct[] = useMemo(
    () =>
      storeProducts
        .filter((p) => p.source === ServiceSlug.BUILDERS && p.status !== "INACTIVE" && p.status !== "ARCHIVED")
        .map((p) => ({
          code: p.sku,
          name: p.name,
          category: p.label || "Building Materials",
          unit: "unit",
          price: Math.round((p.priceKobo || 0) / 100),
          stock: p.totalStock,
        })),
    [storeProducts]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    products.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  // State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("Adewumi Builders");
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MONIEPOINT_POS" | "UBA">("CASH");
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [fulfilment, setFulfilment] = useState<"SELF_COLLECTION" | "DELIVERED" | "TO_DELIVER">("SELF_COLLECTION");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [successData, setSuccessData] = useState<{ invoiceNo: string; total: number } | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.code.includes(q);
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart math
  const subtotalNaira = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  }, [cart]);

  const addToCart = (product: BuilderProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.code === product.code);
      if (existing) {
        return prev.map((i) =>
          i.product.code === product.code ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (code: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(code);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.code === code ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (code: string) => {
    setCart((prev) => prev.filter((i) => i.product.code !== code));
  };

  const isFullyPaid =
    amountPaid !== "" && Number(amountPaid) >= subtotalNaira && subtotalNaira > 0;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveAndPrint = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    let fallbackInvoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const paidKobo = Math.round(Number(amountPaid || 0) * 100);
      const totalKobo = Math.round(subtotalNaira * 100);
      const custName = isWalkIn ? walkInName || "Walk-In Customer" : customer;
      const itemsSummary = cart.map((i) => `${i.qty} ${i.product.unit} ${i.product.name}`).join(", ");
      const inv = recordPlatformTransaction({
        source: ServiceSlug.BUILDERS,
        activityType: "SALE",
        activitySummary: `Yard Material Sale — ${itemsSummary}`,
        customer: custName,
        amountKobo: totalKobo,
        location: "Builders Yard",
        status: paidKobo >= totalKobo ? "PAID" : paidKobo > 0 ? "PART_PAID" : "UNPAID",
        actor: "Sales Staff (Builders Yard)",
        createdAt: saleDate,
      });
      fallbackInvoiceNo = inv.invoiceNo;
      const res = await fetch("/api/builders/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: ServiceSlug.BUILDERS,
          customerName: custName,
          walkInPhone: isWalkIn ? walkInPhone : undefined,
          lines: cart.map((item) => ({
            productCode: item.product.code,
            productName: item.product.name,
            qty: item.qty,
            unitPriceKobo: item.product.price * 100,
          })),
          payments: paidKobo > 0 ? [{ method: paymentMethod, amountKobo: paidKobo }] : [],
          fulfilmentStatus: fulfilment,
          remarks: remarks || undefined,
        }),
      });
      const data = await res.json();
      const finalInvoiceNo = (res.ok && data.ok && data.data?.invoiceNo) ? data.data.invoiceNo : fallbackInvoiceNo;
      setSuccessData({ invoiceNo: finalInvoiceNo, total: subtotalNaira });
    } catch {
      setSuccessData({ invoiceNo: fallbackInvoiceNo, total: subtotalNaira });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/builders"
            className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-heading transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-heading">New Sale</h1>
              <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
            </div>
            <p className="text-xs text-muted">
              Top Builders Construction Materials · Point of Sale
            </p>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout (Desktop 60/40, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Product Selector (60%) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-border p-5 shadow-2xs space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name or code (001...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-heading placeholder:text-muted focus:outline-none focus:border-builders"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-builders text-white shadow-2xs"
                    : "bg-gray-100 text-body hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.code}
                className="p-3.5 rounded-xl border border-border hover:border-builders/60 hover:shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-muted uppercase">
                      Code #{prod.code}
                    </span>
                    <span className="text-[11px] font-semibold text-muted">
                      {prod.stock} {prod.unit} left
                    </span>
                  </div>
                  <h4 className="font-bold text-heading text-xs leading-snug">
                    {prod.name}
                  </h4>
                  <p className="text-xs font-extrabold text-builders mt-1">
                    ₦{prod.price.toLocaleString()} <span className="font-normal text-muted text-[10px]">/{prod.unit}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(prod)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-builders-tint hover:bg-builders text-builders hover:text-white font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Sale</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Sale Form (40%) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-5">
            {/* Form Title */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-heading text-base">Cash Sales Invoice</h3>
              <span className="text-xs text-muted">Builders Yard</span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.product.code}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-border text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-heading truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted">
                        ₦{item.product.price.toLocaleString()} × {item.qty} {item.product.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16">
                        <NumberInput
                          min={1}
                          value={item.qty}
                          onChange={(v) => updateQty(item.product.code, typeof v === "number" ? v : 0)}
                          className="h-7 px-1.5 text-center rounded text-xs font-bold"
                        />
                      </div>
                      <span className="font-bold text-heading w-16 text-right">
                        ₦{(item.product.price * item.qty).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.code)}
                        className="p-1 text-muted hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted border-2 border-dashed border-border rounded-xl">
                  Tap a product on the left to add it to the sale.
                </div>
              )}
            </div>

            {/* Total Display */}
            <div className="p-3.5 rounded-xl bg-gray-900 text-white flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                Total Due
              </span>
              <span className="text-2xl font-black text-amber-400">
                ₦{subtotalNaira.toLocaleString()}
              </span>
            </div>

            {/* Customer & Sale Date Section */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-heading mb-1">Customer</label>
                  <select
                    value={isWalkIn ? "WALK_IN" : customer}
                    onChange={(e) => {
                      if (e.target.value === "WALK_IN") {
                        setIsWalkIn(true);
                      } else {
                        setIsWalkIn(false);
                        setCustomer(e.target.value);
                      }
                    }}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-gray-900"
                  >
                    <option value="Adewumi Builders">Adewumi Builders (08000000101)</option>
                    <option value="Ibrahim & Sons Construction">Ibrahim &amp; Sons Construction</option>
                    <option value="Pastor Femi Adebayo">Pastor Femi Adebayo</option>
                    <option value="Mama Bose Ventures">Mama Bose Ventures</option>
                    <option value="Chief Okonkwo">Chief Okonkwo</option>
                    <option value="Kelechi & Co. Plumbing">Kelechi &amp; Co. Plumbing</option>
                    <option value="WALK_IN">+ Walk-in / New Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-gray-900"
                  />
                </div>
              </div>

              {isWalkIn && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="h-8 px-2.5 rounded border border-border text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Phone (080...)"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="h-8 px-2.5 rounded border border-border text-xs"
                  />
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-heading">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(["CASH", "MONIEPOINT_POS", "UBA"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      paymentMethod === method
                        ? "bg-builders text-white shadow-2xs"
                        : "bg-gray-100 text-heading hover:bg-gray-200"
                    }`}
                  >
                    {method === "MONIEPOINT_POS" ? "Moniepoint" : method}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1">
                  <NumberInput
                    placeholder="Amount Paid (₦)"
                    prefix="₦"
                    value={amountPaid}
                    onChange={(v) => setAmountPaid(v === "" ? "" : Number(v))}
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAmountPaid(subtotalNaira)}
                  className="px-2.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-heading"
                >
                  Full Amount
                </button>
              </div>
              {isFullyPaid && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully Paid</span>
                </p>
              )}
            </div>

            {/* Fulfilment */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-heading">Fulfilment</label>
              <div className="flex items-center gap-4">
                {[
                  { id: "SELF_COLLECTION", label: "Self Collection" },
                  { id: "DELIVERED", label: "Delivered" },
                  { id: "TO_DELIVER", label: "To Deliver" },
                ].map((f) => (
                  <label key={f.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="fulfilment"
                      checked={fulfilment === f.id}
                      onChange={() => setFulfilment(f.id as any)}
                      className="text-builders focus:ring-builders"
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleSaveAndPrint}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-builders text-white font-bold text-xs uppercase tracking-wider hover:bg-builders-dark disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sale Recorded Successfully!</h3>
              <p className="text-xs text-gray-500 mt-1">Invoice #{successData.invoiceNo}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Invoice Value:</span>
                <span className="font-bold text-gray-900">₦{successData.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dashboard Status:</span>
                <span className="font-bold text-emerald-600">Synced to Unified Ledger</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCart([]);
                  setSuccessData(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Record Another Sale
              </button>
              <Link
                href="/admin/builders/sales"
                className="flex-1 py-2.5 rounded-xl bg-builders text-white text-xs font-bold text-center hover:opacity-95 shadow-sm transition-opacity"
              >
                View Sales Book
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
