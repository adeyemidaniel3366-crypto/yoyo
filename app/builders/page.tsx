"use client";

import React from "react";
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

export default function TopBuildersPublicPage() {
  const catalogTeaser = [
    { code: "001", name: "Dangote Cement 50kg", price: "₦9,800", unit: "bag", stock: "In Stock" },
    { code: "002", name: "BUA Cement 50kg", price: "₦9,500", unit: "bag", stock: "In Stock" },
    { code: "003", name: "Iron Rod 12mm", price: "₦12,500", unit: "length", stock: "In Stock" },
    { code: "004", name: "Iron Rod 16mm", price: "₦21,500", unit: "length", stock: "In Stock" },
    { code: "008", name: "Aluminium Roofing Sheet 0.45mm", price: "₦8,500", unit: "sheet", stock: "In Stock" },
    { code: "010", name: "PVC Pipe 4 inch", price: "₦6,800", unit: "length", stock: "In Stock" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-muted uppercase">Code #{item.code}</span>
                <h3 className="font-bold text-heading text-base mt-1">{item.name}</h3>
                <p className="text-xl font-black text-builders mt-2">
                  {item.price} <span className="text-xs font-normal text-muted">/{item.unit}</span>
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.stock}</span>
                </span>
                <Link
                  href="/admin/builders/sales/new"
                  className="font-bold text-builders hover:underline"
                >
                  Order via POS →
                </Link>
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
