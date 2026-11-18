"use client";

import React, { useState } from "react";
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
  Calendar,
  Sparkles,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG, PLATFORM_NAME } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

export default function HomePortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(2);

  // 6 Services in LOCKED order: Apartments, Galaxy, Spark, Builders, Billstacks, Visitors
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
    },
    {
      slug: ServiceSlug.BILLSTACKS,
      config: SERVICE_CONFIG[ServiceSlug.BILLSTACKS],
      desc: "SaaS invoicing, automated expense tracking, recurring bills, and financial accounting for growing businesses.",
      links: [
        { label: "Create Invoice", href: "/admin/billstacks/invoices" },
        { label: "See Pricing Plans", href: "/billstacks/pricing" },
        { label: "Platform Features", href: "/billstacks/features" },
      ],
      publicHref: "/billstacks",
      badgeText: "Accounting",
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
    },
  ];

  // Highlights
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
      href: "/apartments/blog/amenities",
    },
    {
      source: ServiceSlug.GALAXY,
      title: "Gen5 vs Gen4 NVMe SSDs: Which One is Right for You?",
      date: "12 Nov 2026",
      excerpt: "Deep dive into PCIe 5.0 read speeds, thermal throttling, and real-world gaming load times...",
      href: "/shop/blog/gen5-vs-gen4",
    },
    {
      source: ServiceSlug.BILLSTACKS,
      title: "How Automated Invoicing Cuts Small Business Debt in Nigeria",
      date: "09 Nov 2026",
      excerpt: "How real-time Moniepoint and bank transfer notifications eliminate payment reconciliation delays...",
      href: "/billstacks/features",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 6.1 Top Strip (dark navy #1A1A2E, 36px) */}
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

      {/* Main Header (sticky, 72px) */}
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

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-heading">
            <Link href="/" className="text-active">
              Home
            </Link>
            <Link href="/apartments" className="hover:text-active transition-colors">
              Apartments
            </Link>
            <Link href="/shop" className="hover:text-active transition-colors">
              Shop
            </Link>
            <Link href="/builders" className="hover:text-active transition-colors">
              Top Builders
            </Link>
            <Link href="/billstacks" className="hover:text-active transition-colors">
              Billstacks
            </Link>
            <Link href="/visit" className="hover:text-active transition-colors">
              Visit Us
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-heading hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <span>Admin Workspace</span>
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

            <Link
              href="/account"
              className="p-2 rounded-lg text-heading hover:bg-gray-100 transition-colors"
              title="My Account"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 6.2 Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 via-white to-gray-50/50 py-16 sm:py-20 px-4 sm:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-active text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Zino Group Unified Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-heading tracking-tight leading-tight">
            One place for everything we do.
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto font-normal leading-relaxed">
            From luxury service apartments in Lekki and cutting-edge electronics retail in Computer Village, to heavy construction supplies, enterprise visitor security, and automated cloud accounting.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative mt-8">
            <div className="flex items-center rounded-2xl border-2 border-gray-200 bg-white p-2 shadow-lg focus-within:border-active transition-all">
              <Search className="w-5 h-5 text-muted ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search products, rooms, services across all 6 businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm text-heading placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                className="bg-active text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
              >
                Search
              </button>
            </div>

            {/* Service quick jump chips */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs">
              <span className="text-muted font-medium">Quick jump:</span>
              {servicesList.map((svc) => (
                <a
                  key={svc.slug}
                  href={`#service-${svc.slug.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border bg-white text-heading font-medium hover:border-gray-400 transition-colors shadow-2xs"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: svc.config.color }}
                  />
                  <span>{svc.config.shortName}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6.3 Services Grid (3 cols desktop, 2 tablet, 1 mobile) */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
            Our Six Core Services
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-2">
            Each business functions seamlessly on its own while sharing a single unified admin, contacts backbone, and financial engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {servicesList.map((svc) => {
            const Icon =
              svc.slug === ServiceSlug.APARTMENTS
                ? Building2
                : svc.slug === ServiceSlug.GALAXY
                ? Smartphone
                : svc.slug === ServiceSlug.SPARK
                ? Cpu
                : svc.slug === ServiceSlug.BUILDERS
                ? Hammer
                : svc.slug === ServiceSlug.BILLSTACKS
                ? Receipt
                : UserCheck;

            return (
              <div
                key={svc.slug}
                id={`service-${svc.slug.toLowerCase()}`}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col"
              >
                {/* 4px top service accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: svc.config.color }}
                />

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: svc.config.tintBg,
                          color: svc.config.darkColor,
                        }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <SourceBadge source={svc.slug} size="md" />
                    </div>

                    {/* Service Name & Description */}
                    <h3 className="text-xl font-bold text-heading group-hover:text-active transition-colors">
                      {svc.config.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed mt-2.5">
                      {svc.desc}
                    </p>

                    {/* Quick links list */}
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

                  {/* Primary Button */}
                  <div className="mt-8 pt-4">
                    <Link
                      href={svc.publicHref}
                      className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm transition-all"
                      style={{
                        backgroundColor: svc.config.color,
                      }}
                    >
                      <span>Open {svc.config.shortName}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6.4 Live Highlights (Featured Rooms, Best Sellers, Latest Updates) */}
      <section className="bg-gray-50/70 py-16 sm:py-20 px-4 sm:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-xs font-semibold text-muted mb-2">
                <span>Live Highlights Across Units</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
                Current Features & Offerings
              </h2>
            </div>
            <Link
              href="/admin"
              className="text-xs font-bold text-active hover:underline flex items-center gap-1.5"
            >
              <span>View complete inventory in admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel 1: Featured Rooms (Apartments) */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bold text-heading text-base">Featured Rooms</h3>
                  <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
                </div>

                <div className="space-y-4">
                  {featuredRooms.map((room) => (
                    <div
                      key={room.name}
                      className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-heading text-xs truncate">
                          {room.name}
                        </h4>
                        <p className="text-[11px] text-muted">{room.capacity}</p>
                        <p className="text-xs font-extrabold text-apartments-accent mt-0.5">
                          {formatCurrency(room.priceKobo)} <span className="font-normal text-muted text-[10px]">/ night</span>
                        </p>
                      </div>
                      <Link
                        href={`/apartments/rooms/${room.slug}`}
                        className="px-2.5 py-1.5 rounded-lg bg-apartments-accent/15 hover:bg-apartments-accent text-apartments-accent hover:text-white font-bold text-[11px] transition-colors shrink-0"
                      >
                        Book
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/apartments"
                className="mt-6 text-center block text-xs font-bold text-active hover:underline"
              >
                View all available studios & suites →
              </Link>
            </div>

            {/* Panel 2: Best Sellers (Device Galaxy) */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bold text-heading text-base">Best Sellers</h3>
                  <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
                </div>

                <div className="space-y-4">
                  {bestSellers.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-heading text-xs truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-heading">
                            {formatCurrency(item.priceKobo)}
                          </span>
                          <span className="text-[10px] text-muted line-through">
                            {formatCurrency(item.originalKobo)}
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/shop"
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-active hover:text-white text-heading font-bold text-[11px] transition-colors shrink-0"
                      >
                        Buy
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/shop"
                className="mt-6 text-center block text-xs font-bold text-active hover:underline"
              >
                Browse online electronics store →
              </Link>
            </div>

            {/* Panel 3: Latest Updates & Articles */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bold text-heading text-base">Latest Updates</h3>
                  <span className="text-xs text-muted font-medium">News & Insights</span>
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
                      <h4 className="font-bold text-heading text-xs leading-snug line-clamp-2 mt-1.5">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-muted line-clamp-2 mt-1">
                        {art.excerpt}
                      </p>
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

          {/* Today at a Glance (Public-safe metrics strip) */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-xs flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
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

      {/* 6.5 Footer (public) */}
      <footer className="bg-topbar text-gray-300 py-16 px-4 sm:px-8 border-t border-[#242442] mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Logo + short group description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-active flex items-center justify-center font-black text-white text-base">
                Z1
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                {PLATFORM_NAME}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Unified business platform uniting hospitality, electronics retail & wholesale, construction supply, visitor security, and modern financial management under a single roof.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-gray-400">
              <Link href="/admin" className="text-active hover:underline font-semibold">
                Staff Admin Login →
              </Link>
            </div>
          </div>

          {/* Column 2: Services — links to all six */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li>
                <Link href="/apartments" className="hover:text-white transition-colors">
                  Zino Apartments
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Device Galaxy E-commerce
                </Link>
              </li>
              <li>
                <Link href="/spark" className="hover:text-white transition-colors">
                  Zino Spark Electronics POS
                </Link>
              </li>
              <li>
                <Link href="/builders" className="hover:text-white transition-colors">
                  Top Builders Supplies
                </Link>
              </li>
              <li>
                <Link href="/billstacks" className="hover:text-white transition-colors">
                  Billstacks Invoicing
                </Link>
              </li>
              <li>
                <Link href="/visit" className="hover:text-white transition-colors">
                  Visitor Management Kiosk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About the Group
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Head Office Contact
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>Computer Village & Lekki Phase 1, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a href="mailto:sales@devicegalaxy.com" className="hover:text-white transition-colors">
                  sales@devicegalaxy.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href="tel:+2348060797058" className="hover:text-white transition-colors">
                  +234 80 60797058
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-[#242442] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 {PLATFORM_NAME}. All rights reserved.</p>
          <p>Powered by {PLATFORM_NAME} Unified Business Engine</p>
        </div>
      </footer>
    </div>
  );
}
