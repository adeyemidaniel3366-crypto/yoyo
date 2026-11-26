"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Receipt,
} from "lucide-react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    searchParams.get("tx_ref") ||
    "";
  const gateway = searchParams.get("gateway") || "Online Gateway";
  const cancelled = searchParams.get("status") === "cancelled";

  const [state, setState] = useState<"loading" | "paid" | "failed" | "cancelled">(
    cancelled ? "cancelled" : "loading"
  );
  const [details, setDetails] = useState<{
    reference: string;
    amountDisplay?: string;
    status?: string;
    message?: string;
  }>({ reference });

  useEffect(() => {
    if (cancelled || !reference) {
      if (!reference && !cancelled) setState("failed");
      return;
    }

    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json().catch(() => ({})))
      .then((res) => {
        if (res?.ok && res?.data?.status === "PAID") {
          setState("paid");
          setDetails({
            reference: res.data.reference || reference,
            amountDisplay: res.data.amountDisplay,
            status: res.data.status,
          });
        } else {
          setState("failed");
          setDetails({
            reference,
            message: res?.error?.message || "Payment has not been settled yet.",
          });
        }
      })
      .catch(() => {
        setState("failed");
        setDetails({
          reference,
          message: "Unable to verify payment status right now.",
        });
      });
  }, [reference, cancelled]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-7 border border-gray-200 shadow-xl text-center space-y-5">
        {state === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <h1 className="text-lg font-extrabold text-gray-900">
              Verifying Payment...
            </h1>
            <p className="text-xs text-gray-500">
              Confirming settlement for reference <strong className="font-mono">{reference}</strong>
            </p>
          </>
        )}

        {state === "paid" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                Payment Confirmed
              </span>
              <h1 className="text-2xl font-black text-gray-900 mt-2">
                {details.amountDisplay || "Payment Settled"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Verified via {gateway} · Ref: <span className="font-mono">{details.reference}</span>
              </p>
            </div>
          </>
        )}

        {(state === "failed" || state === "cancelled") && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">
                {state === "cancelled" ? "Payment Cancelled" : "Verification Incomplete"}
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                {details.message || "The transaction was cancelled before settlement."}
              </p>
              {reference && (
                <p className="text-[11px] text-gray-400 font-mono mt-1">Ref: {reference}</p>
              )}
            </div>
          </>
        )}

        <div className="pt-2 grid grid-cols-2 gap-2.5 text-xs">
          <Link
            href="/shop"
            className="py-2.5 px-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <Link
            href="/admin"
            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white flex items-center justify-center gap-1"
          >
            <span>Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-gray-500">
          Loading payment status...
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
