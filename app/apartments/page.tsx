"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";

interface RoomTypeSeed {
  slug: string;
  name: string;
  basePriceKobo: number;
  adults: number;
  children: number;
  image: string;
  amenities: string[];
}

export default function ZinoApartmentsPublicPage() {
  const { products, recordTransaction } = usePlatformStore();
  const [checkIn, setCheckIn] = useState("2026-11-19");
  const [checkOut, setCheckOut] = useState("2026-11-22");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [bookingBanner, setBookingBanner] = useState<string | null>(null);

  const storeApartmentRooms: RoomTypeSeed[] = products
    .filter((p) => p.source === ServiceSlug.APARTMENTS && p.status !== "INACTIVE")
    .map((p) => ({
      slug: p.id,
      name: p.name,
      basePriceKobo: p.priceKobo || 3000000,
      adults: 2,
      children: 1,
      image: p.imageUrl,
      amenities: p.amenities || [p.label || "Executive Suite", "24/7 Power", "High-Speed WiFi"],
    }));

  // Exact 5 Seed Room Types from spec with 10% tax (merged with Admin Dashboard items)
  const defaultRooms: RoomTypeSeed[] = [
    {
      slug: "classic-studio",
      name: "Classic Studio",
      basePriceKobo: 1000000, // ₦10,000
      adults: 1,
      children: 0,
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80",
      amenities: ["Air Conditioner", "Small Heater", "High-Speed WiFi"],
    },
    {
      slug: "compact-studio",
      name: "Compact Studio",
      basePriceKobo: 2000000, // ₦20,000
      adults: 2,
      children: 1,
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80",
      amenities: ["Air Conditioner", "Kitchen", "Heater", "WiFi"],
    },
    {
      slug: "deluxe-studio",
      name: "Deluxe Studio",
      basePriceKobo: 3000000, // ₦30,000
      adults: 2,
      children: 1,
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
      amenities: ["Air Conditioner", "Full Kitchen", "Big Heater", "Smart TV"],
    },
    {
      slug: "executive-1-bedroom",
      name: "Executive 1-Bedroom",
      basePriceKobo: 4000000, // ₦40,000
      adults: 2,
      children: 2,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
      amenities: ["Private Sitout", "Air Conditioner", "Kitchen", "Bath Heater"],
    },
    {
      slug: "luxury-2-bedroom",
      name: "Luxury 2-Bedroom Suite",
      basePriceKobo: 5000000, // ₦50,000
      adults: 4,
      children: 2,
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80",
      amenities: ["Spacious Sitout", "AC in all rooms", "Executive Kitchen", "2 En-suite Baths"],
    },
  ];

  const rooms = storeApartmentRooms.length > 0 ? storeApartmentRooms : defaultRooms;

  // FAQ Items from spec
  const faqs = [
    { q: "What are the check-in and check-out times?", a: "Standard check-in begins at 23:00 (11:00 PM) and check-out is by 10:00 AM." },
    { q: "Is electricity 24 hours uninterrupted?", a: "Yes, we provide 24/7 uninterrupted power backed by high-capacity silent industrial generators and solar inverters." },
    { q: "How is the tax calculated on room bookings?", a: "A 10% statutory accommodation tax is applied on the base rate." },
    { q: "What is your cancellation policy?", a: "Free cancellation is available up to 24 hours prior to scheduled arrival." },
    { q: "Is high-speed internet included?", a: "Yes, high-speed fiber internet WiFi is provided complimentary in all apartments." },
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = recordTransaction({
      source: ServiceSlug.APARTMENTS,
      activityType: "BOOKING",
      activitySummary: `Apartment Availability Reservation (${checkIn} → ${checkOut}, ${adults} Adults)`,
      customer: "Website Guest",
      amountKobo: 3300000,
      location: "Zino Apartments Main",
      status: "CONFIRMED",
    });
    setBookingBanner(`Reservation ${inv.invoiceNo} confirmed & logged to Unified Admin Dashboard!`);
    setTimeout(() => setBookingBanner(null), 4000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden max-w-full">
      {bookingBanner && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bookingBanner}</span>
        </div>
      )}
      {/* Top Strip */}
      <div className="bg-[#1A1A2E] text-white text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-apartments-accent" />
              <span>+234 80 60797058</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-apartments-accent" />
              <span>reservations@zinoapartments.com</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
            <Link href="/admin/apartments" className="text-apartments-accent font-bold hover:underline">
              Hotel Admin Workspace →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/apartments" className="flex items-center gap-3 group">
            <div className="w-12 h-10 rounded-xl bg-white border border-apartments/20 p-1 flex items-center justify-center shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
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
              <span className="font-serif font-black text-heading text-xl tracking-tight block leading-tight">
                ZINO APARTMENTS
              </span>
              <span className="text-[10px] text-muted font-bold tracking-widest uppercase block">
                Luxury Serviced Living · Lekki
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-heading">
            <Link href="/apartments" className="text-apartments">Home</Link>
            <a href="#rooms" className="hover:text-apartments transition-colors">Rooms & Suites</a>
            <a href="#features" className="hover:text-apartments transition-colors">Amenities</a>
            <a href="#faq" className="hover:text-apartments transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-apartments transition-colors">Sign in</Link>
          </nav>
        </div>
      </header>

      {/* Hero Slider & Booking Widget */}
      <section className="relative bg-slate-900 text-white py-20 px-4 sm:px-8 overflow-hidden">
        {/* Background photo overlay */}
        <div className="absolute inset-0 z-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-0" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-apartments-accent text-white font-bold text-[10px] uppercase tracking-wider">
              A Warm Welcome in Lekki Phase 1
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              Spend Your Beautiful Moment in Comfort.
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
              Every room type features high-speed fiber internet, chef-grade kitchens, smart entertainment, and 24-hour executive hospitality security.
            </p>
          </div>

          {/* Booking Widget Card matching Spec */}
          <div className="lg:col-span-5 bg-white text-heading rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-heading mb-4">Book Your Stay</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                    Check In
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                    Check Out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted">
                Statutory accommodation tax: <strong className="text-heading">+10%</strong> calculated automatically.
              </p>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-apartments-accent hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>CHECK AVAILABILITY</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Rooms Grid (5 Seed Rooms) */}
      <section id="rooms" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-apartments-accent uppercase tracking-wider">
            Curated Accommodations
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-heading mt-1">
            Featured Rooms & Suites
          </h2>
          <p className="text-xs text-muted mt-2">
            Every room type has multiple units. Guests can send booking requests directly from this portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const taxKobo = Math.round(room.basePriceKobo * 0.1);
            const totalPerNightKobo = room.basePriceKobo + taxKobo;

            return (
              <div
                key={room.slug}
                className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs font-bold text-heading text-xs shadow-xs">
                      {room.adults} Adults · {room.children} Child
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-serif font-bold text-xl text-heading">
                      {room.name}
                    </h3>

                    {/* Price with 10% tax note */}
                    <div>
                      <span className="text-xl font-black text-apartments-accent">
                        {formatCurrency(room.basePriceKobo)}
                      </span>
                      <span className="text-xs text-muted font-normal ml-1">/ night (+10% tax)</span>
                    </div>

                    {/* Amenities pills */}
                    <div className="flex items-center flex-wrap gap-1.5 pt-2">
                      {room.amenities.map((am) => (
                        <span
                          key={am}
                          className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      const inv = recordTransaction({
                        source: ServiceSlug.APARTMENTS,
                        activityType: "BOOKING",
                        activitySummary: `Room Booking — ${room.name} (incl. 10% tax)`,
                        customer: "Apartments Portal Guest",
                        amountKobo: totalPerNightKobo,
                        location: "Zino Apartments Main",
                        status: "CONFIRMED",
                      });
                      setBookingBanner(
                        `Booked ${room.name} (${inv.invoiceNo}) for ${formatCurrency(totalPerNightKobo)} — synced to Admin Dashboard!`
                      );
                      setTimeout(() => setBookingBanner(null), 4000);
                    }}
                    className="w-full py-2.5 rounded-xl border-2 border-apartments-accent text-apartments-accent hover:bg-apartments-accent hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="bg-gray-50 py-16 px-4 sm:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted mt-1">
              Everything you need to know about your reservation and stay.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="bg-white p-4 rounded-xl border border-border shadow-2xs group cursor-pointer"
              >
                <summary className="font-bold text-heading list-none flex items-center justify-between">
                  <span>{f.q}</span>
                  <ChevronDown className="w-4 h-4 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-muted mt-2 pt-2 border-t border-border/50 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] text-gray-400 py-8 px-4 sm:px-8 text-xs border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <Image
                src="/logos/apartments-logo.png"
                alt="Zino Luxury Apartments Logo"
                width={70}
                height={50}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-white">Zino Luxury Apartments</span>
          </div>
          <p>© 2026 Zino Service Apartment · Member of Zino Group Unified Platform</p>
        </div>
      </footer>
    </div>
  );
}
