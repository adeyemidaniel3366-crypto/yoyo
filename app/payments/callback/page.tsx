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
  RotateCcw,
} from "lucide-react";
import { finalizePendingPayment, getPendingPayment } from "@/lib/payments/client";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    searchParams.get("tx_ref") ||
    searchParams.get("payment_intent") ||
    "";
  const gateway = searchParams.get("gateway") || "Online Gateway";
  const isCancelled =
    searchParams.get("status") === "cancelled" ||
    searchParams.get("cancelled") === "true";

  const [state, setState] = useState<"loading" | "paid" | "failed" | "cancelled">(
    isCancelled ? "cancelled" : "loading"
  );
  const [details, setDetails] = useState<{
    reference: string;
    amountDisplay?: string;
    status?: string;
    message?: string;
    returnPath?: string;
    title?: string;
  }>({ reference });

  useEffect(() => {
    const pending = reference ? getPendingPayment(reference) : null;
    const returnPath = pending?.returnPath || (pending?.kind === "GALAXY_ORDER" ? "/shop" : pending?.kind === "APARTMENT_BOOKING" ? "/apartments" : "/admin");

    if (isCancelled || !reference) {
      if (isCancelled && reference) {
        finalizePendingPayment(reference, "CANCELLED");
      }
      if (!reference && !isCancelled) {
        setState("failed");
        setDetails({ reference, message: "Missing payment reference.", returnPath });
      } else if (isCancelled) {
        setDetails({ reference, message: "Payment checkout was cancelled.", returnPath });
      }
      return;
    }

    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json().catch(() => ({})))
      .then((res) => {
        if (res?.ok && res?.data?.status === "PAID") {
          finalizePendingPayment(reference, "PAID");
          setState("paid");
          setDetails({
            reference: res.data.reference || reference,
            amountDisplay: res.data.amountDisplay,
            status: res.data.status,
            returnPath,
            title: pending?.title,
          });
        } else {
          finalizePendingPayment(reference, "FAILED");
          setState("failed");
          setDetails({
            reference,
            message: res?.error?.message || "Payment has not been settled yet.",
            returnPath,
          });
        }
      })
      .catch(() => {
        finalizePendingPayment(reference, "FAILED");
        setState("failed");
        setDetails({
          reference,
          message: "Unable to verify payment status right now.",
          returnPath,
        });
      });
  }, [reference, isCancelled]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-200 shadow-2xl text-center space-y-6">
        {state === "loading" && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <h1 className="text-xl font-black text-gray-900">
              Verifying Payment with Gateway...
            </h1>
            <p className="text-xs text-gray-500">
              Confirming transaction reference <strong className="font-mono">{reference}</strong>
            </p>
          </div>
        )}

        {state === "paid" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                Payment Confirmed &amp; Settled
              </span>
              <h1 className="text-3xl font-black text-gray-900 mt-2">
                {details.amountDisplay || "Payment Verified"}
              </h1>
              {details.title && (
                <p className="text-xs font-semibold text-gray-700 mt-1">{details.title}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Verified via {gateway} · Ref: <span className="font-mono font-bold text-gray-700">{details.reference}</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left text-xs text-emerald-900 space-y-1">
              <p className="font-bold">✓ Transaction Recorded Successfully</p>
              <p className="text-[11px] text-emerald-700">
                Your order, booking, and administrative financial ledger have been synchronized in real time.
              </p>
            </div>
          </div>
        )}

        {(state === "failed" || state === "cancelled") && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold uppercase tracking-wider">
                {state === "cancelled" ? "Checkout Cancelled" : "Verification Incomplete"}
              </span>
              <h1 className="text-2xl font-black text-gray-900 mt-2">
                {state === "cancelled" ? "Transaction Cancelled" : "Payment Not Verified"}
              </h1>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {details.message || "The payment transaction could not be verified or was aborted."}
              </p>
              {reference && (
                <p className="text-[11px] text-gray-400 font-mono mt-1">Ref: {reference}</p>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
          <Link
            href={details.returnPath || "/shop"}
            className="py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            {state === "paid" ? <Receipt className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            <span>{state === "paid" ? "View Activity" : "Try Again"}</span>
          </Link>
          <Link
            href="/admin"
            className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-4 h-4" />
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
