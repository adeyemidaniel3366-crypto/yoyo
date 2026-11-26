"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Check,
  CreditCard,
  Package,
  Heart,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Clock,
  LayoutGrid,
  List,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  Filter,
  Share2,
  Tag,
  Flame,
  Award,
  ArrowUpDown,
  ShoppingBag,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { CATALOG_PRODUCTS, GALAXY_CATEGORIES, type StoreProduct } from "@/lib/shop-data";

export default function DeviceGalaxyShopPage() {
  const {
    products: storeProducts,
    cartItems,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
  } = usePlatformStore();

  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Category & Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "BESTSELLER" | "SALE" | "NEW">("ALL");
  const [priceFilter, setPriceFilter] = useState<"ALL" | "UNDER_100K" | "100K_500K" | "500K_2M" | "ABOVE_2M">("ALL");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"FEATURED" | "PRICE_ASC" | "PRICE_DESC" | "RATING" | "NAME">("FEATURED");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<StoreProduct | null>(null);
  const [previewImageIdx, setPreviewImageIdx] = useState(0);
  const [previewQty, setPreviewQty] = useState(1);

  // Wishlist State (persisted in localStorage)
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Toast & Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"SUCCESS" | "WISHLIST" | "INFO">("SUCCESS");

  // Hero Deal Carousel
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Flash Sale Countdown Timer (simulated for today)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });

  // Coupon Drawer State
  const [cartCoupon, setCartCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountKobo, setCouponDiscountKobo] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("galaxy_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save wishlist to localStorage
  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("galaxy_wishlist", JSON.stringify(next));
      } catch {}

      const prod = allMergedProducts.find((p) => p.id === productId);
      if (exists) {
        showToast(`Removed ${prod ? prod.name : "item"} from wishlist`, "INFO");
      } else {
        showToast(`Saved ${prod ? prod.name : "item"} to wishlist!`, "WISHLIST");
      }
      return next;
    });
  };

  const showToast = (msg: string, type: "SUCCESS" | "WISHLIST" | "INFO" = "SUCCESS") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setPreviewProduct(null);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setMobileFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Merge CATALOG_PRODUCTS with store products dynamically
  const allMergedProducts: StoreProduct[] = useMemo(() => {
    // Map store products
    const storeGalaxy = storeProducts
      .filter((p) => p.source === ServiceSlug.GALAXY && p.status !== "INACTIVE" && p.status !== "ARCHIVED")
      .map((p) => {
        const cat = CATALOG_PRODUCTS.find((c) => c.sku.toLowerCase() === p.sku.toLowerCase());
        return {
          id: p.id,
          sku: p.sku,
          slug: p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: p.name,
          brand: cat?.brand || "Device Galaxy",
          category: p.label || cat?.category || "Electronics",
          priceKobo: p.priceKobo,
          originalPriceKobo: cat?.originalPriceKobo || Math.round(p.priceKobo * 1.14),
          image: p.imageUrl || cat?.image || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700",
          images: p.images?.length ? p.images : cat?.images || (p.imageUrl ? [p.imageUrl] : []),
          badge: (p.status === "OUT_OF_STOCK" || p.totalStock === 0
            ? "OUT_OF_STOCK"
            : cat?.badge || (p.isNew ? "NEW" : "SALE")) as StoreProduct["badge"],
          inStock: p.status !== "OUT_OF_STOCK" && p.totalStock > 0,
          stockCount: p.totalStock,
          reviewsCount: cat?.reviewsCount || 18,
          rating: cat?.rating || 5,
          tag: cat?.tag || `${p.label || "Flagship"}`,
          description: p.description || cat?.description || p.name,
          specs: cat?.specs || {
            Category: p.label || "Electronics",
            Availability: `${p.totalStock} units available`,
            Warranty: "Official 1 Year Manufacturer Warranty",
          },
          features: cat?.features || [
            "Official manufacturer sealed package",
            "Same-day Lagos express delivery",
            "Full warranty protection",
          ],
        };
      });

    return storeGalaxy;
  }, [storeProducts]);

  // Extract unique categories (unifying official categories with what super admin set)
  const categories = useMemo(() => {
    const set = new Set<string>();
    GALAXY_CATEGORIES.forEach((cat) => set.add(cat));
    allMergedProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [allMergedProducts]);

  // Hero Featured Slides
  const heroSlides = useMemo(() => {
    return allMergedProducts.slice(0, 4);
  }, [allMergedProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return allMergedProducts
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchBrand = (p.brand || "").toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchSku && !matchBrand && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;

        // Tab filter
        if (activeTab === "SALE" && p.badge !== "SALE") return false;
        if (activeTab === "NEW" && p.badge !== "NEW") return false;
        if (activeTab === "BESTSELLER" && p.badge !== "BESTSELLER" && p.badge !== "HOT") return false;

        // In stock filter
        if (inStockOnly && !p.inStock) return false;

        // Price filter
        if (priceFilter === "UNDER_100K" && p.priceKobo > 10000000) return false;
        if (priceFilter === "100K_500K" && (p.priceKobo < 10000000 || p.priceKobo > 50000000)) return false;
        if (priceFilter === "500K_2M" && (p.priceKobo < 50000000 || p.priceKobo > 200000000)) return false;
        if (priceFilter === "ABOVE_2M" && p.priceKobo < 200000000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_ASC") return a.priceKobo - b.priceKobo;
        if (sortBy === "PRICE_DESC") return b.priceKobo - a.priceKobo;
        if (sortBy === "RATING") return b.rating - a.rating || b.reviewsCount - a.reviewsCount;
        if (sortBy === "NAME") return a.name.localeCompare(b.name);
        return 0; // Featured default
      });
  }, [allMergedProducts, searchQuery, selectedCategory, activeTab, inStockOnly, priceFilter, sortBy]);

  // Search Live Suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allMergedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    ).slice(0, 5);
  }, [allMergedProducts, searchQuery]);

  // Wishlist products
  const wishlistProducts = useMemo(() => {
    return allMergedProducts.filter((p) => wishlist.includes(p.id));
  }, [allMergedProducts, wishlist]);

  // Cart Metrics
  const cartCount = cartItems.reduce((acc, it) => acc + it.qty, 0);
  const cartSubtotalKobo = cartItems.reduce((acc, it) => acc + it.priceKobo * it.qty, 0);
  const cartVatKobo = Math.round(cartSubtotalKobo * 0.075);
  const freeShippingThresholdKobo = 10000000; // ₦100,000
  const cartShippingKobo = cartSubtotalKobo === 0 || cartSubtotalKobo >= freeShippingThresholdKobo ? 0 : 350000;
  const cartTotalKobo = Math.max(0, cartSubtotalKobo + cartVatKobo + cartShippingKobo - couponDiscountKobo);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotalKobo / freeShippingThresholdKobo) * 100));

  // Add to Cart handler
  const handleAddToCart = (p: StoreProduct, qty: number = 1, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!p.inStock) {
      showToast(`${p.name} is currently out of stock.`, "INFO");
      return;
    }
    addToCart({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      priceKobo: p.priceKobo,
      qty,
      image: p.image,
    });
    showToast(`Added ${qty > 1 ? `${qty}x ` : ""}"${p.name}" to cart!`, "SUCCESS");
  };

  // Open Quick View
  const handleOpenPreview = (p: StoreProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewProduct(p);
    setPreviewImageIdx(0);
    setPreviewQty(1);
  };

  // Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = cartCoupon.trim().toUpperCase();
    if (code === "ZINO2026" || code === "WELCOME10") {
      const discount = Math.round(cartSubtotalKobo * 0.1);
      setCouponDiscountKobo(discount);
      setAppliedCoupon(code);
      showToast(`Promo Code "${code}" applied: 10% discount!`, "SUCCESS");
    } else {
      setCouponError("Invalid coupon. Try 'ZINO2026' for 10% off!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-900 flex flex-col font-sans selection:bg-galaxy selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0F172A] text-white text-xs font-semibold shadow-2xl border border-galaxy/40 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-sm">
          {toastType === "WISHLIST" ? (
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
          ) : toastType === "SUCCESS" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Flash Announcement Bar */}
      <div className="bg-[#0B132B] text-gray-200 text-xs py-2 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-galaxy text-white font-black text-[10px] tracking-wide uppercase shadow-xs">
              <Zap className="w-3 h-3 fill-white" /> FLASH SALE
            </span>
            <span className="text-gray-300 font-medium hidden md:inline">
              Free Same-Day Express Delivery in Lagos on orders over ₦100,000
            </span>
            <span className="text-amber-400 font-bold ml-1">Use Code: ZINO2026 for 10% OFF</span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Ends in: {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s</span>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
              <Link href="/" className="hover:text-white transition-colors">
                Zino Group Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-4 sm:gap-6">
          {/* Brand Logo */}
          <Link href="/shop" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-galaxy-dark via-galaxy to-blue-600 p-0.5 shadow-md shadow-galaxy/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                <Image
                  src="/logos/device-galaxy.png"
                  alt="Device Galaxy"
                  width={42}
                  height={42}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-gray-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-galaxy transition-colors">
                  DEVICE GALAXY
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-galaxy/10 text-galaxy font-extrabold text-[9px] uppercase tracking-wider">
                  OFFICIAL
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase block mt-0.5">
                Modern Electronics & Gadgets
              </span>
            </div>
          </Link>

          {/* Omnibar Search with Instant Live Suggestions */}
          <div className="relative flex-1 max-w-xl hidden md:block">
            <div
              className={`flex items-center w-full h-11 px-3.5 rounded-2xl border transition-all duration-200 bg-gray-50/80 ${
                isSearchFocused
                  ? "bg-white border-galaxy ring-4 ring-galaxy/10 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search MacBook, Samsung NVMe, JBL soundbars, SSDs... (Press '/' to focus)"
                className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-block text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-2xs">
                  /
                </kbd>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 divide-y divide-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Quick Search Results</span>
                  <span>{searchSuggestions.length} items</span>
                </div>
                {searchSuggestions.map((item) => (
                  <div
                    key={item.id}
                    onMouseDown={() => handleOpenPreview(item)}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-galaxy-tint/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 p-1 flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-500">{item.category} · {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-galaxy">{formatCurrency(item.priceKobo)}</p>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center"
              title="Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? "text-rose-500 fill-rose-500" : "text-gray-600"}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-galaxy to-galaxy-dark hover:brightness-110 text-white font-bold text-xs flex items-center gap-2.5 shadow-md shadow-galaxy/20 transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 px-1.5 min-w-[18px] h-[18px] rounded-full bg-amber-400 text-gray-900 font-black text-[10px] flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
              {cartSubtotalKobo > 0 && (
                <span className="hidden md:inline font-mono font-extrabold pl-1.5 border-l border-white/20">
                  {formatCurrency(cartSubtotalKobo)}
                </span>
              )}
            </button>

            {/* Instant Checkout Link */}
            <Link
              href="/shop/checkout"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0F172A] hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Row (Visible on Small Screens) */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-galaxy text-xs">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gadgets, SSDs, laptops..."
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Interactive Hero Banner Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-gray-800">
        {/* Subtle decorative glow balls */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-galaxy/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Featured Tech Flagships · 2026 Collection</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Engineered For <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-galaxy-light to-amber-300">Extreme Speed</span> & Precision.
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Official Apple Silicon, lightning-fast Samsung PCIe 4.0 NVMe SSDs, Dolby Atmos surround home theaters, and enterprise storage servers. Genuine warranty and same-day doorstep dispatch in Nigeria.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#catalog"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-galaxy to-galaxy-dark hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-galaxy/30 flex items-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Catalog ({allMergedProducts.length} Devices)</span>
                </a>

                <Link
                  href="/shop/checkout"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 backdrop-blur-sm flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Instant Paystack Checkout</span>
                </Link>
              </div>

              {/* Micro specs bullet points */}
              <div className="pt-4 grid grid-cols-3 gap-3 text-left border-t border-white/10 max-w-xl mx-auto lg:mx-0">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 backdrop-blur-xs">
                  <p className="text-[10px] text-gray-400 font-medium">Delivery</p>
                  <p className="text-xs font-bold text-white mt-0.5">Same-Day Lagos</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 backdrop-blur-xs">
                  <p className="text-[10px] text-gray-400 font-medium">Warranty</p>
                  <p className="text-xs font-bold text-white mt-0.5">1-5 Yrs Official</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 backdrop-blur-xs">
                  <p className="text-[10px] text-gray-400 font-medium">Payments</p>
                  <p className="text-xs font-bold text-white mt-0.5">Card / Transfer / COD</p>
                </div>
              </div>
            </div>

            {/* Hero Right Featured Device Card with Slide Switcher */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {heroSlides[activeHeroSlide] && (
                <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-white/15 to-white/5 p-6 border border-white/20 backdrop-blur-xl shadow-2xl relative transition-all duration-300">
                  {/* Slide Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-gray-900 font-extrabold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Deal of the Day
                    </span>
                    <span className="text-xs text-gray-300 font-mono">
                      {activeHeroSlide + 1} of {heroSlides.length}
                    </span>
                  </div>

                  {/* Device Image Showcase */}
                  <div
                    onClick={() => handleOpenPreview(heroSlides[activeHeroSlide])}
                    className="relative aspect-4/3 w-full rounded-2xl bg-white p-5 flex items-center justify-center cursor-pointer overflow-hidden shadow-inner group/heroImg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroSlides[activeHeroSlide].image}
                      alt={heroSlides[activeHeroSlide].name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/heroImg:scale-108"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/heroImg:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                      <Eye className="w-4 h-4" />
                      <span>Quick Preview Specs</span>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="mt-4">
                    <p className="text-xs text-galaxy-light font-bold uppercase tracking-wider">
                      {heroSlides[activeHeroSlide].category}
                    </p>
                    <h3 className="font-bold text-white text-base mt-1 line-clamp-1">
                      {heroSlides[activeHeroSlide].name}
                    </h3>

                    {/* Price and Add button */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xl sm:text-2xl font-black text-amber-300">
                          {formatCurrency(heroSlides[activeHeroSlide].priceKobo)}
                        </p>
                        {heroSlides[activeHeroSlide].originalPriceKobo && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(heroSlides[activeHeroSlide].originalPriceKobo)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(heroSlides[activeHeroSlide], 1, e)}
                        className="px-4 py-2.5 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add To Cart</span>
                      </button>
                    </div>
                  </div>

                  {/* Slide Carousel Indicators */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {heroSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveHeroSlide(idx)}
                          className={`h-2 rounded-full transition-all ${
                            activeHeroSlide === idx ? "w-6 bg-amber-400" : "w-2 bg-white/30 hover:bg-white/50"
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveHeroSlide((prev) => (prev > 0 ? prev - 1 : heroSlides.length - 1))
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveHeroSlide((prev) => (prev < heroSlides.length - 1 ? prev + 1 : 0))
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Perks Bar */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-galaxy flex items-center justify-center shrink-0 border border-blue-100">
              <Truck className="w-5 h-5 text-galaxy" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Same-Day Express Dispatch</h4>
              <p className="text-[11px] text-gray-500">Fast doorstep delivery across Lagos & Nigeria</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">100% Genuine Guaranteed</h4>
              <p className="text-[11px] text-gray-500">Official brand sealed packages with direct warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">30-Day Hassle-Free Returns</h4>
              <p className="text-[11px] text-gray-500">Defect replacement policy with zero hassle</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Dedicated Tech Support</h4>
              <p className="text-[11px] text-gray-500">Certified engineers assist with setup & specs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <section id="catalog" className="py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
        {/* Category Pills Navigation Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Shop By Category
              </h2>
              <p className="text-xs text-gray-500">Filter through our high-performance hardware inventory</p>
            </div>

            {/* Quick Filter Summary */}
            <span className="text-xs font-bold text-gray-500">
              Showing {filteredProducts.length} of {allMergedProducts.length} devices
            </span>
          </div>

          {/* Horizontally scrollable category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat === "ALL"
                  ? allMergedProducts.length
                  : allMergedProducts.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-galaxy text-white border-galaxy shadow-md shadow-galaxy/20 scale-[1.02]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat === "ALL" ? "All Electronics" : cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar & Filter Controls Bar */}
        <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick Tab Filter Pills */}
            <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl">
              {(["ALL", "BESTSELLER", "SALE", "NEW"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab === "ALL" ? "All Deals" : tab === "BESTSELLER" ? "Bestsellers" : tab === "SALE" ? "On Sale" : "New Arrivals"}
                </button>
              ))}
            </div>

            {/* Right side controls: Sort, Price Filter, View Mode, In-stock Toggle */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {/* In-Stock Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 select-none px-2 py-1.5 rounded-xl hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-galaxy focus:ring-galaxy w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] sm:text-xs">In-Stock Only</span>
              </label>

              {/* Price Filter Dropdown */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="h-9 px-3 rounded-xl border border-gray-200 bg-white font-medium text-xs text-gray-700 focus:outline-none focus:border-galaxy cursor-pointer"
              >
                <option value="ALL">All Price Ranges</option>
                <option value="UNDER_100K">Under ₦100,000</option>
                <option value="100K_500K">₦100k - ₦500,000</option>
                <option value="500K_2M">₦500k - ₦2,000,000</option>
                <option value="ABOVE_2M">Above ₦2,000,000</option>
              </select>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-2.5 h-9 bg-white">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium text-xs text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="FEATURED">Sort: Featured</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="RATING">Highest Rated</option>
                  <option value="NAME">Name: A to Z</option>
                </select>
              </div>

              {/* View Mode Toggle (Grid vs List) */}
              <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewMode("GRID")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "GRID" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("LIST")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "LIST" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedCategory !== "ALL" ||
            activeTab !== "ALL" ||
            priceFilter !== "ALL" ||
            inStockOnly ||
            searchQuery.trim()) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-galaxy-tint text-galaxy font-semibold text-[11px]">
                  Keyword: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-[11px]">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("ALL")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeTab !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-[11px]">
                  Tab: {activeTab}
                  <button onClick={() => setActiveTab("ALL")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-[11px]">
                  Price: {priceFilter.replace("_", " ")}
                  <button onClick={() => setPriceFilter("ALL")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-[11px]">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setActiveTab("ALL");
                  setPriceFilter("ALL");
                  setInStockOnly(false);
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold ml-1 hover:underline"
              >
                Reset all
              </button>
            </div>
          )}
        </div>

        {/* Product Cards Catalog (Grid or List View) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No matching products found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              We couldn't find any electronics matching your selected filters or search query. Try clearing your filters to explore our full hardware collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setActiveTab("ALL");
                setPriceFilter("ALL");
                setInStockOnly(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-galaxy text-white font-bold text-xs uppercase tracking-wider hover:bg-galaxy-dark transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "GRID" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((p) => {
              const isWishlisted = wishlist.includes(p.id);
              const discountPercent = p.originalPriceKobo
                ? Math.round(((p.originalPriceKobo - p.priceKobo) / p.originalPriceKobo) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenPreview(p)}
                  className="group bg-white rounded-3xl border border-gray-200/90 p-4 shadow-xs hover:shadow-xl hover:border-galaxy/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                >
                  <div>
                    {/* Uniform Square Product Image Box */}
                    <div className="relative aspect-square w-full rounded-2xl bg-[#F8FAFC] border border-gray-100 p-5 flex items-center justify-center overflow-hidden mb-3.5 group-hover:bg-blue-50/20 transition-colors">
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                        {p.badge && (
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide shadow-xs ${
                              p.badge === "OUT_OF_STOCK"
                                ? "bg-gray-800 text-white"
                                : p.badge === "BESTSELLER"
                                ? "bg-amber-500 text-white"
                                : p.badge === "HOT"
                                ? "bg-rose-500 text-white"
                                : p.badge === "NEW"
                                ? "bg-blue-600 text-white"
                                : "bg-galaxy text-white"
                            }`}
                          >
                            {p.badge === "OUT_OF_STOCK" ? "Out of Stock" : p.badge}
                          </span>
                        )}
                        {discountPercent > 0 && p.badge !== "OUT_OF_STOCK" && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Top Right Floating Action Buttons: Wishlist & Quick View */}
                      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(p.id, e)}
                          className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all ${
                            isWishlisted
                              ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                              : "bg-white/90 text-gray-500 hover:text-rose-500 hover:bg-white"
                          }`}
                          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleOpenPreview(p, e)}
                          className="w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:text-galaxy hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Quick View Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Element */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.name}
                        className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-108"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700";
                        }}
                      />
                    </div>

                    {/* Brand & Category */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <span>{p.brand || "Device Galaxy"}</span>
                      <span className="text-galaxy font-semibold">{p.category}</span>
                    </div>

                    {/* Title */}
                    <Link
                      href={`/shop/products/${p.slug || p.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug hover:text-galaxy transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </Link>

                    {/* Spec Tag Highlight */}
                    {p.tag && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-[10px] font-semibold">
                          {p.tag}
                        </span>
                      </div>
                    )}

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < p.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">({p.reviewsCount})</span>
                    </div>

                    {/* Price & Savings Display */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-gray-950">
                        {formatCurrency(p.priceKobo)}
                      </span>
                      {p.originalPriceKobo && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(p.originalPriceKobo)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Urgency */}
                    <div className="mt-2 text-[11px] font-semibold">
                      {!p.inStock ? (
                        <span className="text-rose-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" /> Out of Stock
                        </span>
                      ) : p.stockCount <= 3 ? (
                        <span className="text-amber-600 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-amber-500" /> Only {p.stockCount} left in stock!
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> In Stock · Ships Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!p.inStock}
                      onClick={(e) => handleAddToCart(p, 1, e)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-galaxy to-galaxy-dark hover:brightness-110 disabled:bg-gray-100 disabled:text-gray-400 disabled:from-gray-100 disabled:to-gray-100 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{p.inStock ? "Add to Cart" : "Sold Out"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenPreview(p, e)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-galaxy text-gray-600 hover:text-galaxy hover:bg-galaxy-tint/30 transition-colors"
                      title="Inspect Specifications"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Mode */
          <div className="space-y-4">
            {filteredProducts.map((p) => {
              const isWishlisted = wishlist.includes(p.id);
              const discountPercent = p.originalPriceKobo
                ? Math.round(((p.originalPriceKobo - p.priceKobo) / p.originalPriceKobo) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenPreview(p)}
                  className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-galaxy/40 transition-all flex flex-col sm:flex-row items-center gap-5 cursor-pointer group"
                >
                  {/* Thumbnail Container */}
                  <div className="relative w-full sm:w-44 aspect-square rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                    {p.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-galaxy text-white">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-gray-500 uppercase">
                      <span>{p.brand}</span>
                      <span>·</span>
                      <span className="text-galaxy">{p.category}</span>
                      <span>·</span>
                      <span className="font-mono text-gray-400">SKU: {p.sku}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base group-hover:text-galaxy transition-colors">
                      {p.name}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl font-normal">
                      {p.description}
                    </p>

                    {/* Rating & Tag */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1 font-semibold">({p.reviewsCount} reviews)</span>
                      </div>
                      {p.tag && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-[10px] font-bold">
                          {p.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Call to Action on the Right */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-black text-gray-950">{formatCurrency(p.priceKobo)}</p>
                      {p.originalPriceKobo && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatCurrency(p.originalPriceKobo)}
                        </p>
                      )}
                      <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                        {p.inStock ? "Ready to ship" : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(p.id, e)}
                        className={`p-2.5 rounded-xl border border-gray-200 transition-colors ${
                          isWishlisted ? "bg-rose-50 text-rose-500" : "hover:bg-gray-50 text-gray-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
                      </button>

                      <button
                        type="button"
                        disabled={!p.inStock}
                        onClick={(e) => handleAddToCart(p, 1, e)}
                        className="px-5 py-2.5 rounded-xl bg-galaxy hover:bg-galaxy-dark disabled:bg-gray-200 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                      >
                        {p.inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick View Product Modal Dialog */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setPreviewProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Product Visual Gallery */}
              <div className="space-y-4">
                <div className="aspect-square w-full rounded-2xl bg-gray-50 border border-gray-100 p-6 flex items-center justify-center overflow-hidden relative">
                  {previewProduct.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-galaxy text-white shadow-xs">
                      {previewProduct.badge}
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      previewProduct.images && previewProduct.images[previewImageIdx]
                        ? previewProduct.images[previewImageIdx]
                        : previewProduct.image
                    }
                    alt={previewProduct.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Thumbnail Previews */}
                {previewProduct.images && previewProduct.images.length > 1 && (
                  <div className="flex items-center gap-2">
                    {previewProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImageIdx(idx)}
                        className={`w-14 h-14 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden transition-all ${
                          previewImageIdx === idx ? "border-galaxy ring-2 ring-galaxy/20 scale-105" : "border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="Thumb" className="max-h-full max-w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Trust Checklist */}
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Lagos Same-Day Delivery available for this device</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Official Manufacturer Sealed Package & Warranty</span>
                  </div>
                </div>
              </div>

              {/* Product Specifications & Purchase Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-galaxy bg-galaxy-tint px-2.5 py-1 rounded-md">
                    {previewProduct.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">SKU: {previewProduct.sku}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-gray-950 leading-snug">
                  {previewProduct.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 text-amber-400">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-bold">
                    5.0 ({previewProduct.reviewsCount} Customer Reviews)
                  </span>
                </div>

                {/* Pricing Display */}
                <div className="flex items-baseline gap-3 py-1">
                  <span className="text-2xl sm:text-3xl font-black text-gray-950">
                    {formatCurrency(previewProduct.priceKobo)}
                  </span>
                  {previewProduct.originalPriceKobo && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(previewProduct.originalPriceKobo)}
                    </span>
                  )}
                  {previewProduct.originalPriceKobo && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Save {formatCurrency(previewProduct.originalPriceKobo - previewProduct.priceKobo)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {previewProduct.description}
                </p>

                {/* Key Technical Specs Table */}
                {previewProduct.specs && (
                  <div className="bg-gray-50 rounded-2xl p-3.5 text-xs space-y-2 border border-gray-200">
                    <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                      Technical Specifications
                    </p>
                    <div className="divide-y divide-gray-200/60 text-[11px]">
                      {Object.entries(previewProduct.specs).map(([key, val]) => (
                        <div key={key} className="py-1.5 flex justify-between gap-4">
                          <span className="text-gray-500 font-medium">{key}</span>
                          <span className="font-bold text-gray-900 text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Cart Controls */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewQty((prev) => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-gray-700 hover:bg-gray-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-xs text-gray-900">
                        {previewQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewQty((prev) => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-gray-700 hover:bg-gray-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={!previewProduct.inStock}
                      onClick={() => {
                        handleAddToCart(previewProduct, previewQty);
                        setPreviewProduct(null);
                        setIsCartOpen(true);
                      }}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-galaxy to-galaxy-dark hover:brightness-110 disabled:bg-gray-200 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-galaxy/20 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{previewProduct.inStock ? "Add to Cart & View" : "Out of Stock"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/shop/products/${previewProduct.slug || previewProduct.id}`}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-center font-bold text-xs uppercase tracking-wider text-gray-700 transition-colors"
                    >
                      View Dedicated Product Page
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(previewProduct.id, e)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                      title="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.includes(previewProduct.id) ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Shopping Cart Drawer (Opens from Right) */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Drawer Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-galaxy-tint flex items-center justify-center text-galaxy">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">Shopping Cart</h3>
                  <p className="text-[11px] text-gray-500">{cartCount} items in cart</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="bg-blue-50/60 p-3.5 border-b border-blue-100 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-800 text-[11px] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-galaxy" />
                  {cartSubtotalKobo >= freeShippingThresholdKobo
                    ? "🎉 You unlocked FREE Same-Day Express Delivery!"
                    : `Add ${formatCurrency(freeShippingThresholdKobo - cartSubtotalKobo)} more for FREE Express Shipping`}
                </span>
                <span className="font-mono text-galaxy">{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-galaxy h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items Scrollable List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">Your cart is currently empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Explore our electronics catalog and add ultra-fast SSDs, laptops or sound systems.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-galaxy text-white font-bold text-xs uppercase tracking-wider hover:bg-galaxy-dark transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-center">
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">SKU: {item.sku}</p>
                      <p className="text-xs font-black text-galaxy mt-0.5">
                        {formatCurrency(item.priceKobo)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}
                            className="w-6 h-6 rounded bg-white shadow-2xs flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-6 h-6 rounded bg-white shadow-2xs flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-gray-900">
                        {formatCurrency(item.priceKobo * item.qty)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Drawer Footer with Totals and Checkout */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-gray-200 bg-gray-50/80 space-y-3">
                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={cartCoupon}
                    onChange={(e) => setCartCoupon(e.target.value)}
                    placeholder="Coupon code (ZINO2026)"
                    className="flex-1 h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:border-galaxy"
                  />
                  <button
                    type="submit"
                    className="px-3.5 h-9 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs"
                  >
                    Apply
                  </button>
                </form>
                {couponError && <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 font-bold">
                    ✓ Promo code "{appliedCoupon}" applied!
                  </p>
                )}

                {/* Cost Calculations */}
                <div className="space-y-1.5 text-xs text-gray-600 pt-1 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">{formatCurrency(cartSubtotalKobo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (7.5%)</span>
                    <span>{formatCurrency(cartVatKobo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>{cartShippingKobo === 0 ? "FREE" : formatCurrency(cartShippingKobo)}</span>
                  </div>
                  {couponDiscountKobo > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>-{formatCurrency(couponDiscountKobo)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-gray-950 pt-2 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span className="text-base text-galaxy">{formatCurrency(cartTotalKobo)}</span>
                  </div>
                </div>

                {/* Checkout Link */}
                <Link
                  href="/shop/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-galaxy to-galaxy-dark hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-galaxy/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Checkout ({formatCurrency(cartTotalKobo)})</span>
                </Link>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="text-galaxy font-bold hover:underline"
                  >
                    Continue Shopping →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Slide-Over Drawer */}
      {isWishlistOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsWishlistOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">Saved Wishlist</h3>
                  <p className="text-[11px] text-gray-500">{wishlist.length} saved devices</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
              {wishlistProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Heart className="w-12 h-12 text-gray-300" />
                  <h4 className="font-bold text-gray-800 text-sm">Your wishlist is empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Tap the heart icon on any product in our store to save it here for later.
                  </p>
                </div>
              ) : (
                wishlistProducts.map((p) => (
                  <div key={p.id} className="py-4 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs font-black text-galaxy mt-0.5">{formatCurrency(p.priceKobo)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddToCart(p, 1);
                            setIsCartOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-galaxy text-white font-bold text-[10px] uppercase hover:bg-galaxy-dark"
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p.id)}
                          className="text-[11px] text-gray-400 hover:text-rose-600 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="text-xs font-bold text-galaxy hover:underline"
              >
                Close Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 shadow-lg flex items-center justify-around">
        <a href="#catalog" className="flex flex-col items-center text-gray-600 hover:text-galaxy text-[10px] font-bold">
          <LayoutGrid className="w-4 h-4 mb-0.5" />
          <span>Catalog</span>
        </a>

        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center text-gray-600 hover:text-galaxy text-[10px] font-bold"
        >
          <Heart className="w-4 h-4 mb-0.5" />
          <span>Wishlist</span>
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center text-galaxy text-[10px] font-bold"
        >
          <ShoppingCart className="w-4 h-4 mb-0.5" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-gray-900 text-[9px] flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>

        <Link
          href="/shop/checkout"
          className="flex flex-col items-center text-gray-900 text-[10px] font-black"
        >
          <CreditCard className="w-4 h-4 mb-0.5 text-emerald-600" />
          <span>Checkout</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B132B] text-gray-400 py-12 px-4 sm:px-8 border-t border-gray-800 text-xs mt-12 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-galaxy flex items-center justify-center p-1">
                  <Image src="/logos/device-galaxy.png" alt="Logo" width={24} height={24} className="object-contain" />
                </div>
                <span className="font-black text-white text-base">DEVICE GALAXY</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Authorized premium retailer of high-performance electronics, NVMe storage, Apple workstations, and home theater sound systems. Member of the Zino Group network.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popular Categories</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#catalog" className="hover:text-white transition-colors">PCIe 4.0 NVMe M.2 SSDs</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Apple MacBook Pro & Air M3</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Dolby Atmos Surround Bars</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Enterprise Synology Rackstations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Customer Support</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-gray-400">Phone: +234 80 60797058</span></li>
                <li><span className="text-gray-400">Email: sales@devicegalaxy.com</span></li>
                <li><span className="text-gray-400">Lagos Dispatch Hub: Computer Village, Ikeja</span></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Secure Checkout</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Protected by 256-bit SSL encryption. We accept Paystack, Debit/Credit Cards, Instant Bank Transfers, and Cash on Delivery.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Paystack PCI-DSS Level 1 Verified</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
            <p>© 2026 Device Galaxy · A Division of Zino Group Nigeria.</p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-gray-300">Staff Portal</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              <span>·</span>
              <Link href="/refund-policy" className="hover:text-gray-300">Refund Guarantee</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
