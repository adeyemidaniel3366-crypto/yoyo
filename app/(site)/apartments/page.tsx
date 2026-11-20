"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  Search,
  CheckCircle2,
  Tv,
  Wifi,
  Wind,
  Coffee,
  Shield,
  Car,
  Dumbbell,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  Star,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import {
  ApartmentSuite,
  getApartmentSuites,
  DEFAULT_APARTMENT_SUITES,
} from "@/lib/apartments-data";
import { ApartmentBookingModal } from "@/components/apartments/apartment-booking-modal";

export default function ZinoApartmentsPublicPage() {
  const { products } = usePlatformStore();
  const [suites, setSuites] = useState<ApartmentSuite[]>(DEFAULT_APARTMENT_SUITES);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeBookingSuite, setActiveBookingSuite] = useState<ApartmentSuite | null>(null);

  // Search parameters
  const [checkIn, setCheckIn] = useState("2026-11-20");
  const [checkOut, setCheckOut] = useState("2026-11-23");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load suites from localStorage and unified store
  const refreshSuites = () => {
    const local = getApartmentSuites();
    // Also include any apartment products added via unified admin
    const storeApartments = products.filter(
      (p) => p.source === ServiceSlug.APARTMENTS && p.status !== "INACTIVE"
    );

    const merged: ApartmentSuite[] = [...local];
    storeApartments.forEach((p) => {
      if (!merged.some((s) => s.id === p.id || s.slug === p.sku?.toLowerCase())) {
        merged.push({
          id: p.id,
          slug: p.sku ? p.sku.toLowerCase().replace(/[^a-z0-9]/g, "-") : p.id,
          name: p.name,
          subtitle: p.label || "Serviced Luxury Apartment",
          category: (p.name.includes("2-Bedroom")
            ? "2-Bedroom"
            : p.name.includes("1-Bedroom")
            ? "1-Bedroom"
            : p.name.includes("Penthouse")
            ? "Penthouse"
            : "Studio") as ApartmentSuite["category"],
          basePriceKobo: p.priceKobo || 3000000,
          taxPct: 10,
          cautionDepositKobo: 2000000,
          adults: 2,
          children: 1,
          bedrooms: 1,
          bathrooms: 1,
          bedType: "1 King-Size Bed (6x6)",
          sizeSqm: 65,
          floor: "2nd Floor",
          view: "Lekki Skyline View",
          image: p.imageUrl,
          gallery: p.images || [p.imageUrl],
          amenities: p.amenities || ["AC", "Kitchen", "WiFi", "Bath Heater"],
          description: p.description || p.label || "Luxury apartment in Lekki Phase 1.",
          sleepingArrangements: [{ room: "Master Bedroom", bed: "1 King-Size Bed" }],
          rules: ["Check-in: 2:00 PM", "Check-out: 11:00 AM", "Refundable deposit required"],
          availableUnits: p.totalStock || 4,
          featured: p.isFeatured ?? true,
        });
      }
    });

    setSuites(merged);
  };

  useEffect(() => {
    refreshSuites();
    const handleUpdate = () => refreshSuites();
    window.addEventListener("zino_apartments_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("zino_apartments_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [products]);

  const categories = [
    { id: "ALL", label: "All Suites" },
    { id: "Studio", label: "Studio Suites" },
    { id: "1-Bedroom", label: "1-Bedroom" },
    { id: "2-Bedroom", label: "2-Bedroom" },
    { id: "Penthouse", label: "Penthouses" },
  ];

  const filteredSuites = suites.filter((s) => {
    const matchesCategory =
      selectedCategory === "ALL" ? true : s.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.amenities.some((a) => a.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  // Calculate nights
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const diffTime = dOut.getTime() - dIn.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const nights = isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-amber-500/40 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── BOOKING MODAL ─── */}
      {activeBookingSuite && (
        <ApartmentBookingModal
          suite={activeBookingSuite}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialAdults={adults}
          initialChildren={children}
          onClose={() => setActiveBookingSuite(null)}
          onBookingSuccess={(booking) => {
            setToastMessage(`Booking ${booking.bookingRef} successfully confirmed!`);
            setTimeout(() => setToastMessage(null), 5000);
          }}
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
            <a href="#location" className="hover:text-amber-600 transition-colors">
              Location
            </a>
            <a href="#faq" className="hover:text-amber-600 transition-colors">
              FAQ
            </a>
            <Link href="/login" className="hover:text-amber-600 transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#rooms"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold shadow-sm hover:shadow transition-all"
            >
              <span>Book a Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── HERO & AVAILABILITY SEARCH WIDGET ─── */}
      <section className="relative bg-slate-900 text-white py-20 px-4 sm:px-8 overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-slate-900 to-slate-950 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LEKKI PHASE 1 · LAGOS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              Luxury Serviced Apartments with 24/7 Power &amp; Private Sitouts.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience premier hospitality in the heart of Lekki. Fully furnished
              executive suites with gourmet kitchens, fiber WiFi, dual generator
              backup, and concierge services.
            </p>
          </div>

          {/* Interactive Date & Guest Availability Search Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
              {/* Check-In */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Check-In
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Check-Out */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Check-Out
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Adults */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Adults
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
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
              </div>

              {/* Children */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Children
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
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

              {/* Search Action / Status */}
              <div className="h-full flex flex-col justify-center">
                <a
                  href="#rooms"
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Search className="w-4 h-4" />
                  <span>View Available Suites ({nights}N)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── APARTMENTS SUITES LISTING ─── */}
      <section id="rooms" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">
              Curated Living
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Executive Suites &amp; Apartments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All suites include 10% statutory accommodation tax, complimentary fiber
              WiFi, and daily housekeeping.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Counter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by suite name or amenity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div className="text-xs font-mono text-slate-500">
            Showing <strong>{filteredSuites.length}</strong> available suite types in
            Lekki
          </div>
        </div>

        {/* ─── APARTMENTS GRID (EXACT MATCH WITH USER SCREENSHOT) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSuites.map((suiteItem) => (
            <div
              key={suiteItem.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Container */}
                <div className="relative aspect-[16/11] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={suiteItem.image}
                    alt={suiteItem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-slate-800 shadow-xs border border-white/40">
                      {suiteItem.category}
                    </span>
                    {suiteItem.featured && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {suiteItem.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                      {suiteItem.subtitle}
                    </p>
                  </div>

                  {/* Nightly Price with Tax Tag */}
                  <div>
                    <span className="text-2xl font-black font-mono text-amber-600">
                      {formatCurrency(suiteItem.basePriceKobo)}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {" "}
                      / night (+10% tax)
                    </span>
                  </div>

                  {/* Amenities Badges (Sitout, AC, Kitchen, Bath Heater, etc.) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {suiteItem.amenities.slice(0, 4).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                      >
                        {amenity}
                      </span>
                    ))}
                    {suiteItem.amenities.length > 4 && (
                      <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-mono">
                        +{suiteItem.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: BOOK NOW & VIEW DETAILS */}
              <div className="p-6 pt-0 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setActiveBookingSuite(suiteItem)}
                  className="w-full py-3.5 rounded-2xl border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow text-center flex items-center justify-center gap-2"
                >
                  <span>BOOK NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href={`/apartments/${suiteItem.slug}`}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors text-center block"
                >
                  View Full Suite Details &amp; Gallery →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AMENITIES HIGHLIGHTS SECTION ─── */}
      <section id="amenities" className="py-20 px-4 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">
              The Zino Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              Unrivalled Comfort &amp; Modern Luxury
            </h2>
            <p className="text-sm text-slate-500">
              Engineered from the ground up for discerning guests who expect
              perfection in every stay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "24/7 Uninterrupted Electricity",
                desc: "High-capacity silent industrial Caterpillar generators and commercial solar inverters ensure zero power downtime.",
              },
              {
                icon: Wifi,
                title: "100Mbps Fiber WiFi",
                desc: "Dedicated fiber optic connection in every suite, perfectly suited for remote work, video calls, and 4K streaming.",
              },
              {
                icon: Coffee,
                title: "Fully Fitted Gourmet Kitchens",
                desc: "Every suite includes microwaves, refrigerators, electric stoves, blenders, and designer dining sets.",
              },
              {
                icon: Tv,
                title: "Smart 4K TVs with Netflix & DStv",
                desc: "Immersive entertainment in living lounges and bedrooms pre-loaded with premium streaming subscriptions.",
              },
              {
                icon: Car,
                title: "Free Dedicated Parking",
                desc: "Secure gated compound with allocated parking slots and 24-hour uniformed security guards.",
              },
              {
                icon: Clock,
                title: "Daily Housekeeping & Concierge",
                desc: "Professional housekeeping, laundry support, fresh linens, and front desk assistance around the clock.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── LOCATION & MAP OVERVIEW ─── */}
      <section id="location" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">
              Prime Location
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Heart of Lekki Phase 1, Lagos
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Walking distance to premier dining, nightlife, and business centers on
            Admiralty Way and Lekki Expressway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-xs font-mono text-amber-600 font-bold">
              5 Mins Away
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              Nike Art Gallery &amp; Lekki Arts Market
            </h4>
            <p className="text-xs text-slate-500">
              World-renowned Nigerian contemporary arts and cultural center.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-xs font-mono text-amber-600 font-bold">
              8 Mins Away
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              The Palms Shopping Mall
            </h4>
            <p className="text-xs text-slate-500">
              Cinema, international fashion brands, supermarkets, and fine dining.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-xs font-mono text-amber-600 font-bold">
              10 Mins Away
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              Landmark Beach &amp; Waterfront
            </h4>
            <p className="text-xs text-slate-500">
              Exclusive beach clubs, seaside restaurants, water sports, and events.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section id="faq" className="py-20 px-4 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">
              Guest Inquiries
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What are the standard check-in and check-out times?",
                a: "Check-in begins at 2:00 PM (14:00) and check-out is by 11:00 AM. Early check-in or delayed check-out can be arranged upon request.",
              },
              {
                q: "Is electricity 24 hours uninterrupted?",
                a: "Yes, we guarantee 100% 24/7 power backed by dual silent industrial generators and solar inverters.",
              },
              {
                q: "How is the tax and caution deposit computed?",
                a: "A 10% statutory Lagos State accommodation tax is applied on room charges. A refundable caution deposit (₦15,000–₦20,000 depending on suite type) is held and returned upon checkout after standard room inspection.",
              },
              {
                q: "Can I book and pay on arrival at the front desk?",
                a: "Yes! You can reserve your apartment online and select 'Pay on Arrival' to settle with card or cash at the front desk.",
              },
              {
                q: "Is parking safe and included?",
                a: "Yes, complimentary gated parking is provided inside the secure compound with 24/7 CCTV surveillance.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <h4 className="font-bold text-sm text-slate-900">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-t border-slate-800">
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
            <span>Zino Luxury Apartments · Lekki Phase 1, Lagos</span>
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
