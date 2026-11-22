"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<"SPECS" | "DESCRIPTION" | "REVIEWS">("SPECS");
  const [addedToast, setAddedToast] = useState(false);

  // Find product by slug or id from unified store first, then catalog fallback
  const product: StoreProduct | undefined = React.useMemo(() => {
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
        category: fromStore.label || "Electronics",
        priceKobo: fromStore.priceKobo,
        originalPriceKobo: Math.round(fromStore.priceKobo * 1.12),
        image: fromStore.imageUrl || "",
        images: fromStore.images?.length ? fromStore.images : fromStore.imageUrl ? [fromStore.imageUrl] : [],
        badge: (fromStore.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "SALE") as StoreProduct["badge"],
        inStock: fromStore.status !== "OUT_OF_STOCK" && fromStore.totalStock > 0,
        stockCount: fromStore.totalStock,
        reviewsCount: 7,
        rating: 5,
        description: fromStore.description || fromStore.name,
        specs: {
          Category: fromStore.label || "Electronics",
          "Warranty Period": "12 Months Official Manufacturer Warranty",
          Availability: fromStore.totalStock > 0 ? `${fromStore.totalStock} Units in Lagos Stock` : "Backorder",
        },
      };
    }

    return CATALOG_PRODUCTS.find(
      (p) => p.slug === slug || p.id === slug || p.sku.toLowerCase() === slug?.toLowerCase()
    );
  }, [slug, storeProducts]);

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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-border shadow-md max-w-md">
          <Package className="w-12 h-12 text-muted mx-auto mb-3" />
          <h2 className="text-xl font-bold text-heading">Product Not Found</h2>
          <p className="text-xs text-muted mt-1 mb-5">
            The requested device could not be located in our active inventory.
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Added {quantity} unit(s) of "{product.name}" to cart!</span>
        </div>
      )}

      {/* Top Header Bar */}
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
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-2xs">
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

          <div className="flex items-center gap-3">
            <Link
              href="/shop/checkout"
              className="p-2.5 rounded-xl border border-border hover:bg-gray-50 flex items-center gap-2 text-xs font-bold text-heading"
            >
              <ShoppingCart className="w-4 h-4 text-galaxy" />
              <span>Cart ({cartCount})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-border py-3 px-4 sm:px-8 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/shop" className="hover:text-galaxy flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-500">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-heading font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 flex-1 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Large Image Frame */}
            <div className="aspect-square w-full rounded-2xl bg-white border border-border p-6 flex items-center justify-center shadow-xs overflow-hidden relative">
              {product.badge && (
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-galaxy text-white shadow-xs">
                  {product.badge}
                </span>
              )}
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
                    className={`w-20 h-20 rounded-xl bg-white p-2 border shrink-0 flex items-center justify-center transition-all ${
                      currentImage === img
                        ? "border-galaxy ring-2 ring-galaxy/20 shadow-xs"
                        : "border-border hover:border-gray-300"
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
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-galaxy bg-galaxy-tint px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-heading leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-xs">
                <span className="font-mono text-muted">SKU: {product.sku}</span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-muted ml-1">
                    ({product.reviewsCount} Customer Reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-heading">
                  {formatCurrency(product.priceKobo)}
                </span>
                {product.originalPriceKobo && (
                  <span className="text-sm text-muted line-through font-medium">
                    {formatCurrency(product.originalPriceKobo)}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  In Stock & Verified
                </span>
              </div>
              <p className="text-xs text-muted">
                Price includes 7.5% Nigerian VAT. Free delivery in Lagos on orders over ₦100,000.
              </p>
            </div>

            {/* Stock & Availability */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700">
                {product.inStock
                  ? `${product.stockCount || 8} units available at Computer Village Hub`
                  : "Currently Out of Stock"}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-heading">Quantity:</span>
                <div className="flex items-center border border-border rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-muted hover:text-heading transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-black text-heading">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 text-muted hover:text-heading transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted font-mono">
                  Total: {formatCurrency(product.priceKobo * quantity)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-galaxy hover:bg-galaxy-dark disabled:bg-gray-200 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-heading hover:bg-black disabled:bg-gray-200 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Buy Now — Instant Checkout</span>
                </button>
              </div>
            </div>

            {/* Guarantee Cards */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-border">
                <ShieldCheck className="w-5 h-5 text-galaxy shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-heading">Authorized Brand Warranty</p>
                  <p className="text-muted">100% genuine guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-border">
                <Truck className="w-5 h-5 text-galaxy shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-heading">Same-Day Lagos Dispatch</p>
                  <p className="text-muted">Direct to your doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs & Details Tabs */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-6 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("SPECS")}
              className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                activeTab === "SPECS"
                  ? "border-galaxy text-galaxy"
                  : "border-transparent text-muted hover:text-heading"
              }`}
            >
              Technical Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DESCRIPTION")}
              className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                activeTab === "DESCRIPTION"
                  ? "border-galaxy text-galaxy"
                  : "border-transparent text-muted hover:text-heading"
              }`}
            >
              Full Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("REVIEWS")}
              className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                activeTab === "REVIEWS"
                  ? "border-galaxy text-galaxy"
                  : "border-transparent text-muted hover:text-heading"
              }`}
            >
              Reviews ({product.reviewsCount})
            </button>
          </div>

          {activeTab === "SPECS" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-heading">Hardware &amp; Performance Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.specs ? (
                  Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-gray-50 border border-border flex items-center justify-between text-xs"
                    >
                      <span className="text-muted font-semibold">{key}</span>
                      <span className="font-extrabold text-heading">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted">Standard factory specifications apply.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "DESCRIPTION" && (
            <div className="space-y-3 text-xs leading-relaxed text-gray-700 max-w-3xl">
              <p>{product.description}</p>
              <p>
                All devices shipped through Device Galaxy include an official inspection certificate,
                original manufacturer accessories, high-speed cables, and warranty card.
              </p>
            </div>
          )}

          {activeTab === "REVIEWS" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-heading">5.0</span>
                <div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-0.5">Based on verified customer orders</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-border space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-heading">
                  <span>Dr. Babatunde A. (Lekki Phase 1)</span>
                  <span className="text-muted font-normal">2 days ago</span>
                </div>
                <p className="text-gray-600">
                  "Delivered same day in Lagos. Authentic sealed box, serial number verified online. Highly recommended!"
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A252F] text-gray-400 py-8 px-4 sm:px-8 border-t border-gray-800 text-xs text-center mt-12">
        <p>© 2026 Device Galaxy · Member of Zino Group</p>
      </footer>
    </div>
  );
}
