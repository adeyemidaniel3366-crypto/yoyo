"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Eye,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  X,
  CreditCard,
  Check,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { CATALOG_PRODUCTS, type StoreProduct } from "@/lib/shop-data";

export default function DeviceGalaxyShopPage() {
  const { products: storeProducts, recordTransaction } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<"FEATURED" | "SPECIAL" | "NEW_ARRIVAL" | "LATEST">("FEATURED");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(2);
  const [shopBanner, setShopBanner] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<StoreProduct | null>(null);

  // Sync store products from Unified Products catalog if available
  const mergedProducts: StoreProduct[] = React.useMemo(() => {
    const galaxyStoreList = storeProducts
      .filter((p) => p.source === ServiceSlug.GALAXY || p.source === ServiceSlug.SPARK)
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        slug: p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: p.name,
        category: p.label || "Electronics",
        priceKobo: p.priceKobo,
        originalPriceKobo: Math.round(p.priceKobo * 1.12),
        image: p.imageUrl || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600",
        images: p.images?.length ? p.images : [p.imageUrl],
        badge: (p.status === "OUT_OF_STOCK"
          ? "OUT_OF_STOCK"
          : p.isNew
          ? "NEW"
          : "SALE") as StoreProduct["badge"],
        inStock: p.status !== "OUT_OF_STOCK" && p.totalStock > 0,
        stockCount: p.totalStock,
        reviewsCount: 4,
        rating: 5,
        description: p.description || p.name,
      }));

    return galaxyStoreList.length > 0 ? galaxyStoreList : CATALOG_PRODUCTS;
  }, [storeProducts]);

  const filteredProducts = React.useMemo(() => {
    return mergedProducts.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "SPECIAL") return p.badge === "SALE";
      if (activeTab === "NEW_ARRIVAL") return p.badge === "NEW";
      return true;
    });
  }, [mergedProducts, searchQuery, activeTab]);

  const handleAddToCart = (p: StoreProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!p.inStock) return;
    setCartCount((c) => c + 1);

    const inv = recordTransaction({
      source: ServiceSlug.GALAXY,
      activityType: "ORDER",
      activitySummary: `Online Storefront Item Added — ${p.name}`,
      customer: "Device Galaxy Shopper",
      amountKobo: p.priceKobo,
      location: "Galaxy Online",
      status: "PAID",
    });

    setShopBanner(`Added "${p.name}" to cart! Logged to central platform.`);
    setTimeout(() => setShopBanner(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-x-hidden max-w-full">
      {/* Toast Notification */}
      {shopBanner && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shopBanner}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-[#2C3E50] text-gray-300 text-xs py-2 px-4 sm:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span>sales@devicegalaxy.com</span>
            <span className="hidden sm:inline">+234 80 60797058</span>
          </div>
          <div className="flex items-center gap-4">
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
            <Link href="/" className="hover:text-white font-semibold transition-colors">
              Return to Zino Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-6">
          <Link href="/shop" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-galaxy flex items-center justify-center font-black text-white text-lg shadow-sm">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for SSDs, laptops, speakers, NAS storage..."
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-border bg-gray-50 focus:bg-white text-xs focus:outline-none focus:border-galaxy text-heading transition-colors"
            />
            <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop/checkout"
              className="relative p-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-bold text-heading"
            >
              <ShoppingCart className="w-4 h-4 text-galaxy" />
              <span>Cart ({cartCount})</span>
            </Link>
            <Link
              href="/shop/checkout"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2C3E50] to-[#1A252F] text-white py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-galaxy text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
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
              <Link
                href="/shop/checkout"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/20"
              >
                Instant Checkout
              </Link>
            </div>
          </div>

          {/* Featured Hero Product Card */}
          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-6 border border-white/10 backdrop-blur-md text-center shadow-2xl">
            <div className="w-44 h-44 mx-auto rounded-xl overflow-hidden bg-white p-3 flex items-center justify-center shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CATALOG_PRODUCTS[0].image}
                alt={CATALOG_PRODUCTS[0].name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="font-bold text-sm text-white mt-3 truncate">{CATALOG_PRODUCTS[0].name}</p>
            <p className="text-amber-400 font-black text-xl mt-0.5">
              {formatCurrency(CATALOG_PRODUCTS[0].priceKobo)}
            </p>
            <button
              type="button"
              onClick={() => handleAddToCart(CATALOG_PRODUCTS[0])}
              className="mt-3 w-full py-2 rounded-lg bg-galaxy hover:bg-galaxy-dark text-white text-xs font-bold transition-colors"
            >
              Add to Cart
            </button>
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

      {/* Product Catalog Grid Section */}
      <section id="products" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-heading">
              Explore Electronics Catalog
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Click any product to view full technical specifications, warranty and preview.
            </p>
          </div>

          {/* Product Filter Tabs */}
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

        {/* Product Cards Grid with Uniform Fitted Image Containers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => setPreviewProduct(p)}
              className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-xl hover:border-galaxy/40 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Uniform Image Container (Aspect Square with object-contain to fit perfectly) */}
                <div className="relative aspect-square w-full rounded-xl bg-gray-50/80 border border-gray-100/80 flex items-center justify-center p-4 overflow-hidden mb-3 group/img">
                  {p.badge && (
                    <span
                      className={`absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-xs ${
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

                  {/* Hover Quick View Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewProduct(p);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:text-galaxy hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Category & Title */}
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{p.category}</p>
                <Link
                  href={`/shop/products/${p.slug || p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-heading text-xs mt-1 line-clamp-2 leading-snug hover:text-galaxy transition-colors"
                >
                  {p.name}
                </Link>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mt-2 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < p.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-muted ml-1">({p.reviewsCount} Reviews)</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mt-2">
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

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!p.inStock}
                  onClick={(e) => handleAddToCart(p, e)}
                  className="flex-1 py-2.5 rounded-xl bg-galaxy hover:bg-galaxy-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{p.inStock ? "Add to Cart" : "Out of Stock"}</span>
                </button>
                <Link
                  href={`/shop/products/${p.slug || p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 rounded-xl border border-gray-200 hover:border-galaxy text-gray-600 hover:text-galaxy hover:bg-gray-50 transition-colors"
                  title="View Specs & Details"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Product Modal Dialog */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Product Image Box */}
              <div className="aspect-square w-full rounded-xl bg-gray-50 border border-gray-100 p-6 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewProduct.image}
                  alt={previewProduct.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-galaxy bg-galaxy-tint px-2.5 py-1 rounded-md">
                  {previewProduct.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-heading leading-snug">
                  {previewProduct.name}
                </h3>
                <p className="text-xs text-muted font-mono">SKU: {previewProduct.sku}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-muted ml-1">({previewProduct.reviewsCount} Customer Reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 py-1">
                  <span className="text-2xl font-black text-heading">
                    {formatCurrency(previewProduct.priceKobo)}
                  </span>
                  {previewProduct.originalPriceKobo && (
                    <span className="text-xs text-muted line-through">
                      {formatCurrency(previewProduct.originalPriceKobo)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {previewProduct.description}
                </p>

                {/* Technical Specs Highlight */}
                {previewProduct.specs && (
                  <div className="bg-gray-50 rounded-xl p-3 text-[11px] space-y-1.5 border border-border">
                    {Object.entries(previewProduct.specs).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted font-medium">{key}:</span>
                        <span className="font-bold text-heading">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={!previewProduct.inStock}
                    onClick={() => {
                      handleAddToCart(previewProduct);
                      setPreviewProduct(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-galaxy hover:bg-galaxy-dark disabled:bg-gray-200 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{previewProduct.inStock ? "Add to Cart" : "Out of Stock"}</span>
                  </button>

                  <Link
                    href={`/shop/products/${previewProduct.slug || previewProduct.id}`}
                    className="py-2.5 px-4 rounded-xl border border-border text-heading hover:bg-gray-50 text-center font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1A252F] text-gray-400 py-8 px-4 sm:px-8 border-t border-gray-800 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Device Galaxy · Member of Zino Group</p>
          <div className="flex items-center gap-4 text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Staff Sign In
            </Link>
            <span>·</span>
            <Link href="/shop/checkout" className="hover:text-white transition-colors">
              Instant Checkout
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
