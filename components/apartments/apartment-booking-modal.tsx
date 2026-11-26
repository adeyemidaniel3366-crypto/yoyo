"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  CreditCard,
  Building,
  ShieldCheck,
  Printer,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import {
  ApartmentSuite,
  ApartmentBooking,
  saveApartmentBooking,
} from "@/lib/apartments-data";
import { usePlatformStore } from "@/lib/platform-store";
import { ServiceSlug } from "@/lib/constants";
import { formatCurrency } from "@/lib/money";
import { NumberInput } from "@/components/ui/number-input";

interface ApartmentBookingModalProps {
  suite: ApartmentSuite | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  onClose: () => void;
  onBookingSuccess?: (booking: ApartmentBooking) => void;
}

export function ApartmentBookingModal({
  suite,
  initialCheckIn = "2026-11-20",
  initialCheckOut = "2026-11-23",
  initialAdults = 2,
  initialChildren = 0,
  onClose,
  onBookingSuccess,
}: ApartmentBookingModalProps) {
  const { recordTransaction } = usePlatformStore();
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "PAYSTACK_CARD" | "BANK_TRANSFER" | "PAY_ON_ARRIVAL"
  >("PAYSTACK_CARD");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] =
    useState<ApartmentBooking | null>(null);
  const [paymentAuthUrl, setPaymentAuthUrl] = useState<string | null>(null);

  if (!suite) return null;

  // Calculate nights
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const diffTime = dOut.getTime() - dIn.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const nights = isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;

  // Financial math
  const baseAmountKobo = suite.basePriceKobo * nights;
  const taxKobo = Math.round(baseAmountKobo * 0.1); // 10% statutory accommodation tax
  const cautionDepositKobo = suite.cautionDepositKobo;
  const totalKobo = baseAmountKobo + taxKobo + cautionDepositKobo;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) return;

    setIsSubmitting(true);

    let ref = `ZA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    let isServerConfirmed = false;
    let assignedRoom = `Suite ${Math.floor(101 + Math.random() * 30)}`;

    try {
      const res = await fetch("/api/apartments/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: suite.id,
          roomTypeSlug: suite.slug,
          checkIn,
          checkOut,
          adults: Number(adults),
          children: Number(children),
          rooms: 1,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          guestPhone: guestPhone.trim(),
          specialRequests: specialRequests.trim() || null,
          payNow: paymentMethod === "PAYSTACK_CARD",
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData?.ok && resData?.data) {
          ref = resData.data.ref || ref;
          if (resData.data.room?.number) {
            assignedRoom = `Suite ${resData.data.room.number}`;
          }
          if (resData.data.payment?.authorizationUrl) {
            setPaymentAuthUrl(resData.data.payment.authorizationUrl);
          }
          isServerConfirmed = true;
        }
      }
    } catch {
      // Offline / demo reservation mode
    }

    const initialStatus =
      paymentMethod === "PAY_ON_ARRIVAL"
        ? "PENDING_ARRIVAL"
        : "CONFIRMED";

    const newBooking: ApartmentBooking = {
      id: `bkg_${Date.now()}`,
      bookingRef: ref,
      suiteId: suite.id,
      suiteName: suite.name,
      suiteImage: suite.image,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      baseAmountKobo,
      taxKobo,
      cautionDepositKobo,
      totalKobo,
      paymentMethod,
      paymentStatus: initialStatus,
      specialRequests: specialRequests.trim() || undefined,
      roomNumber: assignedRoom,
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    saveApartmentBooking(newBooking);

    // Sync with Unified Platform Store & Admin ledger
    recordTransaction({
      source: ServiceSlug.APARTMENTS,
      activityType: "BOOKING",
      activitySummary: `Reserved ${suite.name} (${nights} nights, ${checkIn} → ${checkOut}) ${isServerConfirmed ? "[Verified API]" : "[Demo Mode]"}`,
      invoiceNo: ref,
      customer: guestName.trim(),
      amountKobo: totalKobo,
      location: "Zino Luxury Apartments (Lekki Phase 1)",
      status: initialStatus,
    });

    setIsSubmitting(false);
    setConfirmedBooking(newBooking);
    if (onBookingSuccess) onBookingSuccess(newBooking);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmedBooking ? (
          /* ─── BOOKING CONFIRMATION VOUCHER ─── */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Reservation Confirmed!
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Booking Reference:{" "}
                <strong className="text-indigo-600 font-bold text-sm">
                  {confirmedBooking.bookingRef}
                </strong>
              </p>
              {paymentAuthUrl && (
                <div className="pt-2">
                  <a
                    href={paymentAuthUrl}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <span>Complete Online Payment Checkout</span>
                  </a>
                </div>
              )}
            </div>

            {/* Voucher Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 font-mono text-xs">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {confirmedBooking.suiteName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Zino Luxury Serviced Living · Lekki Phase 1, Lagos
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {confirmedBooking.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block uppercase">Check-In</span>
                  <span className="font-bold text-slate-800">
                    {confirmedBooking.checkIn}
                  </span>
                  <span className="text-[10px] text-slate-400 block">From 2:00 PM</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Check-Out</span>
                  <span className="font-bold text-slate-800">
                    {confirmedBooking.checkOut}
                  </span>
                  <span className="text-[10px] text-slate-400 block">By 11:00 AM</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Duration</span>
                  <span className="font-bold text-slate-800">
                    {confirmedBooking.nights} Night(s)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Guests</span>
                  <span className="font-bold text-slate-800">
                    {confirmedBooking.adults} Adults
                    {confirmedBooking.children > 0 && `, ${confirmedBooking.children} Kids`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Charge ({confirmedBooking.nights} nights):</span>
                  <span>{formatCurrency(confirmedBooking.baseAmountKobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>10% Lagos Accommodation Tax:</span>
                  <span>{formatCurrency(confirmedBooking.taxKobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Caution Deposit:</span>
                  <span>{formatCurrency(confirmedBooking.cautionDepositKobo)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">
                    {formatCurrency(confirmedBooking.totalKobo)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>
                  <strong>Guest:</strong> {confirmedBooking.guestName} (
                  {confirmedBooking.guestPhone})
                </p>
                <p>
                  <strong>Assigned:</strong> {confirmedBooking.roomNumber}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {confirmedBooking.paymentMethod.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ─── BOOKING RESERVATION FORM ─── */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">
                  Reserve Suite
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {suite.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {formatCurrency(suite.basePriceKobo)} / night (+10% tax)
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              {/* Dates & Guests Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-600 block">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-600 block">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-600 block">
                    Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Adult{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-600 block">
                    Children
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} Child{num > 1 ? "ren" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Guest Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daniel Adeyemi"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 80 1234 5678"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Early check-in, extra towels, airport pickup"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Select Payment Option
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "PAYSTACK_CARD"
                        ? "bg-amber-50 border-amber-500 text-slate-900 font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "PAYSTACK_CARD"}
                      onChange={() => setPaymentMethod("PAYSTACK_CARD")}
                      className="sr-only"
                    />
                    <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Instant Card</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-amber-50 border-amber-500 text-slate-900 font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      className="sr-only"
                    />
                    <Building className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bank Transfer</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "PAY_ON_ARRIVAL"
                        ? "bg-amber-50 border-amber-500 text-slate-900 font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "PAY_ON_ARRIVAL"}
                      onChange={() => setPaymentMethod("PAY_ON_ARRIVAL")}
                      className="sr-only"
                    />
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Pay on Arrival</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {formatCurrency(suite.basePriceKobo)} × {nights} Night(s):
                  </span>
                  <span>{formatCurrency(baseAmountKobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>10% Lagos Accommodation Tax:</span>
                  <span>{formatCurrency(taxKobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Caution Deposit:</span>
                  <span>{formatCurrency(cautionDepositKobo)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-amber-200">
                  <span>Total Amount Payable:</span>
                  <span className="text-amber-700">
                    {formatCurrency(totalKobo)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Reservation...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Book Suite ({formatCurrency(totalKobo)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
