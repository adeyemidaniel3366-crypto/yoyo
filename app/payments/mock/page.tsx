"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function MockPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gateway = searchParams.get("gateway") || "PAYSTACK";
  const reference = searchParams.get("reference") || `Z1-SANDBOX-${Date.now()}`;
  const amountKobo = Number(searchParams.get("amount") || "0");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/payments/verify?reference=${encodeURIComponent(reference)}&mockStatus=PAID`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error?.message || "Could not verify sandbox payment.");
        setProcessing(false);
        return;
      }
      router.push(
        `/payments/callback?gateway=${encodeURIComponent(gateway)}&reference=${encodeURIComponent(reference)}&status=success`
      );
    } catch {
      setError("Network error verifying sandbox payment.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900">
              {gateway} Sandbox Checkout
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Ref: {reference}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
          Live API secret key is not set in <code>.env</code>. You can authorize this test transaction below or configure live keys in Settings.
        </div>

        {amountKobo > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Amount Due</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              ₦{(amountKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            disabled={processing}
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Authorize Test Payment</span>
          </button>

          <Link
            href={`/payments/callback?gateway=${encodeURIComponent(gateway)}&reference=${encodeURIComponent(reference)}&status=cancelled`}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel &amp; Return</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-gray-500">
          <CreditCard className="w-4 h-4 mr-2 animate-pulse" />
          Loading Sandbox Checkout...
        </div>
      }
    >
      <MockPaymentContent />
    </Suspense>
  );
}
