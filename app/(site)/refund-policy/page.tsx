import React from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy — Zino One",
  description: "Refund, return, and booking cancellation policy for Paystack and Flutterwave transactions.",
};

export default function RefundPolicyPage() {
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Refund & Cancellation Policy</h1>
              <p className="text-xs text-slate-500">Applies to Paystack, Flutterwave, POS & Bank Transfer payments</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">1. Zino Luxury Apartments Cancellations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>48+ hours before check-in:</strong> 100% refund or complimentary date reschedule.</li>
              <li><strong>Within 24–48 hours:</strong> 50% refund or credit toward a future stay within 90 days.</li>
              <li><strong>No-shows / same-day cancellations:</strong> First night is non-refundable; remaining nights are refunded.</li>
              <li><strong>Caution Deposit:</strong> Refunded within 24 hours of satisfactory checkout inspection.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">2. Device Galaxy & Zino Spark Returns</h2>
            <p>
              Unopened items in original sealed packaging may be returned within 7 days of delivery for an exchange or refund. Defective hardware verified within the warranty period will be repaired or replaced.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">3. Top Builders Materials</h2>
            <p>
              Building materials inspected and signed off at dispatch are non-refundable. Damaged-in-transit claims must be reported immediately upon delivery prior to signing the waybill.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900">4. Refund Processing Timeline</h2>
            <p>
              Approved refunds are initiated within 3–5 business days back to the original payment method (Paystack/Flutterwave card reversal or direct NIBSS bank transfer).
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Support: billing@zinoone.com</span>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
