"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Heart,
  Repeat,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Filter,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface StoreProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  priceKobo: number;
  originalPriceKobo?: number;
  image: string;
  badge?: "NEW" | "SALE" | "OUT_OF_STOCK";
  inStock: boolean;
  reviewsCount: number;
}

export default function DeviceGalaxyShopPage() {
  const [activeTab, setActiveTab] = useState<"FEATURED" | "SPECIAL" | "NEW_ARRIVAL" | "LATEST">("FEATURED");
  const [cartCount, setCartCount] = useState(2);

  const products: StoreProduct[] = [
    {
      id: "gal_1",
      sku: "13268",
      name: "Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD 7450MB/s",
      category: "SSDs",
      priceKobo: 48000000,
      originalPriceKobo: 52000000,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80",
      badge: "SALE",
      inStock: true,
      reviewsCount: 0,
    },
    {
      id: "gal_2",
      sku: "13458",
      name: "Lexar SL500 Portable SSD with Magnetic Set 1TB",
      category: "Portable SSD",
      priceKobo: 18500000,
      originalPriceKobo: 21000000,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=80",
      badge: "NEW",
      inStock: true,
      reviewsCount: 0,
    },
    {
      id: "gal_3",
      sku: "13376",
      name: "Synology 8 Bay Rackstation RS1221RP+",
      category: "NAS",
      priceKobo: 245000000,
      image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&auto=format&fit=crop&q=80",
      inStock: true,
      reviewsCount: 0,
    },
    {
      id: "gal_4",
      sku: "13360",
      name: "Zealot S69M High-Power Wireless Speaker",
      category: "Audio",
      priceKobo: 4500000,
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
      badge: "OUT_OF_STOCK",
      inStock: false,
      reviewsCount: 0,
    },
    {
      id: "gal_5",
      sku: "13246",
      name: "Sandisk Extreme PRO Portable SSD 2000Mb/s 4TB",
      category: "Portable SSD",
      priceKobo: 58000000,
      originalPriceKobo: 64000000,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80",
      badge: "SALE",
      inStock: true,
      reviewsCount: 0,
    },
    {
      id: "gal_6",
      sku: "13099",
      name: "JBL Sound System BAR 1300, 11.1 Channel Surround",
      category: "Audio",
      priceKobo: 185000000,
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
      badge: "NEW",
      inStock: true,
      reviewsCount: 0,
    },
  ];

  const handleAddToCart = (p: StoreProduct) => {
    if (!p.inStock) return;
    setCartCount((c) => c + 1);
    alert(`Added ${p.name} to cart! Total items: ${cartCount + 1}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#2C3E50] text-gray-300 text-xs py-2 px-4 sm:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>sales@devicegalaxy.com</span>
            <span>+234 80 60797058</span>
          </div>
          <div className="flex items-center gap-4">
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
            <Link href="/" className="hover:text-white font-semibold">
              Return to Zino Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-6">
          <Link href="/shop" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-galaxy flex items-center justify-center font-black text-white text-lg">
              DG
            </div>
            <div>
              <span className="font-black text-heading text-xl tracking-tight block leading-tight">
                DEVICE GALAXY
              </span>
              <span className="text-[10px] text-muted font-bold tracking-widest uppercase block">
                Electronics & Gadgets Store
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="Search for SSDs, laptops, speakers, NAS storage..."
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-border bg-gray-50 focus:bg-white text-xs focus:outline-none focus:border-galaxy text-heading"
            />
            <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/shop/cart"
              className="relative p-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-bold text-heading"
            >
              <ShoppingCart className="w-4 h-4 text-galaxy" />
              <span>Cart ({cartCount})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Carousel Banner */}
      <section className="bg-gradient-to-r from-[#2C3E50] to-[#1A252F] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-galaxy text-white font-bold text-[10px] uppercase tracking-wider">
              Exclusive Flash Deals · 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Premium Electronics. Same-Day Lagos Delivery.
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">
              High-performance NVMe SSDs, enterprise NAS storage servers, audio systems and gaming laptops backed by manufacturer warranty.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#products"
                className="px-6 py-3 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Shop Now
              </a>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-6 border border-white/10 backdrop-blur-md text-center">
            <div className="w-44 h-44 mx-auto rounded-xl overflow-hidden bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80"
                alt="Featured SSD"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-sm text-white mt-3">Samsung 990 PRO 4TB NVMe</p>
            <p className="text-amber-400 font-black text-lg mt-0.5">₦480,000.00</p>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <div className="bg-white border-b border-border py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Truck className="w-8 h-8 text-galaxy shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-heading">Fast Nationwide Shipping</h4>
              <p className="text-[11px] text-muted">Doorstep delivery in Nigeria</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <ShieldCheck className="w-8 h-8 text-galaxy shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-heading">100% Genuine Warranty</h4>
              <p className="text-[11px] text-muted">Direct from authorized brands</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <RotateCcw className="w-8 h-8 text-galaxy shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-heading">30 Days Returns</h4>
              <p className="text-[11px] text-muted">Hassle-free replacement policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Headphones className="w-8 h-8 text-galaxy shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-heading">24/7 Tech Support</h4>
              <p className="text-[11px] text-muted">Live assistance with engineers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Section with Tabs */}
      <section id="products" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-heading">
            Explore Electronics Catalog
          </h2>

          {/* Locked Product Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {(["FEATURED", "SPECIAL", "NEW_ARRIVAL", "LATEST"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === t
                    ? "bg-galaxy text-white shadow-2xs"
                    : "bg-white border border-border text-heading hover:bg-gray-50"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid — Locked Structure from spec */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image 1:1 with Badge */}
                <div className="relative aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3 p-3 flex items-center justify-center">
                  {p.badge && (
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        p.badge === "NEW"
                          ? "bg-blue-600 text-white"
                          : p.badge === "SALE"
                          ? "bg-galaxy text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {p.badge === "OUT_OF_STOCK" ? "Out of Stock" : p.badge}
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Category & Name */}
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{p.category}</p>
                <h3 className="font-bold text-heading text-xs mt-1 line-clamp-2 leading-snug">
                  {p.name}
                </h3>

                {/* 10-Star Rating (5 filled, 5 outline) + 0 Review */}
                <div className="flex items-center gap-1 mt-2 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-gray-300" />
                  ))}
                  <span className="text-[10px] text-muted ml-1">0 Review</span>
                </div>

                {/* Price (Sale price + Strikethrough) */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-black text-heading">
                    {formatCurrency(p.priceKobo)}
                  </span>
                  {p.originalPriceKobo && (
                    <span className="text-xs text-muted line-through">
                      {formatCurrency(p.originalPriceKobo)}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                disabled={!p.inStock}
                onClick={() => handleAddToCart(p)}
                className="mt-4 w-full py-2.5 rounded-xl bg-galaxy hover:bg-galaxy-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{p.inStock ? "Add to Cart" : "Out of Stock"}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A252F] text-gray-400 py-8 px-4 sm:px-8 border-t border-gray-800 text-xs text-center">
        <p>© 2026 Device Galaxy · Member of Zino Group</p>
      </footer>
    </div>
  );
}
