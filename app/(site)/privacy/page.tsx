import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Zino One Unified Platform",
  description: "NDPR & GDPR compliant privacy notice for Zino One customers, apartment guests, and visitors.",
};

export default function PrivacyPolicyPage() {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-500">NDPR Compliant · Effective November 2026</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">1. Information We Collect</h2>
            <p>
              We collect contact information (name, email, phone number), transaction details, delivery addresses, apartment check-in records, and visitor kiosk logs strictly necessary to deliver our services and comply with Nigerian hospitality and commercial regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">2. Payment Processing Security</h2>
            <p>
              Card, bank transfer, and USSD payments are processed securely via PCI-DSS compliant partners (<strong>Paystack</strong> and <strong>Flutterwave</strong>). Zino One never stores raw credit/debit card numbers or CVV codes on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">3. Data Usage & Retention</h2>
            <p>
              Your data is used to issue invoices, verify digital boarding passes, fulfill hardware orders, and dispatch security badges. Financial and tax records (FIRS 7.5% VAT) are retained as required by statutory accounting laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">4. Your Rights</h2>
            <p>
              Under the Nigeria Data Protection Regulation (NDPR), you have the right to request access, correction, or deletion of your personal profile by emailing <strong>privacy@zinoone.com</strong>.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Zino One Data Protection Officer</span>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
            <Link href="/refund-policy" className="text-indigo-600 hover:underline">Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
