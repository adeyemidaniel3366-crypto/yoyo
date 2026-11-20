"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Percent, Printer, FileText } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

export default function BillstacksTaxPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/billstacks" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Billstacks Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Tax &amp; Withholding Tax Reports</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Federal Inland Revenue Service (FIRS) 7.5% VAT and 5% Withholding Tax (WHT) calculations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-heading text-xs font-bold shadow-2xs hover:bg-gray-50"
        >
          <Printer className="w-4 h-4 text-muted" />
          <span>Export FIRS Return</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Output VAT (7.5% Invoiced)</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦385,200</h3>
          <p className="text-[11px] text-muted mt-1">From total billable revenue</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Input VAT (Allowable Claim)</p>
          <h3 className="text-2xl font-black text-heading mt-1">₦112,500</h3>
          <p className="text-[11px] text-muted mt-1">On supplier purchases</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border">
          <p className="text-xs text-muted">Net VAT Payable to FIRS</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">₦272,700</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Due by 21st Dec 2026</p>
        </div>
      </div>
    </div>
  );
}
