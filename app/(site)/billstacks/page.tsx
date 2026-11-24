"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Receipt,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  LayoutDashboard,
  Check,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { recordPlatformTransaction, usePlatformStore } from "@/lib/platform-store";
import { BILLSTACKS_MODULES } from "@/lib/billstacks-modules";
import { ModuleCard } from "@/components/billstacks/ModuleCard";
import { BillstacksApp } from "@/components/billstacks/billstacks-app";

const PLAN_MODULES: Record<string, string[]> = {
  Starter: ["products", "tax", "estimates"],
  Professional: ["products", "tax", "estimates", "recurring-invoices", "role-permissions"],
  Enterprise: [
    "products",
    "tax",
    "hrm",
    "affiliate",
    "estimates",
    "recurring-invoices",
    "role-permissions",
  ],
};

export default function BillstacksPublicPage() {
  const { products: storeProducts } = usePlatformStore();
  const [viewMode, setViewMode] = useState<"APP" | "SHOWCASE" | "PRICING">("APP");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [billToast, setBillToast] = useState<string | null>(null);

  const plans = React.useMemo(() => {
    const billProducts = storeProducts.filter(
      (p) => p.source === ServiceSlug.BILLSTACKS && p.status !== "INACTIVE" && p.status !== "ARCHIVED"
    );
    return billProducts.map((p, idx) => {
      const monthlyNaira = Math.round((p.priceKobo || 0) / 100);
      return {
        id: p.id,
        name: p.name,
        monthlyNaira,
        yearlyNaira: Math.round(monthlyNaira * 0.95),
        popular: idx === 0 || Boolean(p.isFeatured),
        desc: p.description || p.label || "Cloud accounting and B2B billing subscription.",
        features: [
          "Unlimited Invoices & Estimates",
          "Automated Expense Tracking",
          "Client Payment Links (Paystack)",
          "FIRS 7.5% VAT Reporting",
        ],
      };
    });
  }, [storeProducts]);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden max-w-full">
      {billToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{billToast}</span>
        </div>
      )}

      {/* Top Main Navigation Bar with View Mode Switcher */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-2xs">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 px-2.5 py-1 rounded-xl bg-white border border-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src="/logos/billstacks-logo.png"
                  alt="Billstacks Logo"
                  width={628}
                  height={250}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-heading text-lg tracking-tight block leading-tight">
                  BILLSTACKS
                </span>
                <span className="text-[10px] text-muted font-bold tracking-widest uppercase block">
                  Smart Cloud Invoicing
                </span>
              </div>
            </Link>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("APP")}
              className={`px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                viewMode === "APP"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Live Cloud Software</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("SHOWCASE")}
              className={`px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                viewMode === "SHOWCASE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Services &amp; Modules</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("PRICING")}
              className={`hidden sm:flex px-4 py-1.5 rounded-full items-center gap-1.5 transition-all ${
                viewMode === "PRICING"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>Pricing</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/admin/billstacks"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              <span>Unified Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              ← Hub
            </Link>
          </div>
        </div>
      </header>

      {/* Mode 1: Full Interactive Billstacks Web App (Images 1-14) */}
      {viewMode === "APP" && (
        <section aria-label="Billstacks Live Cloud Application" className="flex-1">
          <BillstacksApp />
        </section>
      )}

      {/* Mode 2: Services & Modules Showcase (from BILLSTACKS_SERVICES_INTEGRATION_PROMPT.md) */}
      {viewMode === "SHOWCASE" && (
        <div className="space-y-16">
          {/* Hero Section matching spec: dark teal #0D333F */}
          <section className="bg-[#0D333F] text-white py-20 px-4 sm:px-8">
            <div className="max-w-5xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-billstacks/20 text-billstacks text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Billstacks Cloud Accounting &amp; Invoicing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Manage Your Business &amp; Finances Easily.
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Billstacks simplifies invoices, purchase bills, FIRS 7.5% tax, and expense tracking, saving time and money. Create and send your first professional invoice in under 60 seconds.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("APP")}
                  className="px-6 py-3.5 rounded-full bg-billstacks hover:bg-billstacks-dark text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                >
                  <span>Launch Live Software</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("PRICING")}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/20"
                >
                  View Pricing Plans
                </button>
              </div>
            </div>
          </section>

          {/* Modules & Features Section (from prompt spec) */}
          <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold text-heading tracking-tight">
                Everything You Need to Run Your Business
              </h2>
              <p className="text-xs text-muted">
                Seven integrated modules — activate only what you need, all in one subscription.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BILLSTACKS_MODULES.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onSelect={() => setViewMode("APP")}
                />
              ))}
            </div>

            {/* Module Categories Legend */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs">
              <span className="font-semibold text-heading">Categories:</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                Core (Included in All Plans)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                Add-on (Professional+)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                Premium (Enterprise Only)
              </span>
            </div>
          </section>
        </div>
      )}

      {/* Mode 3: Pricing & Subscriptions */}
      {(viewMode === "PRICING" || viewMode === "SHOWCASE") && (
        <section id="pricing" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12 border-t border-gray-100">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-heading tracking-tight">
              Small Business—friendly Pricing
            </h2>
            <p className="text-xs text-muted mt-2">
              Affordable monthly subscriptions designed to scale with your business cash flow.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="mt-6 inline-flex items-center p-1 rounded-full bg-gray-100 border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  billingCycle === "MONTHLY" ? "bg-white text-heading shadow-xs" : "text-muted"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("YEARLY")}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  billingCycle === "YEARLY" ? "bg-white text-heading shadow-xs" : "text-muted"
                }`}
              >
                Yearly (5% Off)
              </button>
            </div>
          </div>

          {/* Unified Pricing Cards from Main Admin Dashboard */}
          {plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-xs text-gray-500">
              No active Billstacks subscription plans have been added in the Main Admin Dashboard yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((p) => {
                const price = billingCycle === "MONTHLY" ? p.monthlyNaira : p.yearlyNaira;
                const moduleIds = PLAN_MODULES[p.name] || ["products", "tax", "estimates"];

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-3xl p-8 border transition-all flex flex-col justify-between ${
                      p.popular
                        ? "border-billstacks shadow-xl ring-2 ring-billstacks/20"
                        : "border-border shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div>
                      {p.popular && (
                        <span className="inline-block px-3 py-1 rounded-full bg-billstacks-tint text-billstacks font-bold text-[10px] uppercase tracking-wider mb-4">
                          Active Admin Plan
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-heading">{p.name}</h3>
                      <p className="text-xs text-muted mt-1.5 leading-relaxed">{p.desc}</p>

                      <div className="my-6">
                        <span className="text-4xl font-black text-heading">
                          ₦{price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted font-normal ml-1">/ month</span>
                      </div>

                      <div className="space-y-2 border-t border-border pt-6 text-xs">
                        <p className="font-semibold text-gray-800 text-[11px] uppercase tracking-wider mb-2">
                          Included Modules:
                        </p>
                        {moduleIds.map((modId) => {
                          const m = BILLSTACKS_MODULES.find((mod) => mod.id === modId);
                          return m ? (
                            <li key={m.id} className="flex items-center gap-2.5 text-body list-none">
                              <CheckCircle2 className="w-4 h-4 text-billstacks shrink-0" />
                              <span>{m.name}</span>
                            </li>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="mt-8 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const inv = recordPlatformTransaction({
                            source: ServiceSlug.BILLSTACKS,
                            activityType: "INVOICE",
                            activitySummary: `Billstacks ${p.name} Plan (${billingCycle}) Subscription`,
                            customer: "Billstacks Cloud Subscriber",
                            amountKobo: price * 100,
                            location: "Billstacks Cloud",
                            status: "PAID",
                          });
                          setBillToast(
                            `Subscribed to Billstacks ${p.name} Plan (${inv.invoiceNo}) — logged to Admin Dashboard!`
                          );
                          setTimeout(() => setBillToast(null), 4000);
                        }}
                        className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                          p.popular
                            ? "bg-billstacks hover:bg-billstacks-dark text-white shadow-sm"
                            : "bg-gray-100 hover:bg-gray-200 text-heading"
                        }`}
                      >
                        <span>Subscribe &amp; Start</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-8 border-t border-gray-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 px-2 py-0.5 rounded-lg bg-white border border-border flex items-center justify-center">
              <Image
                src="/logos/billstacks-logo.png"
                alt="Billstacks Logo"
                width={120}
                height={50}
                className="h-5 w-auto object-contain"
              />
            </div>
            <span className="font-semibold text-white">Billstacks Cloud Accounting</span>
          </div>
          <p>© 2026 Billstacks · Operating Unit of Zino One Multi-Tenant Enterprise</p>
        </div>
      </footer>
    </div>
  );
}
