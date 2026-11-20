"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Plus, ArrowLeft, Search, Shield, Key } from "lucide-react";

interface StaffAccess {
  id: string;
  name: string;
  position: string;
  branch: string;
  accessCardId: string;
  pinSet: boolean;
}

const STAFF: StaffAccess[] = [
  { id: "1", name: "Femi Adeleke", position: "Financial Controller", branch: "HQ Victoria Island", accessCardId: "CRD-8821", pinSet: true },
  { id: "2", name: "Chinedu Eze", position: "Store Manager", branch: "Computer Village (Medical Rd)", accessCardId: "CRD-8822", pinSet: true },
  { id: "3", name: "Adaeze Okafor", position: "Front Desk Concierge", branch: "Zino Apartments Lekki", accessCardId: "CRD-8823", pinSet: true },
  { id: "4", name: "Tunde Bakare", position: "Yard Supervisor", branch: "Top Builders Supply Yard", accessCardId: "CRD-8824", pinSet: true },
];

export default function StaffAccessPage() {
  const [staff] = useState<StaffAccess[]>(STAFF);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/users" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Users Management
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-heading">Staff Physical &amp; Terminal Access</h1>
          <p className="text-xs text-muted mt-0.5">
            Security keycard badges, POS cash register lock PINs, and branch terminal authorization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Issue Access Card")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-active text-white text-xs font-bold shadow-sm"
        >
          <Key className="w-4 h-4" />
          <span>+ Issue Security Keycard</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Staff Name</th>
                <th className="py-2.5">Position</th>
                <th className="py-2.5">Assigned Facility</th>
                <th className="py-2.5 font-mono">Access Badge ID</th>
                <th className="py-2.5 text-center">POS Terminal PIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{s.name}</td>
                  <td className="py-3 text-muted">{s.position}</td>
                  <td className="py-3 font-semibold text-heading">{s.branch}</td>
                  <td className="py-3 font-mono font-bold text-active">{s.accessCardId}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      PIN ACTIVE
                    </span>
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
