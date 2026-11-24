"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  ShieldCheck,
  Sparkles,
  User,
  KeyRound,
  Phone,
} from "lucide-react";
import { usePlatformStore } from "@/lib/platform-store";
import { ServiceSlug } from "@/lib/constants";
import { formatCurrency } from "@/lib/money";

export default function ApartmentBookingPassPage() {
  const params = useParams<{ ref: string }>();
  const bookingRef = decodeURIComponent(params?.ref || "ZINO-PASS").toUpperCase();
  const { invoices } = usePlatformStore();

  const matchedBooking = useMemo(() => {
    return invoices.find(
      (inv) =>
        inv.source === ServiceSlug.APARTMENTS &&
        (inv.invoiceNo.toUpperCase() === bookingRef ||
          inv.activitySummary.toUpperCase().includes(bookingRef))
    );
  }, [invoices, bookingRef]);

  const guestName = matchedBooking?.customer || "Verified Zino Guest";
  const suiteName = matchedBooking?.activitySummary
    ? matchedBooking.activitySummary.replace(/^Instant Guest Reservation ·\s*/i, "")
    : "Deluxe Studio Suite · Lekki Phase 1";
  const amountDisplay = matchedBooking
    ? formatCurrency(matchedBooking.amountKobo)
    : "₦55,000.00";
  const bookingDate = matchedBooking?.createdAt || new Date().toISOString().slice(0, 10);
  const status = matchedBooking?.status || "CONFIRMED";

  // Deterministic pseudo-QR grid based on bookingRef
  const qrCells = useMemo(() => {
    const seed = bookingRef.split("").reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 7), 17);
    const cells: boolean[] = [];
    for (let i = 0; i < 64; i++) {
      const r = Math.floor(i / 8);
      const c = i % 8;
      // Corner finder markers
      if ((r < 2 && c < 2) || (r < 2 && c > 5) || (r > 5 && c < 2)) {
        cells.push(true);
      } else {
        cells.push(((seed * (i + 3) + r * 13 + c * 29) % 11) > 4);
      }
    }
    return cells;
  }, [bookingRef]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/apartments"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Zino Apartments</span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Pass (PDF)</span>
          </button>
        </div>

        {/* Boarding Pass Card */}
        <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B0F19] via-[#151D30] to-[#0B0F19] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-amber-500">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zino Luxury Apartments · Digital Check-In Pass</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{bookingRef}</h1>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold self-start sm:self-center">
              <CheckCircle2 className="w-4 h-4" />
              <span>{status}</span>
            </div>
          </div>

          {/* Body Details */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reserved Suite
                </p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{suiteName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Guest Name
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{guestName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-In Date
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{bookingDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Check-In / Check-Out
                  </p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    2:00 PM / 12:00 PM
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Amount Paid
                  </p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">{amountDisplay}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Refundable Caution Deposit Policy</span>
                </p>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  A refundable ₦20,000 caution deposit is verified at reception and returned upon checkout inspection. Present valid government-issued ID alongside this pass.
                </p>
              </div>
            </div>

            {/* Scannable QR Verification Block */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
              <div
                aria-label={`QR verification code for ${bookingRef}`}
                className="grid grid-cols-8 gap-1 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs"
              >
                {qrCells.map((filled, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-[2px] ${filled ? "bg-slate-900" : "bg-transparent"}`}
                  />
                ))}
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  Front Desk Scan
                </p>
                <p className="text-xs font-mono font-extrabold text-slate-900">{bookingRef}</p>
              </div>
            </div>
          </div>

          {/* Footer Location & Concierge */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Lekki Phase 1, Lagos, Nigeria
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              24/7 Concierge: +234 810 004 4228
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
