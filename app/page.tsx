"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Building2,
  Smartphone,
  Cpu,
  Hammer,
  Receipt,
  UserCheck,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  BarChart3,
  Lock,
  Zap,
  Globe,
  TrendingUp,
  Shield,
  Package,
  ChevronDown,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG, PLATFORM_NAME } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

// ---------------------------------------------------------------------------
// Scroll Reveal Hook
// ---------------------------------------------------------------------------
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".scroll-reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ---------------------------------------------------------------------------
// Animated Counter Component
// ---------------------------------------------------------------------------
function AnimatedCounter({ target, suffix = "", duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{current.toLocaleString()}{suffix}</span>;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function HomePortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useScrollReveal();

  // 6 Services in LOCKED order
  const servicesList = [
    {
      slug: ServiceSlug.APARTMENTS,
      config: SERVICE_CONFIG[ServiceSlug.APARTMENTS],
      desc: "Luxury serviced apartments in Lekki, Lagos. Daily, weekly & monthly bookings with 24/7 power, security and hotel amenities.",
      links: [
        { label: "Book a Room", href: "/apartments" },
        { label: "View Room Types", href: "/apartments#rooms" },
        { label: "Check Availability", href: "/apartments#booking" },
      ],
      publicHref: "/apartments",
      badgeText: "Hospitality",
      Icon: Building2,
    },
    {
      slug: ServiceSlug.GALAXY,
      config: SERVICE_CONFIG[ServiceSlug.GALAXY],
      desc: "Electronics & gadgets e-commerce storefront. Fast nationwide delivery for laptops, smartphones, SSDs, and smart accessories.",
      links: [
        { label: "Shop Laptops", href: "/shop" },
        { label: "Shop Smartphones", href: "/shop" },
        { label: "Best Sellers", href: "/shop" },
      ],
      publicHref: "/shop",
      badgeText: "E-Commerce",
      Icon: Smartphone,
    },
    {
      slug: ServiceSlug.SPARK,
      config: SERVICE_CONFIG[ServiceSlug.SPARK],
      desc: "Multi-shop electronics retail & wholesale across Computer Village, Ikeja. Stock transfers, POS, and immediate pickup.",
      links: [
        { label: "Store Locations", href: "/spark" },
        { label: "Retail Deals", href: "/spark" },
        { label: "POS Terminal", href: "/admin/spark/pos" },
      ],
      publicHref: "/spark",
      badgeText: "Retail POS",
      Icon: Cpu,
    },
    {
      slug: ServiceSlug.BUILDERS,
      config: SERVICE_CONFIG[ServiceSlug.BUILDERS],
      desc: "Premium construction materials: Dangote & BUA cement, iron rods, roofing, tiles, and plumbing supplies in Lagos.",
      links: [
        { label: "Materials Catalog", href: "/builders" },
        { label: "Daily Sales Book", href: "/admin/builders/sales" },
        { label: "Request a Quote", href: "/builders#contact" },
      ],
      publicHref: "/builders",
      badgeText: "Construction",
      Icon: Hammer,
    },
    {
      slug: ServiceSlug.BILLSTACKS,
      config: SERVICE_CONFIG[ServiceSlug.BILLSTACKS],
      desc: "SaaS invoicing, automated expense tracking, recurring bills, and financial accounting for growing businesses.",
      links: [
        { label: "Create Invoice", href: "/admin/billstacks/invoices" },
        { label: "See Pricing Plans", href: "/billstacks" },
        { label: "Platform Features", href: "/billstacks" },
      ],
      publicHref: "/billstacks",
      badgeText: "Accounting",
      Icon: Receipt,
    },
    {
      slug: ServiceSlug.VISITORS,
      config: SERVICE_CONFIG[ServiceSlug.VISITORS],
      desc: "Enterprise visitor registration, badge issuance, employee attendance, and security front-desk kiosk.",
      links: [
        { label: "Pre-Register Visit", href: "/visit" },
        { label: "Self Check-In Kiosk", href: "/visit" },
        { label: "Employee Clock-In", href: "/admin/visitors/attendance" },
      ],
      publicHref: "/visit",
      badgeText: "Front Desk",
      Icon: UserCheck,
    },
  ];

  const featuredRooms = [
    {
      name: "Classic Studio",
      priceKobo: 1000000,
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80",
      capacity: "1 Adult",
      amenities: ["AC", "Heater", "WiFi"],
      slug: "classic-studio",
    },
    {
      name: "Deluxe Studio",
      priceKobo: 3000000,
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
      capacity: "2 Adults",
      amenities: ["AC", "Kitchen", "Smart TV"],
      slug: "deluxe-studio",
    },
    {
      name: "Luxury 2-Bedroom",
      priceKobo: 5000000,
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80",
      capacity: "4 Adults",
      amenities: ["Sitout", "AC", "Kitchen", "Bath Heater"],
      slug: "luxury-2-bedroom",
    },
  ];

  const bestSellers = [
    {
      name: "Samsung 990 PRO 4TB NVMe SSD",
      priceKobo: 48000000,
      originalKobo: 52000000,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80",
      rating: 5,
      slug: "samsung-990-pro-4tb",
    },
    {
      name: "Apple MacBook Pro 16\" M3 Max",
      priceKobo: 485000000,
      originalKobo: 510000000,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
      rating: 5,
      slug: "macbook-pro-16-m3-max",
    },
    {
      name: "Synology 8 Bay Rackstation RS1221RP+",
      priceKobo: 245000000,
      originalKobo: 260000000,
      image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&auto=format&fit=crop&q=80",
      rating: 5,
      slug: "synology-8-bay-rs1221rp",
    },
    {
      name: "Lexar SL500 Portable SSD 2TB",
      priceKobo: 22000000,
      originalKobo: 25000000,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=80",
      rating: 5,
      slug: "lexar-sl500-2tb",
    },
  ];

  const articles = [
    {
      source: ServiceSlug.APARTMENTS,
      title: "Top 5 Amenities to Expect at Zino Luxury Apartments",
      date: "14 Nov 2026",
      excerpt: "From 24-hour uninterrupted solar power to high-speed fiber internet and executive concierge...",
      href: "/apartments",
    },
    {
      source: ServiceSlug.GALAXY,
      title: "Gen5 vs Gen4 NVMe SSDs: Which One is Right for You?",
      date: "12 Nov 2026",
      excerpt: "Deep dive into PCIe 5.0 read speeds, thermal throttling, and real-world gaming load times...",
      href: "/shop",
    },
    {
      source: ServiceSlug.BILLSTACKS,
      title: "How Automated Invoicing Cuts Small Business Debt in Nigeria",
      date: "09 Nov 2026",
      excerpt: "How real-time Moniepoint and bank transfer notifications eliminate payment reconciliation delays...",
      href: "/billstacks",
    },
  ];

  // What We Do features
  const platformFeatures = [
    {
      icon: Building2,
      color: SERVICE_CONFIG[ServiceSlug.APARTMENTS].color,
      tint: SERVICE_CONFIG[ServiceSlug.APARTMENTS].tintBg,
      title: "Hospitality Management",
      desc: "Full hotel PMS: booking engine, front desk check-in/out, room calendar, guest profiles, and nightly reports.",
      href: "/apartments",
    },
    {
      icon: Smartphone,
      color: SERVICE_CONFIG[ServiceSlug.GALAXY].color,
      tint: SERVICE_CONFIG[ServiceSlug.GALAXY].tintBg,
      title: "E-Commerce Storefront",
      desc: "Device Galaxy online shop: product listings, shopping cart, secure payment, and nationwide shipping tracking.",
      href: "/shop",
    },
    {
      icon: Cpu,
      color: SERVICE_CONFIG[ServiceSlug.SPARK].color,
      tint: SERVICE_CONFIG[ServiceSlug.SPARK].tintBg,
      title: "Retail POS System",
      desc: "Multi-shop Zino Spark: POS terminal, stock transfers between locations, barcode, receipt printing.",
      href: "/spark",
    },
    {
      icon: Hammer,
      color: SERVICE_CONFIG[ServiceSlug.BUILDERS].color,
      tint: SERVICE_CONFIG[ServiceSlug.BUILDERS].tintBg,
      title: "Construction Supply",
      desc: "Top Builders: cement, iron rods, materials invoicing, debtors management, and daily sales book.",
      href: "/builders",
    },
    {
      icon: Receipt,
      color: SERVICE_CONFIG[ServiceSlug.BILLSTACKS].color,
      tint: SERVICE_CONFIG[ServiceSlug.BILLSTACKS].tintBg,
      title: "Cloud Accounting",
      desc: "Billstacks: professional invoicing, recurring bills, expense tracking, and financial reports.",
      href: "/billstacks",
    },
    {
      icon: UserCheck,
      color: SERVICE_CONFIG[ServiceSlug.VISITORS].color,
      tint: SERVICE_CONFIG[ServiceSlug.VISITORS].tintBg,
      title: "Visitor & Security",
      desc: "Front desk kiosk, visitor badge printing, employee attendance clock-in/out, and pre-registration.",
      href: "/visit",
    },
  ];

  const stats = [
    { label: "Business Units", value: 6, suffix: "+", prefix: "" },
    { label: "Products in Stock", value: 1480, suffix: "+", prefix: "" },
    { label: "Rooms Available", value: 12, suffix: "+", prefix: "" },
    { label: "Order Fulfilment", value: 99, suffix: ".8%", prefix: "" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ─── TOP STRIP ─── */}
      <div className="bg-topbar text-gray-300 text-xs py-2 px-4 sm:px-8 border-b border-[#292948]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="mailto:sales@devicegalaxy.com"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>sales@devicegalaxy.com</span>
            </a>
            <a
              href="tel:+2348060797058"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>+234 80 60797058</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-gray-400">English (NGN)</span>
            <div className="h-3 w-px bg-gray-700 hidden sm:block" />
            <Link href="/login" className="hover:text-white font-medium transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-active px-2.5 py-1 rounded text-white font-semibold text-[11px] hover:bg-indigo-700 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto h-[72px] px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-active flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md">
              Z1
            </div>
            <div>
              <span className="font-extrabold text-heading text-xl tracking-tight block leading-tight">
                {PLATFORM_NAME}
              </span>
              <span className="text-[10px] text-muted font-bold tracking-widest uppercase block">
                Unified Business Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-heading">
            <Link href="/" className="text-active">Home</Link>
            <Link href="/apartments" className="hover:text-active transition-colors">Apartments</Link>
            <Link href="/shop" className="hover:text-active transition-colors">Shop</Link>
            <Link href="/builders" className="hover:text-active transition-colors">Builders</Link>
            <Link href="/billstacks" className="hover:text-active transition-colors">Billstacks</Link>
            <Link href="/visit" className="hover:text-active transition-colors">Visit Us</Link>

            {/* Partner buttons */}
            <a
              href="https://sales.neadstonltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Neadston Limited
            </a>
            <a
              href="https://sales.estoworld.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-sm transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Esto World
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-heading hover:bg-gray-50 transition-colors shadow-2xs"
            >
              Admin Workspace
            </Link>
            <Link
              href="/shop/cart"
              className="relative p-2 rounded-lg text-heading hover:bg-gray-100 transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="p-2 rounded-lg text-heading hover:bg-gray-100 transition-colors" title="My Account">
              <User className="w-5 h-5" />
            </Link>
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-heading hover:bg-gray-100 transition-colors"
            >
              <div className="w-5 h-0.5 bg-heading mb-1" />
              <div className="w-5 h-0.5 bg-heading mb-1" />
              <div className="w-5 h-0.5 bg-heading" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-border bg-white px-4 py-4 space-y-3 text-sm font-semibold text-heading">
            <Link href="/apartments" className="block py-2 hover:text-active" onClick={() => setMobileMenuOpen(false)}>Apartments</Link>
            <Link href="/shop" className="block py-2 hover:text-active" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <Link href="/builders" className="block py-2 hover:text-active" onClick={() => setMobileMenuOpen(false)}>Builders</Link>
            <Link href="/billstacks" className="block py-2 hover:text-active" onClick={() => setMobileMenuOpen(false)}>Billstacks</Link>
            <Link href="/visit" className="block py-2 hover:text-active" onClick={() => setMobileMenuOpen(false)}>Visit Us</Link>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <a
                href="https://sales.neadstonltd.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500"
              >
                <ExternalLink className="w-4 h-4" /> Neadston Limited
              </a>
              <a
                href="https://sales.estoworld.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600"
              >
                <ExternalLink className="w-4 h-4" /> Esto World
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] flex items-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid-bg opacity-60" />

        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Zino Group Unified Business Ecosystem</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="gradient-text">One Platform,</span>
            <br />
            <span className="text-white">Six Powerful Businesses.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-indigo-200/90 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            From luxury hospitality in Lekki to cutting-edge electronics retail in Computer Village — manage everything from a single powerful admin workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="#services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
            >
              Explore Our Services
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5"
            >
              Admin Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://sales.neadstonltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              Neadston Limited
            </a>
            <a
              href="https://sales.estoworld.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              Esto World
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-300/80 font-medium animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { label: "6 Businesses", icon: Building2 },
              { label: "8 Locations", icon: MapPin },
              { label: "1,480+ Products", icon: Package },
              { label: "99.8% Fulfilment", icon: CheckCircle2 },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Search box */}
          <div className="max-w-2xl mx-auto mt-12 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2 shadow-xl focus-within:border-indigo-400 transition-all">
              <Search className="w-5 h-5 text-indigo-300 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search products, rooms, services across all 6 businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm text-white placeholder:text-indigo-300/60 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
              >
                Search
              </button>
            </div>

            {/* Quick jump */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs">
              <span className="text-indigo-300/70 font-medium">Jump to:</span>
              {servicesList.map((svc) => (
                <a
                  key={svc.slug}
                  href={`#service-${svc.slug.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: svc.config.color }} />
                  <span>{svc.config.shortName}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-indigo-300/50 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ─── LIVE CONTINUOUS SCROLLING TICKER ─── */}
      <div className="bg-[#14142B] border-y border-white/10 py-3.5 overflow-hidden text-xs text-white">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          {[
            { text: "⚡ Zino Spark: Multi-Shop Electronics POS Live in Computer Village Ikeja", color: "#2563EB" },
            { text: "🏢 Zino Apartments: 12 Luxury Serviced Suites & Front Desk Kiosk Active", color: "#D4A843" },
            { text: "🏗️ Top Builders: Daily Sales Book, Bulk Cement & Iron Rods in Stock", color: "#006B3F" },
            { text: "🛒 Device Galaxy: Best-selling SSDs, Laptops & Accessories Online", color: "#E74C3C" },
            { text: "💼 Billstacks: Multi-currency Invoicing & Expense Accounting Running", color: "#28A745" },
            { text: "🛡️ Visitor Management: Self Check-in Kiosk & VIP Guest Passes Live", color: "#7C3AED" },
            { text: "🌐 Partner Portal: Neadston Limited Sales & Business Solutions (sales.neadstonltd.com)", color: "#F97316" },
            { text: "🚀 Partner Portal: Esto World Sales Ecosystem (sales.estoworld.com)", color: "#8B5CF6" },
            { text: "⚡ Zino Spark: Multi-Shop Electronics POS Live in Computer Village Ikeja", color: "#2563EB" },
            { text: "🏢 Zino Apartments: 12 Luxury Serviced Suites & Front Desk Kiosk Active", color: "#D4A843" },
            { text: "🏗️ Top Builders: Daily Sales Book, Bulk Cement & Iron Rods in Stock", color: "#006B3F" },
            { text: "🛒 Device Galaxy: Best-selling SSDs, Laptops & Accessories Online", color: "#E74C3C" },
            { text: "💼 Billstacks: Multi-currency Invoicing & Expense Accounting Running", color: "#28A745" },
            { text: "🛡️ Visitor Management: Self Check-in Kiosk & VIP Guest Passes Live", color: "#7C3AED" },
            { text: "🌐 Partner Portal: Neadston Limited Sales & Business Solutions (sales.neadstonltd.com)", color: "#F97316" },
            { text: "🚀 Partner Portal: Esto World Sales Ecosystem (sales.estoworld.com)", color: "#8B5CF6" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 shrink-0">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-gray-200">{item.text}</span>
              <span className="text-gray-600">/</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── WHAT WE DO SECTION ─── */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-active text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>What We Do</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight">
              Built to Power Real Nigerian Businesses
            </h2>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Zino One is not just software — it&apos;s the operational backbone for 6 distinct businesses running under one ownership, sharing one admin, one financial engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feat, idx) => (
              <Link
                key={feat.title}
                href={feat.href}
                className={`scroll-reveal scroll-reveal-delay-${Math.min(idx + 1, 6)} group p-6 rounded-2xl border border-border hover:border-gray-300 hover:shadow-xl transition-all duration-300 bg-white`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: feat.tint }}
                >
                  <feat.icon className="w-7 h-7" style={{ color: feat.color }} />
                </div>
                <h3 className="font-bold text-heading text-base mb-2 group-hover:text-active transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {feat.desc}
                </p>
                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-muted group-hover:text-active transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES GRID ─── */}
      <section id="services" className="py-20 px-4 sm:px-8 bg-gray-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              Our Six Core Services
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2">
              Each business functions seamlessly on its own while sharing a single unified admin, contacts backbone, and financial engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {servicesList.map((svc, idx) => (
              <div
                key={svc.slug}
                id={`service-${svc.slug.toLowerCase()}`}
                className={`scroll-reveal scroll-reveal-delay-${Math.min(idx + 1, 6)} group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col`}
              >
                {/* Service accent bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: svc.config.color }} />

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: svc.config.tintBg, color: svc.config.darkColor }}
                      >
                        <svc.Icon className="w-7 h-7" />
                      </div>
                      <SourceBadge source={svc.slug} size="md" />
                    </div>

                    <h3 className="text-xl font-bold text-heading group-hover:text-active transition-colors">
                      {svc.config.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed mt-2.5">{svc.desc}</p>

                    <div className="mt-6 pt-5 border-t border-border space-y-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Most Used Functions:
                      </p>
                      {svc.links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="flex items-center justify-between text-xs font-semibold text-heading hover:text-active transition-colors group/link py-0.5"
                        >
                          <span>{link.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      href={svc.publicHref}
                      className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90"
                      style={{ backgroundColor: svc.config.color }}
                    >
                      <span>Open {svc.config.shortName}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS COUNTER SECTION ─── */}
      <section className="bg-[#0F172A] py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              The Numbers Speak for Themselves
            </h2>
            <p className="text-indigo-300/70 text-sm mt-2">
              Real performance across all 6 Zino Group operations.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`scroll-reveal scroll-reveal-delay-${idx + 1} text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors`}
              >
                <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-indigo-300/70 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER PLATFORMS SECTION ─── */}
      <section className="py-20 px-4 sm:px-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-xs font-bold text-muted uppercase tracking-wider mb-4">
              <Globe className="w-3.5 h-3.5" />
              <span>Connected Platforms</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              Explore Our Partner Platforms
            </h2>
            <p className="text-sm text-muted mt-2">
              Click below to visit our partner sales and business solution platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Neadston Limited */}
            <a
              href="https://sales.neadstonltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="scroll-reveal partner-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-8 text-white shadow-xl cursor-pointer block"
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-black/10 translate-y-8 -translate-x-8" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5 shadow-lg">
                  <ExternalLink className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold mb-2">Neadston Limited</h3>
                <p className="text-orange-100 text-sm mb-6 leading-relaxed max-w-xs">
                  Professional sales and business solutions platform. Click to visit the Neadston Limited portal and explore their services.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors shadow-sm">
                  Visit Neadston <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* Esto World */}
            <a
              href="https://sales.estoworld.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="scroll-reveal scroll-reveal-delay-1 partner-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl cursor-pointer block"
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-black/10 translate-y-8 -translate-x-8" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5 shadow-lg">
                  <ExternalLink className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold mb-2">Esto World</h3>
                <p className="text-purple-200 text-sm mb-6 leading-relaxed max-w-xs">
                  Your gateway to the Esto World sales ecosystem. Sign in or explore Esto World&apos;s powerful platform and offerings.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors shadow-sm">
                  Visit Esto World <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── LIVE HIGHLIGHTS ─── */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 scroll-reveal">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-xs font-semibold text-muted mb-2">
                <span>Live Highlights Across Units</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
                Current Features &amp; Offerings
              </h2>
            </div>
            <Link href="/admin" className="text-xs font-bold text-active hover:underline flex items-center gap-1.5">
              <span>View complete inventory in admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Rooms */}
            <div className="scroll-reveal bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bold text-heading text-base">Featured Rooms</h3>
                  <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
                </div>
                <div className="space-y-4">
                  {featuredRooms.map((room) => (
                    <div key={room.name} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-heading text-xs truncate">{room.name}</h4>
                        <p className="text-[11px] text-muted">{room.capacity}</p>
                        <p className="text-xs font-extrabold text-apartments-accent mt-0.5">
                          {formatCurrency(room.priceKobo)} <span className="font-normal text-muted text-[10px]">/ night</span>
                        </p>
                      </div>
                      <Link href={`/apartments`} className="px-2.5 py-1.5 rounded-lg bg-apartments-accent/15 hover:bg-apartments-accent text-apartments-accent hover:text-white font-bold text-[11px] transition-colors shrink-0">
                        Book
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/apartments" className="mt-6 text-center block text-xs font-bold text-active hover:underline">
                View all available studios &amp; suites →
              </Link>
            </div>

            {/* Best Sellers */}
            <div className="scroll-reveal scroll-reveal-delay-1 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bold text-heading text-base">Best Sellers</h3>
                  <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
                </div>
                <div className="space-y-4">
                  {bestSellers.map((item) => (
                    <div key={item.name} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-heading text-xs truncate">{item.name}</h4>
                        <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-heading">{formatCurrency(item.priceKobo)}</span>
                          <span className="text-[10px] text-muted line-through">{formatCurrency(item.originalKobo)}</span>
                        </div>
                      </div>
                      <Link href="/shop" className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-active hover:text-white text-heading font-bold text-[11px] transition-colors shrink-0">
                        Buy
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/shop" className="mt-6 text-center block text-xs font-bold text-active hover:underline">
                Browse online electronics store →
              </Link>
            </div>

            {/* Latest Updates */}
            <div className="scroll-reveal scroll-reveal-delay-2 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bold text-heading text-base">Latest Updates</h3>
                  <span className="text-xs text-muted font-medium">News &amp; Insights</span>
                </div>
                <div className="space-y-4">
                  {articles.map((art) => (
                    <Link
                      key={art.title}
                      href={art.href}
                      className="block p-3 rounded-xl hover:bg-gray-50 transition-colors border border-border/60 hover:border-border"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <SourceBadge source={art.source} size="sm" />
                        <span className="text-[10px] text-muted">{art.date}</span>
                      </div>
                      <h4 className="font-bold text-heading text-xs leading-snug line-clamp-2 mt-1.5">{art.title}</h4>
                      <p className="text-[11px] text-muted line-clamp-2 mt-1">{art.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Stay informed</span>
                <span className="font-bold text-active">Read all articles →</span>
              </div>
            </div>
          </div>

          {/* Today at a Glance */}
          <div className="scroll-reveal bg-white rounded-2xl border border-border p-5 shadow-xs flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-heading">12</p>
              <p className="text-xs text-muted font-medium">Rooms available tonight</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-extrabold text-heading">1,480+</p>
              <p className="text-xs text-muted font-medium">Electronics in stock</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-extrabold text-heading">5</p>
              <p className="text-xs text-muted font-medium">Retail stores open today</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-extrabold text-heading">99.8%</p>
              <p className="text-xs text-muted font-medium">On-time order fulfilment</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-topbar text-gray-300 py-16 px-4 sm:px-8 border-t border-[#242442] mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-active flex items-center justify-center font-black text-white text-base">Z1</div>
              <span className="font-extrabold text-white text-lg tracking-tight">{PLATFORM_NAME}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Unified business platform uniting hospitality, electronics retail &amp; wholesale, construction supply, visitor security, and modern financial management under a single roof.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-gray-400">
              <Link href="/admin" className="text-active hover:underline font-semibold">Staff Admin Login →</Link>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Our Services</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li><Link href="/apartments" className="hover:text-white transition-colors">Zino Apartments</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Device Galaxy E-commerce</Link></li>
              <li><Link href="/spark" className="hover:text-white transition-colors">Zino Spark Electronics POS</Link></li>
              <li><Link href="/builders" className="hover:text-white transition-colors">Top Builders Supplies</Link></li>
              <li><Link href="/billstacks" className="hover:text-white transition-colors">Billstacks Invoicing</Link></li>
              <li><Link href="/visit" className="hover:text-white transition-colors">Visitor Management Kiosk</Link></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li><Link href="/about" className="hover:text-white transition-colors">About the Group</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact + Partners */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Head Office</h4>
              <ul className="space-y-3 text-xs text-gray-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Computer Village &amp; Lekki Phase 1, Lagos, Nigeria</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href="mailto:sales@devicegalaxy.com" className="hover:text-white transition-colors">sales@devicegalaxy.com</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href="tel:+2348060797058" className="hover:text-white transition-colors">+234 80 60797058</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Partner Platforms</h4>
              <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
                <li>
                  <a href="https://sales.neadstonltd.com/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Neadston Limited
                  </a>
                </li>
                <li>
                  <a href="https://sales.estoworld.com/login" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Esto World
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-[#242442] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 {PLATFORM_NAME}. All rights reserved.</p>
          <p>Powered by {PLATFORM_NAME} Unified Business Engine</p>
        </div>
      </footer>
    </div>
  );
}
