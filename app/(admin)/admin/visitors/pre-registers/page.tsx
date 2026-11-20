"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Plus, ArrowLeft, QrCode } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface PreRegister {
  id: string;
  passCode: string;
  guestName: string;
  email: string;
  expectedDate: string;
  host: string;
  status: "EXPECTED" | "ARRIVED";
}

const PRE_REGISTERS: PreRegister[] = [
  { id: "1", passCode: "VIP-PASS-99", guestName: "Hon. Commissioner of Trade", email: "trade@lagosstate.gov.ng", expectedDate: "21 Nov 2026, 11:00 AM", host: "Executive Chairman", status: "EXPECTED" },
  { id: "2", passCode: "VIP-PASS-98", guestName: "Dangote Group Logistics Director", email: "logistics@dangote.com", expectedDate: "22 Nov 2026, 02:00 PM", host: "Yard General Manager", status: "EXPECTED" },
];

export default function VisitorsPreRegistersPage() {
  const [list] = useState<PreRegister[]>(PRE_REGISTERS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/visitors" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Visitors Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">VIP Pre-Registered Visitors</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Pre-approved appointments with automatic QR pass generation and front desk fast-track.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Pre-Register VIP Visitor")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Pre-Register Guest</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Pass Code</th>
                <th className="py-2.5">VIP Guest Name</th>
                <th className="py-2.5">Expected Appointment</th>
                <th className="py-2.5">Host Executive</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((pr) => (
                <tr key={pr.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-visitor flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>{pr.passCode}</span>
                  </td>
                  <td className="py-3 font-bold text-heading">{pr.guestName}</td>
                  <td className="py-3 text-muted">{pr.expectedDate}</td>
                  <td className="py-3 font-semibold text-heading">{pr.host}</td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      {pr.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Resending QR invitation pass to ${pr.email}`)}
                      className="px-3 py-1 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50"
                    >
                      Resend QR Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
