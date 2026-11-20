"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { recordPlatformTransaction } from "@/lib/platform-store";

export default function BillstacksPublicPage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [billToast, setBillToast] = useState<string | null>(null);

  const plans = [
    {
      name: "Basic",
      monthlyNaira: 1300,
      yearlyNaira: 1235, // 5% off
      desc: "Perfect for freelancers and sole traders getting started.",
      features: [
        "Up to 20 Invoices / month",
        "Expense Tracking",
        "Payment Reminders",
        "Single User Access",
      ],
    },
    {
      name: "Standard",
      monthlyNaira: 2000,
      yearlyNaira: 1900, // 5% off
      popular: true,
      desc: "For growing small businesses needing multi-currency and estimates.",
      features: [
        "Unlimited Invoices & Estimates",
        "Recurring Billing Schedules",
        "Client Payment Links (Paystack)",
        "Up to 5 Staff Users",
        "Basic HRM Module",
      ],
    },
    {
      name: "Premium",
      monthlyNaira: 3500,
      yearlyNaira: 3325, // 5% off
      desc: "Enterprise accounting and multi-location purchase orders.",
      features: [
        "All Standard Features",
        "Purchase Orders & Waybills",
        "Custom Tax Rates & Reports",
        "Affiliate Tracking & Commission",
        "Unlimited Staff Roles",
        "Priority 24/7 Support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden max-w-full">
      {billToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{billToast}</span>
        </div>
      )}
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/billstacks" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-billstacks flex items-center justify-center font-black text-white text-lg">
              BS
            </div>
            <div>
              <span className="font-extrabold text-heading text-xl tracking-tight block leading-tight">
                BILLSTACKS
              </span>
              <span className="text-[10px] text-muted font-bold tracking-widest uppercase block">
                Smart Cloud Invoicing
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-heading">
            <Link href="/billstacks" className="text-billstacks">Features</Link>
            <a href="#pricing" className="hover:text-billstacks transition-colors">Pricing</a>
            <Link href="/admin/billstacks" className="text-active hover:underline font-bold">
              Open Admin App →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section matching spec: dark teal #0D333F */}
      <section className="bg-[#0D333F] text-white py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-billstacks/20 text-billstacks text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Billstacks Cloud Accounting</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Manage Your Business & Finances Easily.
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Billstacks simplifies invoices and expense tracking, saving time and money. Create and send your first professional invoice in under 60 seconds.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <a
              href="#pricing"
              className="px-6 py-3.5 rounded-full bg-billstacks hover:bg-billstacks-dark text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Get Started Now
            </a>
            <Link
              href="/admin/billstacks"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/20"
            >
              Demo Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section (#pricing) */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
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

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p) => {
            const price = billingCycle === "MONTHLY" ? p.monthlyNaira : p.yearlyNaira;

            return (
              <div
                key={p.name}
                className={`bg-white rounded-3xl p-8 border transition-all flex flex-col justify-between ${
                  p.popular
                    ? "border-billstacks shadow-xl ring-2 ring-billstacks/20"
                    : "border-border shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  {p.popular && (
                    <span className="inline-block px-3 py-1 rounded-full bg-billstacks-tint text-billstacks font-bold text-[10px] uppercase tracking-wider mb-4">
                      Most Popular
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

                  <ul className="space-y-3 text-xs border-t border-border pt-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-body">
                        <CheckCircle2 className="w-4 h-4 text-billstacks shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
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
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-500 py-10 px-4 sm:px-8 border-t border-border text-xs text-center mt-auto">
        <p>© 2026 Billstacks · Member of Zino Group Unified Platform</p>
      </footer>
    </div>
  );
}
