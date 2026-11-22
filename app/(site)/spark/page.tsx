"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  Zap,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Search,
  ShoppingCart,
  QrCode,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Package,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { usePlatformStore } from "@/lib/platform-store";

interface SparkProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  priceKobo: number;
  inStock: boolean;
  image: string;
  features: string[];
  specs: string;
}

export default function SparkPublicPage() {
  const { products: storeProducts, addToCart, recordTransaction } = usePlatformStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const sparkCatalog: SparkProduct[] = React.useMemo(
    () =>
      storeProducts
        .filter((p) => p.source === ServiceSlug.SPARK && p.status !== "INACTIVE" && p.status !== "ARCHIVED")
        .map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.label || "Retail POS",
          priceKobo: p.priceKobo,
          inStock: p.status !== "OUT_OF_STOCK" && p.totalStock > 0,
          image: p.imageUrl || "",
          features: ["Verified Official Warranty", "Same-Day Branch Pickup", `Stock: ${p.totalStock} unit(s)`],
          specs: p.description || p.label,
        })),
    [storeProducts]
  );

  const categories = React.useMemo(() => {
    const cats = new Set<string>(["All"]);
    sparkCatalog.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }, [sparkCatalog]);

  const filteredProducts = sparkCatalog.filter((prod) => {
    const matchesCat = selectedCategory === "All" || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.category.toLowerCase().includes(search.toLowerCase()) ||
      prod.specs.toLowerCase().includes(search.toLowerCase()) ||
      prod.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOrderInquiry = (prod: SparkProduct) => {
    addToCart({
      productId: prod.id,
      name: prod.name,
      sku: prod.id.toUpperCase(),
      priceKobo: prod.priceKobo,
      image: prod.image,
      qty: 1,
    });

    recordTransaction({
      source: ServiceSlug.SPARK,
      activityType: "INVOICE",
      activitySummary: `Inquiry order placed for ${prod.name}`,
      invoiceNo: `SPK-${Math.floor(100000 + Math.random() * 900000)}`,
      customer: "Public Online Shopper",
      amountKobo: prod.priceKobo,
      location: "Zino Spark Retail Hub",
      status: "PENDING_DISPATCH",
    });

    showToast(`Added ${prod.name} to unified cart & notified sales team!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-blue-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-slate-900">Zino Spark</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Retail & POS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Commercial Power, Automation & Retail Hardware</p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#products" className="hover:text-blue-600 transition-colors">Catalog</a>
            <a href="#pos-tech" className="hover:text-blue-600 transition-colors">POS Hardware</a>
            <a href="#locations" className="hover:text-blue-600 transition-colors">Branch Pickups</a>
            <Link href="/admin/spark/pos" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold">
              <span>Admin POS Terminal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop/checkout"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Checkout</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Smart Retail, Commercial Inverters & POS Terminal Systems</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            High-Performance Electricals, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              Solar Power & Retail POS Solutions
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Equipping modern enterprises, supermarkets, and construction projects with verified tier-1 power systems,
            touch POS registers, automated switchgears, and lightning-fast logistics across Nigeria.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </a>
            <Link
              href="/admin/spark"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs sm:text-sm font-semibold backdrop-blur-xs transition-all"
            >
              <span>Zino Spark Backoffice</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="bg-white border-y border-slate-200/80 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-3">
            <p className="text-2xl font-black text-blue-600">24-Month</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Full Inverter & Battery Warranty</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-black text-slate-900">Same-Day</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Dispatch in Lagos & Abuja</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-black text-slate-900">100%</p>
            <p className="text-xs font-medium text-slate-500 mt-1">SON & ISO Certified Components</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-black text-blue-600">POS Ready</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Synced to Zino Admin Dashboard</p>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SourceBadge source={ServiceSlug.SPARK} size="sm" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Commercial Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct-from-manufacturer pricing with full warranty and installation support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or specs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group"
            >
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                {prod.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package className="w-12 h-12 text-slate-300" />
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-blue-700 shadow-xs backdrop-blur-xs">
                    {prod.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs ${
                      prod.inStock ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    }`}
                  >
                    {prod.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{prod.specs}</p>

                  <ul className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3">
                    {prod.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Unit Price</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(prod.priceKobo)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrderInquiry(prod)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POS Tech Feature Section */}
      <section id="pos-tech" className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              <span>Modern Retail Point-of-Sale</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Integrated Cloud POS for Multi-Branch Retail Chains
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Zino Spark POS connects directly with our central warehouse, automatically syncing stock deductions,
              generating customer tax receipts, accepting multi-tender payments, and logging real-time revenue to the unified executive dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-xs font-bold text-blue-400">Barcode & QR Scan</p>
                <p className="text-xs text-slate-300">Under 0.2s lookup speed across 10,000+ SKUs.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-xs font-bold text-blue-400">Offline Resilience</p>
                <p className="text-xs text-slate-300">Local cache fallback syncs seamlessly when back online.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/admin/spark/pos"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg"
              >
                <span>Launch Cloud POS Register</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-800 p-2">
            <img
              src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80"
              alt="POS Register in action"
              className="w-full h-96 object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Locations & Pickup Section */}
      <section id="locations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Branch Showrooms & Warehouses</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Visit our physical showrooms for on-site product testing, battery load capacity demonstrations, and pick-up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Lekki Commercial Hub</span>
            </div>
            <p className="text-xs text-slate-600">Plot 14 Admiralty Way, Lekki Phase 1, Lagos</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Mon - Sat: 8:00 AM - 6:00 PM
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Victoria Island Flagship</span>
            </div>
            <p className="text-xs text-slate-600">Sanusi Fafunwa Street, VI, Lagos</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Mon - Sat: 8:00 AM - 6:00 PM
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Abuja Central Depot</span>
            </div>
            <p className="text-xs text-slate-600">Central Business District, FCT Abuja</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Mon - Sat: 8:00 AM - 5:30 PM
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Zino Spark — Powered by Zino One Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/shop" className="hover:text-blue-600">Device Galaxy</Link>
            <Link href="/apartments" className="hover:text-blue-600">Zino Apartments</Link>
            <Link href="/builders" className="hover:text-blue-600">Top Builders</Link>
            <Link href="/billstacks" className="hover:text-blue-600">Billstacks</Link>
          </div>
          <p>© 2026 Zino One Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
