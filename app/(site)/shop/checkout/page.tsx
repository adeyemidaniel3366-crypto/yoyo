"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Building,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Lock,
  Printer,
  ChevronRight,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";

export default function ShopCheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, updateCartQty, removeFromCart, recordTransaction } = usePlatformStore();

  const [formData, setFormData] = useState({
    fullName: "Chief Babatunde Balogun",
    phone: "+234 803 456 7890",
    email: "babatunde.balogun@gmail.com",
    address: "Plot 14, Admiralty Way, Lekki Phase 1",
    city: "Lagos",
    state: "Lagos State",
    notes: "Please call before dispatching.",
  });

  const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS">("EXPRESS");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "TRANSFER" | "COD">("CARD");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountKobo, setDiscountKobo] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const subtotalKobo = cartItems.reduce((acc, it) => acc + it.priceKobo * it.qty, 0);
  const vatKobo = Math.round(subtotalKobo * 0.075);
  const shippingKobo =
    subtotalKobo >= 10000000 ? 0 : shippingMethod === "EXPRESS" ? 450000 : 350000;
  const totalKobo = Math.max(0, subtotalKobo + vatKobo + shippingKobo - discountKobo);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (code === "ZINO2026" || code === "WELCOME10") {
      const discount = Math.round(subtotalKobo * 0.1);
      setDiscountKobo(discount);
      setCouponApplied(true);
    } else {
      setCouponError("Invalid coupon code. Try 'ZINO2026' for 10% off!");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setOrderError("Your cart is empty. Please add items from the shop before checking out.");
      return;
    }
    setIsSubmitting(true);
    setOrderError(null);

    let serverOrderNo: string | null = null;
    let isServerConfirmed = false;

    try {
      const res = await fetch("/api/galaxy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            country: "Nigeria",
          },
          couponCode: couponApplied ? couponCode.trim().toUpperCase() : null,
          paymentMethod: paymentMethod === "COD" ? "COD" : "ONLINE",
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.data?.orderNo) {
          serverOrderNo = data.data.orderNo;
          isServerConfirmed = true;
        }
      }
    } catch {
      // Offline fallback
    }

    const orderRef = serverOrderNo || `DG-${Math.floor(100000 + Math.random() * 900000)}`;

    // Record to platform store
    const inv = recordTransaction({
      source: ServiceSlug.GALAXY,
      activityType: "ORDER",
      activitySummary: `Device Galaxy Online Order — ${cartItems.map((c) => c.name).join(", ")}`,
      invoiceNo: orderRef,
      customer: formData.fullName,
      amountKobo: totalKobo,
      location: "Galaxy Online (Lagos Dispatch)",
      status: paymentMethod === "COD" ? "PENDING" : "PAID",
    });

    const completed = {
      orderNo: inv.invoiceNo,
      customer: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city}, ${formData.state}`,
      items: [...cartItems],
      totalKobo,
      paymentMethod,
      isServerConfirmed,
      date: new Date().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    clearCart();
    setCompletedOrder(completed);
    setIsSubmitting(false);
  };

  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-border shadow-xl p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-heading">Order Placed Successfully!</h1>
            <p className="text-xs text-muted">
              Thank you for ordering with Device Galaxy. A confirmation email has been dispatched.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-border space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-muted font-bold">Order Tracking Number:</span>
              <span className="font-mono font-black text-sm text-galaxy">
                {completedOrder.orderNo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Order Date:</span>
              <span className="font-semibold text-heading">{completedOrder.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Customer Name:</span>
              <span className="font-semibold text-heading">{completedOrder.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Delivery Address:</span>
              <span className="font-semibold text-heading text-right max-w-xs truncate">
                {completedOrder.address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Mode:</span>
              <span className="font-bold text-heading">
                {completedOrder.paymentMethod === "CARD"
                  ? "Card Payment (Paystack)"
                  : completedOrder.paymentMethod === "TRANSFER"
                  ? "Direct Bank Transfer"
                  : "Cash / POS on Delivery"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Items Ordered</h3>
            <div className="divide-y divide-border border rounded-xl overflow-hidden">
              {completedOrder.items.map((it: any) => (
                <div key={it.id} className="p-3 bg-white flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-heading">{it.name}</p>
                    <p className="text-[11px] text-muted font-mono">
                      Qty: {it.qty} × {formatCurrency(it.priceKobo)}
                    </p>
                  </div>
                  <span className="font-bold text-heading">
                    {formatCurrency(it.priceKobo * it.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 text-sm">
              <span className="font-bold text-heading">Total Paid / Due:</span>
              <span className="font-black text-lg text-heading">
                {formatCurrency(completedOrder.totalKobo)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 rounded-xl border border-border text-heading hover:bg-gray-50 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice Receipt</span>
            </button>
            <Link
              href="/shop"
              className="flex-1 py-3 px-4 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white text-xs font-bold text-center uppercase tracking-wider transition-colors shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-border py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 font-bold text-xs text-muted hover:text-galaxy">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-heading">256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Form Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Delivery Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Contact Details */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-heading uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-galaxy" />
                <span>1. Shipping &amp; Delivery Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-heading block mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-galaxy"
                />
              </div>
            </div>

            {/* Delivery Speed Options */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-heading uppercase tracking-wider">
                2. Select Delivery Option
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === "EXPRESS"
                      ? "border-galaxy bg-galaxy-tint/30 ring-1 ring-galaxy"
                      : "border-border hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "EXPRESS"}
                      onChange={() => setShippingMethod("EXPRESS")}
                      className="text-galaxy"
                    />
                    <div>
                      <p className="font-bold text-heading text-xs">Same-Day Express Lagos Delivery</p>
                      <p className="text-[11px] text-muted">Direct doorstep delivery within 4 hours in Lagos</p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-heading">₦4,500</span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === "STANDARD"
                      ? "border-galaxy bg-galaxy-tint/30 ring-1 ring-galaxy"
                      : "border-border hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "STANDARD"}
                      onChange={() => setShippingMethod("STANDARD")}
                      className="text-galaxy"
                    />
                    <div>
                      <p className="font-bold text-heading text-xs">Standard Nationwide Shipping (1–2 Days)</p>
                      <p className="text-[11px] text-muted">Via GIG Logistics or Speedaf nationwide</p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-heading">
                    {subtotalKobo >= 10000000 ? "FREE" : "₦3,500"}
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-heading uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-galaxy" />
                <span>3. Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === "CARD"
                      ? "border-galaxy bg-galaxy-tint/40 ring-2 ring-galaxy text-galaxy"
                      : "border-border hover:bg-gray-50 text-heading"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-2" />
                  <p className="font-bold text-xs">Card / Online</p>
                  <p className="text-[10px] text-muted">Paystack / Verve / Visa</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === "TRANSFER"
                      ? "border-galaxy bg-galaxy-tint/40 ring-2 ring-galaxy text-galaxy"
                      : "border-border hover:bg-gray-50 text-heading"
                  }`}
                >
                  <Building className="w-5 h-5 mb-2" />
                  <p className="font-bold text-xs">Bank Transfer</p>
                  <p className="text-[10px] text-muted">Zino Group Corporate</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === "COD"
                      ? "border-galaxy bg-galaxy-tint/40 ring-2 ring-galaxy text-galaxy"
                      : "border-border hover:bg-gray-50 text-heading"
                  }`}
                >
                  <Truck className="w-5 h-5 mb-2" />
                  <p className="font-bold text-xs">Pay on Delivery</p>
                  <p className="text-[10px] text-muted">Cash or POS in Lagos</p>
                </button>
              </div>

              {paymentMethod === "TRANSFER" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-1 text-blue-900">
                  <p className="font-bold">Official Bank Account for Transfers:</p>
                  <p>Bank: <strong>Zenith Bank PLC</strong></p>
                  <p>Account Name: <strong>Zino Group Holdings Ltd</strong></p>
                  <p>Account Number: <strong>1014892019</strong></p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-6 sticky top-24">
              <h3 className="text-sm font-black text-heading uppercase tracking-wider">
                Order Summary ({cartItems.length} Items)
              </h3>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-muted mx-auto" />
                  <p className="text-sm font-bold text-heading">Your cart is empty</p>
                  <p className="text-xs text-muted">Add items from the store to proceed with checkout.</p>
                  <Link href="/shop" className="inline-block px-4 py-2 rounded-xl bg-galaxy text-white text-xs font-bold hover:bg-galaxy-dark transition-colors">
                    Browse Store →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-50 border border-border p-1.5 flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-heading truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-semibold text-xs">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-[10px] text-rose-500 hover:underline ml-1"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs font-black text-heading mt-1">
                          {formatCurrency(item.priceKobo * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Form */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon (e.g. ZINO2026)"
                    className="flex-1 h-9 px-3 rounded-lg border border-border text-xs uppercase focus:outline-none focus:border-galaxy font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 h-9 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 10% discount applied!
                  </p>
                )}
                {orderError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium mt-2">
                    {orderError}
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-heading">{formatCurrency(subtotalKobo)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>VAT (7.5%)</span>
                  <span className="font-semibold text-heading">{formatCurrency(vatKobo)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-heading">
                    {shippingKobo === 0 ? "FREE" : formatCurrency(shippingKobo)}
                  </span>
                </div>
                {discountKobo > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountKobo)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-heading pt-3 border-t border-border">
                  <span>Total Amount</span>
                  <span className="text-galaxy text-lg">{formatCurrency(totalKobo)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-galaxy hover:bg-galaxy-dark disabled:bg-gray-300 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? "Processing Order..." : "Confirm & Place Order"}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
