"use client";

import React from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function VisitorsDesignationsPage() {
  const roles = [
    { title: "Managing Director / CEO", level: "Executive Level", code: "EXEC-01" },
    { title: "Financial Controller", level: "Senior Management", code: "MGT-02" },
    { title: "Senior Software Engineer", level: "Engineering", code: "ENG-03" },
    { title: "Front Desk & Concierge Officer", level: "Frontline Hospitality", code: "OPS-04" },
    { title: "Yard Inventory Supervisor", level: "Supply Logistics", code: "LOG-05" },
    { title: "Retail Store Cashier", level: "Retail Point of Sale", code: "RET-06" },
  ];

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
            <h1 className="text-2xl font-bold text-heading">Job Roles &amp; Designations</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Staff job titles and organizational hierarchy positions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Designation")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Designation</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Designation Title</th>
                <th className="py-2.5">Organizational Tier</th>
                <th className="py-2.5 font-mono">Role Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((r) => (
                <tr key={r.code} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{r.title}</td>
                  <td className="py-3 text-muted">{r.level}</td>
                  <td className="py-3 font-mono font-bold text-visitor">{r.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
