"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Search, ArrowLeft, Printer, Clock } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface VisitorLog {
  id: string;
  badgeNo: string;
  name: string;
  phone: string;
  hostEmployee: string;
  purpose: string;
  checkIn: string;
  checkOut: string | null;
  status: "CHECKED_IN" | "CHECKED_OUT";
}

const VISITORS: VisitorLog[] = [
  { id: "v1", badgeNo: "VIS-00041", name: "Engr. Tunde Bakare", phone: "+234 802 987 6543", hostEmployee: "Mr. Femi Adeleke (Finance)", purpose: "Cloud Infrastructure Audit", checkIn: "Today, 09:15 AM", checkOut: null, status: "CHECKED_IN" },
  { id: "v2", badgeNo: "VIS-00040", name: "Amaka Nwachukwu", phone: "+234 803 111 2233", hostEmployee: "Chief Executive Office", purpose: "Partnership Discussion", checkIn: "Today, 10:30 AM", checkOut: null, status: "CHECKED_IN" },
  { id: "v3", badgeNo: "VIS-00039", name: "Chinedu Okeke", phone: "+234 809 333 4455", hostEmployee: "Storekeeper (Adepele)", purpose: "Equipment Delivery", checkIn: "Yesterday, 14:00", checkOut: "Yesterday, 14:45", status: "CHECKED_OUT" },
];

export default function VisitorsListPage() {
  const [visitors, setVisitors] = useState<VisitorLog[]>(VISITORS);
  const [search, setSearch] = useState("");

  const filtered = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.badgeNo.toLowerCase().includes(search.toLowerCase()) ||
      v.hostEmployee.toLowerCase().includes(search.toLowerCase())
  );

  const checkoutVisitor = (id: string) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: "CHECKED_OUT" as const,
              checkOut: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : v
      )
    );
  };

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
            <h1 className="text-2xl font-bold text-heading">Live Visitors Logbook</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Real-time digital visitor register, active visitor badges and security check-out.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-heading text-xs font-bold shadow-2xs hover:bg-gray-50"
        >
          <Printer className="w-4 h-4 text-muted" />
          <span>Print Visitor Logbook</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search visitor badge #, name, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-visitor"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Badge #</th>
                <th className="py-2.5">Visitor Name &amp; Phone</th>
                <th className="py-2.5">Host Staff Member</th>
                <th className="py-2.5">Visit Purpose</th>
                <th className="py-2.5">Check-In Time</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-visitor">{v.badgeNo}</td>
                  <td className="py-3">
                    <p className="font-bold text-heading">{v.name}</p>
                    <p className="text-[11px] text-muted">{v.phone}</p>
                  </td>
                  <td className="py-3 font-semibold text-heading">{v.hostEmployee}</td>
                  <td className="py-3 text-muted">{v.purpose}</td>
                  <td className="py-3 text-muted">{v.checkIn}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.status === "CHECKED_IN"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {v.status === "CHECKED_IN" ? "INSIDE PREMISES" : `DEPARTED (${v.checkOut})`}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {v.status === "CHECKED_IN" && (
                      <button
                        type="button"
                        onClick={() => checkoutVisitor(v.id)}
                        className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100"
                      >
                        Check Out
                      </button>
                    )}
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
