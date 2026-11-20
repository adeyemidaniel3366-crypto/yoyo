"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Building2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function VisitorsDepartmentsPage() {
  const departments = [
    { name: "Executive Suite & Board", head: "Chairman / CEO", staffCount: 4, floor: "Penthouse / 4th Floor" },
    { name: "Finance & Accounting", head: "Femi Adeleke", staffCount: 8, floor: "3rd Floor" },
    { name: "Retail Operations & E-Commerce", head: "Chinedu Eze", staffCount: 16, floor: "1st & 2nd Floor" },
    { name: "Hospitality & Guest Relations", head: "Adaeze Okafor", staffCount: 12, floor: "Reception / Suites" },
    { name: "Logistics & Material Yard", head: "Tunde Bakare", staffCount: 22, floor: "Builders Yard Annex" },
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
            <h1 className="text-2xl font-bold text-heading">Company Departments</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Divisions within Zino Group for visitor check-in routing and security escalation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Department")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Department Name</th>
                <th className="py-2.5">Department Head</th>
                <th className="py-2.5 text-center">Staff Count</th>
                <th className="py-2.5">Building Location / Floor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.map((d) => (
                <tr key={d.name} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{d.name}</td>
                  <td className="py-3 text-muted">{d.head}</td>
                  <td className="py-3 text-center font-black text-visitor">{d.staffCount}</td>
                  <td className="py-3 text-muted">{d.floor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
