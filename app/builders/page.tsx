"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HardHat,
  Truck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";

export default function TopBuildersPublicPage() {
  const { products, recordTransaction } = usePlatformStore();
  const [builderToast, setBuilderToast] = useState<string | null>(null);

  const storeBuilders = products
    .filter((p) => p.source === ServiceSlug.BUILDERS && p.status !== "INACTIVE")
    .map((p) => ({
      code: p.sku,
      name: p.name,
      label: p.label,
      price: p.priceDisplay,
      priceKobo: p.priceKobo,
      image: p.imageUrl,
      unit: "unit",
      stock: p.status === "OUT_OF_STOCK" ? "Out of Stock" : `${p.totalStock} in Stock`,
    }));

  const defaultCatalog = [
    { code: "DAN-CEM-50KG", name: "Dangote Cement 50kg", label: "Wholesale Bag", price: "₦9,800", priceKobo: 980000, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600", unit: "bag", stock: "In Stock" },
    { code: "BUA-CEM-50KG", name: "BUA Cement 50kg", label: "Construction Essential", price: "₦9,500", priceKobo: 950000, image: "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?w=600", unit: "bag", stock: "In Stock" },
    { code: "IRON-ROD-16MM", name: "Iron Rod 16mm", label: "Structural Steel", price: "₦18,000", priceKobo: 1800000, image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600", unit: "length", stock: "In Stock" },
  ];

  const catalogTeaser = storeBuilders.length > 0 ? storeBuilders : defaultCatalog;

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden max-w-full">
      {builderToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{builderToast}</span>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/builders" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-builders flex items-center justify-center font-black text-white text-lg">
              TB
            </div>
            <div>
              <span className="font-extrabold text-heading text-xl tracking-tight block leading-tight">
                TOP BUILDERS
              </span>
              <span className="text-[10px] text-muted font-bold tracking-widest uppercase block">
                Quality Building Materials · Lagos
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-bold">
            <Link href="/admin/builders" className="text-builders hover:underline">
              Admin Sales Book →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#006B3F] to-[#004d2c] text-white py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider">
            Alaba Rago & Ojo Corridor Depot
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Direct-from-Factory Construction Materials.
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Supplying standard Dangote & BUA cement, British-standard high-tensile iron rods, roofing, plumbing and tiling for contractors, developers and private projects.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
            <a
              href="#catalog"
              className="px-6 py-3 rounded-xl bg-[#FFB800] text-gray-900 uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md"
            >
              Browse Catalog
            </a>
            <Link
              href="/admin/builders/sales/new"
              className="px-6 py-3 rounded-xl bg-white/10 text-white uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/20"
            >
              POS Quick Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Catalog Teaser Section */}
      <section id="catalog" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-heading">
            Current Material Prices
          </h2>
          <p className="text-xs text-muted mt-1">
            Subject to daily factory adjustments. Bulk discounts available on truckload orders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogTeaser.map((item) => (
            <div
              key={item.code}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {item.image && (
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <SourceBadge source={ServiceSlug.BUILDERS} size="sm" />
                    </div>
                    {item.label && (
                      <div className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                        {item.label}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <span className="text-[10px] font-mono font-bold text-muted uppercase">
                    Code #{item.code}
                  </span>
                  <h3 className="font-bold text-heading text-base mt-1">{item.name}</h3>
                  <p className="text-xl font-black text-builders mt-2">
                    {item.price}{" "}
                    <span className="text-xs font-normal text-muted">/{item.unit}</span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-border flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.stock}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const inv = recordTransaction({
                      source: ServiceSlug.BUILDERS,
                      activityType: "SALE",
                      activitySummary: `Yard Material Order — ${item.name}`,
                      customer: "Builders Portal Contractor",
                      amountKobo: item.priceKobo || 980000,
                      location: "Builders Yard",
                      status: "PAID",
                    });
                    setBuilderToast(
                      `Ordered "${item.name}" (${inv.invoiceNo}) — synced to Admin Dashboard!`
                    );
                    setTimeout(() => setBuilderToast(null), 4000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-builders text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Quick Order →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-500 py-8 px-4 sm:px-8 text-xs text-center border-t border-border">
        <p>© 2026 Top Builders Best Materials · Member of Zino Group</p>
      </footer>
    </div>
  );
}
