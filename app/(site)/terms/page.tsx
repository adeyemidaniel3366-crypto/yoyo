import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Zino One Unified Platform",
  description: "Terms of service, rental rules, warranties, and commercial policies across Zino One subsidiaries.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-8">
        <div className="space-y-3 border-b border-slate-100 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Zino One Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Terms of Service</h1>
              <p className="text-xs text-slate-500">Last updated: November 2026 · Zino Group Nigeria</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">1. Platform Scope</h2>
            <p>
              These Terms of Service govern your use of the Zino One unified platform and all six operating subsidiaries: <strong>Zino Spark</strong>, <strong>Device Galaxy</strong>, <strong>Zino Luxury Apartments</strong>, <strong>Top Builders Best Materials</strong>, <strong>Billstacks Accounting</strong>, and <strong>Zino Visitor Management</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">2. Zino Luxury Apartments — Rental & Caution Deposit Rules</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Standard check-in is 2:00 PM and check-out is 12:00 PM (WAT).</li>
              <li>A refundable caution deposit (₦20,000 standard) is required prior to key handover and refunded upon clean checkout inspection.</li>
              <li>Valid government-issued photo ID is mandatory for all adult guests. Parties, unauthorized filming, or smoking indoors are strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">3. Device Galaxy & Zino Spark — Electronics & Warranties</h2>
            <p>
              All electronics, NVMe SSDs, laptops, and accessories sold through Device Galaxy and Zino Spark carry manufacturer warranties as stated on the product invoice. Physical damage, liquid ingress, or unauthorized repairs void warranty coverage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">4. Top Builders — Building Materials & Yard Dispatch</h2>
            <p>
              Goods sold in good condition are non-refundable once dispatched from the yard. Contractors must inspect quantities (cement bags, iron rods, tiles) upon delivery and sign the waybill.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">5. Billstacks SaaS Subscriptions</h2>
            <p>
              Billstacks cloud invoicing subscriptions renew monthly or annually based on the selected plan. Users are responsible for safeguarding their API payment gateway keys (Paystack, Flutterwave, Stripe, Razorpay).
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Governed by the laws of the Federal Republic of Nigeria.
          </span>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
            <Link href="/refund-policy" className="text-indigo-600 hover:underline">Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
