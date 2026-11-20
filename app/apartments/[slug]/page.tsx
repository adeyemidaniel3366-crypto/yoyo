"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  Check,
  Star,
  MapPin,
  Shield,
  Wifi,
  Wind,
  Coffee,
  Tv,
  Bath,
  Clock,
  Car,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle2,
  Utensils,
  Maximize2,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import {
  ApartmentSuite,
  getApartmentSuites,
  DEFAULT_APARTMENT_SUITES,
} from "@/lib/apartments-data";
import { ApartmentBookingModal } from "@/components/apartments/apartment-booking-modal";
import { formatCurrency } from "@/lib/money";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function ApartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [suites, setSuites] = useState<ApartmentSuite[]>(DEFAULT_APARTMENT_SUITES);
  const [suite, setSuite] = useState<ApartmentSuite | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Reservation widget state
  const [checkIn, setCheckIn] = useState("2026-11-20");
  const [checkOut, setCheckOut] = useState("2026-11-23");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadedSuites = getApartmentSuites();
    setSuites(loadedSuites);
    const found = loadedSuites.find(
      (s) => s.slug === slug || s.id === slug || s.id === `apt_${slug}`
    );
    if (found) {
      setSuite(found);
    } else {
      // Fallback to first suite or default
      setSuite(loadedSuites[0] || DEFAULT_APARTMENT_SUITES[0]);
    }
  }, [slug]);

  if (!suite) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-500">Loading apartment details...</p>
        </div>
      </div>
    );
  }

  // Calculate nights
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const diffTime = dOut.getTime() - dIn.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const nights = isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;

  const baseTotal = suite.basePriceKobo * nights;
  const taxTotal = Math.round(baseTotal * 0.1);
  const cautionDeposit = suite.cautionDepositKobo;
  const grandTotal = baseTotal + taxTotal + cautionDeposit;

  const galleryImages =
    suite.gallery && suite.gallery.length > 0 ? suite.gallery : [suite.image];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ─── BOOKING MODAL ─── */}
      {isBookingModalOpen && (
        <ApartmentBookingModal
          suite={suite}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialAdults={adults}
          initialChildren={children}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}

      {/* ─── TOP LUXURY CONCIERGE STRIP ─── */}
      <div className="bg-[#0B0F19] text-white text-[11px] py-2 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          {/* Left: Contact Info with whitespace-nowrap */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono">
            <a
              href="tel:+2348060797058"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>+234 80 60797058</span>
            </a>
            <a
              href="mailto:reservations@zinoapartments.com"
              className="hidden md:inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>reservations@zinoapartments.com</span>
            </a>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Plot 14, Admiralty Way, Lekki Phase 1</span>
            </span>
          </div>

          {/* Right: Luxury Service Badge & Admin */}
          <div className="flex items-center gap-3 font-mono">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>24/7 Power &amp; Concierge</span>
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap transition-colors"
            >
              <span>Staff Login</span>
              <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── MAIN LUXURY HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-4">
          <Link href="/apartments" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/logos/apartments-logo.png"
                alt="Zino Luxury Apartments Logo"
                width={145}
                height={103}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-serif font-black text-slate-900 text-xl tracking-tight block leading-tight">
                ZINO APARTMENTS
              </span>
              <span className="text-[10px] text-amber-700 font-mono font-bold tracking-widest uppercase block mt-0.5">
                Luxury Serviced Living · Lekki
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono font-semibold text-slate-700">
            <Link href="/apartments" className="text-amber-600 font-bold hover:text-amber-700 transition-colors">
              All Suites
            </Link>
            <a href="#amenities" className="hover:text-amber-600 transition-colors">
              Amenities
            </a>
            <a href="#rules" className="hover:text-amber-600 transition-colors">
              House Rules
            </a>
            <Link href="/login" className="hover:text-amber-600 transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/apartments"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold shadow-sm hover:shadow transition-all"
            >
              <span>← All Suites</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── BREADCRUMBS & TITLE ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-4">
          <Link href="/apartments" className="hover:text-slate-900">
            Apartments
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">{suite.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                {suite.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.98</span>
                <span className="text-slate-400">· 42 verified reviews</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-900">
              {suite.name}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Apartment link copied to clipboard!");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                saved
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`}
              />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── PHOTO GALLERY ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 p-2">
          {/* Main Large Image */}
          <div className="md:col-span-8 relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200">
            <img
              src={galleryImages[activeImageIndex] || suite.image}
              alt={suite.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono">
              Photo {activeImageIndex + 1} of {galleryImages.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2 h-full">
            {galleryImages.slice(0, 4).map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activeImageIndex === i
                    ? "border-amber-500 scale-[0.98]"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2-COLUMN MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ─── LEFT COLUMN: DETAILS & SPECS (7 cols) ─── */}
          <div className="lg:col-span-7 space-y-10">
            {/* Quick Specs Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] block">
                  Capacity
                </span>
                <span className="font-bold text-slate-800">
                  {suite.adults} Adults
                  {suite.children > 0 && `, ${suite.children} Kids`}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] block">
                  Bedrooms
                </span>
                <span className="font-bold text-slate-800">
                  {suite.bedrooms} Bedroom(s)
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] block">
                  Bathrooms
                </span>
                <span className="font-bold text-slate-800">
                  {suite.bathrooms} Bath(s)
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] block">
                  Floor Area
                </span>
                <span className="font-bold text-slate-800">
                  {suite.sizeSqm} sqm
                </span>
              </div>
            </div>

            {/* Overview / Story */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                About this Luxury Suite
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {suite.description}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Located on the {suite.floor}, this apartment boasts magnificent{" "}
                {suite.view.toLowerCase()}. Guests enjoy private access with
                digital keycards, 24/7 uninterrupted power guaranteed by dual
                industrial generators, high-capacity water heating, and daily
                professional housekeeping.
              </p>
            </div>

            {/* Sleeping Arrangements */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Sleeping Arrangements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suite.sleepingArrangements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs"
                  >
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      {item.room}
                    </span>
                    <p className="text-xs text-slate-500">{item.bed}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Checklist */}
            <div id="amenities" className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Included Amenities &amp; Facilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Wind, name: "Air Conditioning in all rooms" },
                  { icon: Bath, name: "Water Heater in all bathrooms" },
                  { icon: Wifi, name: "High-Speed 100Mbps Fiber WiFi" },
                  { icon: Coffee, name: "Fitted Gourmet Kitchen & Microwave" },
                  { icon: Tv, name: "55\" 4K Smart TV with Netflix & DStv" },
                  { icon: Shield, name: "24/7 Power & Industrial Generator" },
                  { icon: Car, name: "Complimentary Secure Parking" },
                  { icon: Clock, name: "24/7 Front Desk Concierge" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800"
                    >
                      <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div id="rules" className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                House Rules &amp; Arrival Policies
              </h3>
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2.5 font-mono text-xs">
                {suite.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: STICKY BOOKING WIDGET (5 cols) ─── */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              {/* Rate Header */}
              <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {formatCurrency(suite.basePriceKobo)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono"> / night</span>
                </div>
                <span className="text-xs text-amber-700 font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">
                  +10% hotel tax
                </span>
              </div>

              {/* Date & Guest Selectors */}
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block uppercase">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-2">
                    <label className="text-[10px] text-slate-400 block uppercase">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block uppercase">
                      Adults
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} Adult{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-2">
                    <label className="text-[10px] text-slate-400 block uppercase">
                      Children
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n} Child{n > 1 ? "ren" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation Matrix */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {formatCurrency(suite.basePriceKobo)} × {nights} Night(s):
                  </span>
                  <span>{formatCurrency(baseTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>10% Lagos Accommodation Tax:</span>
                  <span>{formatCurrency(taxTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Caution Deposit:</span>
                  <span>{formatCurrency(cautionDeposit)}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-amber-700">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Reserve Button */}
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Reserve Apartment Now</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>

              <div className="space-y-2 text-center text-[11px] text-slate-500 font-mono">
                <p className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Free Cancellation up to 24 hours before check-in</span>
                </p>
                <p>Instant confirmation &amp; verified digital booking pass</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-8 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white p-1">
              <Image
                src="/logos/apartments-logo.png"
                alt="Zino Apartments"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span>Zino Luxury Apartments · Managed by Zino Hospitality</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/apartments" className="hover:text-white">
              All Suites
            </Link>
            <Link href="/login" className="hover:text-white">
              Staff Sign In
            </Link>
            <Link href="/" className="hover:text-white">
              Scene One Hub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
