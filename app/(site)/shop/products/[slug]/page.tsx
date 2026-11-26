"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Plus,
  Minus,
  Share2,
  Heart,
  ChevronRight,
  Package,
  Zap,
  CreditCard,
  Sparkles,
  Check,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { CATALOG_PRODUCTS, type StoreProduct } from "@/lib/shop-data";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { products: storeProducts, addToCart, cartItems } = usePlatformStore();
  const cartCount = cartItems.reduce((acc, it) => acc + it.qty, 0);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"SPECS" | "DESCRIPTION" | "FEATURES" | "REVIEWS">("SPECS");
  const [addedToast, setAddedToast] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find product by slug or id from unified store first, then catalog fallback
  const product: StoreProduct | undefined = React.useMemo(() => {
    const catalogMatch = CATALOG_PRODUCTS.find(
      (p) =>
        p.slug === slug ||
        p.id === slug ||
        p.sku.toLowerCase() === slug?.toLowerCase() ||
        p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
    );

    const fromStore = storeProducts.find(
      (p) =>
        p.id === slug ||
        p.sku.toLowerCase() === slug?.toLowerCase() ||
        p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
    );

    if (fromStore) {
      return {
        id: fromStore.id,
        sku: fromStore.sku,
        slug: fromStore.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: fromStore.name,
        brand: catalogMatch?.brand || "Device Galaxy",
        category: fromStore.label || catalogMatch?.category || "Electronics",
        priceKobo: fromStore.priceKobo,
        originalPriceKobo: catalogMatch?.originalPriceKobo || Math.round(fromStore.priceKobo * 1.14),
        image: fromStore.imageUrl || catalogMatch?.image || "",
        images: fromStore.images?.length
          ? fromStore.images
          : catalogMatch?.images || (fromStore.imageUrl ? [fromStore.imageUrl] : []),
        badge: (fromStore.status === "OUT_OF_STOCK"
          ? "OUT_OF_STOCK"
          : catalogMatch?.badge || "SALE") as StoreProduct["badge"],
        inStock: fromStore.status !== "OUT_OF_STOCK" && fromStore.totalStock > 0,
        stockCount: fromStore.totalStock,
        reviewsCount: catalogMatch?.reviewsCount || 24,
        rating: catalogMatch?.rating || 5,
        tag: catalogMatch?.tag || fromStore.label,
        description: fromStore.description || catalogMatch?.description || fromStore.name,
        specs: catalogMatch?.specs || {
          Category: fromStore.label || "Electronics",
          "Warranty Period": "12 Months Official Manufacturer Warranty",
          Availability: `${fromStore.totalStock} Units in Lagos Stock`,
        },
        features: catalogMatch?.features || [
          "Original factory-sealed package",
          "Same-day doorstep dispatch in Lagos",
          "Comprehensive manufacturer warranty",
        ],
      };
    }

    // If products have already hydrated from the unified platform store, do not resurrect deleted demo products
    if (storeProducts.length > 0) {
      return undefined;
    }

    return catalogMatch;
  }, [slug, storeProducts]);

  // Wishlist handling
  useEffect(() => {
    if (!product) return;
    try {
      const saved = localStorage.getItem("galaxy_wishlist");
      if (saved) {
        const list = JSON.parse(saved);
        setIsWishlisted(list.includes(product.id));
      }
    } catch {}
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const saved = localStorage.getItem("galaxy_wishlist");
      const list = saved ? JSON.parse(saved) : [];
      let next: string[];
      if (list.includes(product.id)) {
        next = list.filter((id: string) => id !== product.id);
        setIsWishlisted(false);
        showToast("Removed from wishlist");
      } else {
        next = [...list, product.id];
        setIsWishlisted(true);
        showToast("Added to your wishlist!");
      }
      localStorage.setItem("galaxy_wishlist", JSON.stringify(next));
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const images = product?.images?.length ? product.images : [product?.image || ""];
  const currentImage = selectedImage || images[0];

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    addToCart({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      priceKobo: product.priceKobo,
      qty: quantity,
      image: product.image,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/shop/checkout");
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Device Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            The requested device could not be located in our active hardware inventory.
          </p>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl bg-galaxy text-white font-bold text-xs uppercase"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans">
      {/* Toast Alert */}
      {(addedToast || toastMessage) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0B132B] text-white text-xs font-bold shadow-2xl border border-galaxy/40 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage || `Added ${quantity}x "${product.name}" to cart!`}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-[#0B132B] text-gray-300 text-xs py-2 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span>sales@devicegalaxy.com</span>
            <span className="hidden sm:inline">+234 80 60797058</span>
            <span className="text-amber-400 font-bold hidden md:inline">
              ⚡ Same-Day Lagos Doorstep Delivery
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
            <Link href="/" className="hover:text-white font-semibold transition-colors">
              Zino Group Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-6">
          <Link href="/shop" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-galaxy-dark to-galaxy p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1">
                <Image
                  src="/logos/device-galaxy.png"
                  alt="Device Galaxy"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <span className="font-black text-gray-900 text-xl tracking-tight block leading-tight group-hover:text-galaxy transition-colors">
                DEVICE GALAXY
              </span>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase block">
                Official Electronics Store
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Link>

            <Link
              href="/shop/checkout"
              className="p-2.5 px-4 rounded-xl bg-galaxy hover:bg-galaxy-dark text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-galaxy/20 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span>Cart ({cartCount})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/shop" className="hover:text-galaxy flex items-center gap-1 font-semibold">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-600">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-950 font-bold truncate max-w-sm">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 flex-1 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Large Image Frame */}
            <div className="aspect-square w-full rounded-3xl bg-white border border-gray-200 p-8 flex items-center justify-center shadow-xs overflow-hidden relative">
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-galaxy text-white shadow-xs">
                  {product.badge}
                </span>
              )}

              {/* Wishlist Heart on Product Page */}
              <button
                type="button"
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-colors ${
                  isWishlisted ? "bg-rose-50 text-rose-500" : "bg-gray-100 hover:bg-white text-gray-500"
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>

              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                />
              ) : (
                <Package className="w-16 h-16 text-gray-300" />
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl bg-white p-2 border shrink-0 flex items-center justify-center transition-all ${
                      currentImage === img
                        ? "border-galaxy ring-2 ring-galaxy/20 shadow-xs scale-102"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`View ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Buy Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-galaxy bg-galaxy-tint px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {product.brand} Official
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-xs">
                <span className="font-mono text-gray-400">SKU: {product.sku}</span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-gray-600 ml-1">
                    5.0 ({product.reviewsCount} Customer Reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-950">
                  {formatCurrency(product.priceKobo)}
                </span>
                {product.originalPriceKobo && (
                  <span className="text-sm text-gray-400 line-through font-medium">
                    {formatCurrency(product.originalPriceKobo)}
                  </span>
                )}
                {product.originalPriceKobo && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Save {formatCurrency(product.originalPriceKobo - product.priceKobo)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Price inclusive of 7.5% Nigerian VAT. Free Lagos express delivery on orders over ₦100,000.
              </p>
            </div>

            {/* Stock & Availability */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${product.inStock ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <span className={product.inStock ? "text-emerald-700" : "text-rose-600"}>
                {product.inStock
                  ? `${product.stockCount || 8} units available in Lagos dispatch warehouse`
                  : "Currently Out of Stock"}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700">Select Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-2xl bg-white shadow-2xs p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-black text-gray-950">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-gray-500 font-mono font-bold">
                  Total: {formatCurrency(product.priceKobo * quantity)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-galaxy to-galaxy-dark hover:brightness-110 disabled:bg-gray-200 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-galaxy/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#0B132B] hover:bg-black disabled:bg-gray-200 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Buy Now — Instant Checkout</span>
                </button>
              </div>
            </div>

            {/* Guarantee Cards */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-gray-200">
                <ShieldCheck className="w-5 h-5 text-galaxy shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-gray-900">Authorized Brand Warranty</p>
                  <p className="text-gray-500">100% genuine guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-gray-200">
                <Truck className="w-5 h-5 text-galaxy shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-gray-900">Express Lagos Dispatch</p>
                  <p className="text-gray-500">Doorstep delivery within 24h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50 px-6 gap-2">
            {(["SPECS", "DESCRIPTION", "FEATURES", "REVIEWS"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-galaxy text-galaxy bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab === "SPECS"
                  ? "Technical Specifications"
                  : tab === "DESCRIPTION"
                  ? "Product Overview"
                  : tab === "FEATURES"
                  ? "Key Highlights"
                  : "Customer Reviews"}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "SPECS" && (
              <div className="max-w-3xl space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Hardware Specifications Sheet
                </h3>
                {product.specs ? (
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
                    {Object.entries(product.specs).map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`p-3.5 flex justify-between text-xs ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                        }`}
                      >
                        <span className="font-medium text-gray-500">{key}</span>
                        <span className="font-bold text-gray-950 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Official technical sheet is loaded with device shipment.</p>
                )}
              </div>
            )}

            {activeTab === "DESCRIPTION" && (
              <div className="max-w-3xl space-y-4 text-xs text-gray-600 leading-relaxed">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  About {product.name}
                </h3>
                <p>{product.description}</p>
                <p>
                  Every unit sold by Device Galaxy undergoes strict multi-point hardware verification to ensure factory sealing, valid serial registration, and 100% genuine performance.
                </p>
              </div>
            )}

            {activeTab === "FEATURES" && (
              <div className="max-w-3xl space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Key Device Features
                </h3>
                {product.features?.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "REVIEWS" && (
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Verified Buyer Ratings
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-700">5.0 out of 5 stars</span>
                      <span className="text-xs text-gray-400">({product.reviewsCount} verified reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">Engr. Tunde Adeleke</span>
                      <span className="text-[10px] text-gray-400">Verified Buyer · Lagos</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      "Delivered same day to Lekki Phase 1 in pristine sealed packaging. Blazing fast transfer speeds as advertised."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B132B] text-gray-400 py-8 px-4 sm:px-8 border-t border-gray-800 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Device Galaxy · Member of Zino Group Nigeria</p>
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
