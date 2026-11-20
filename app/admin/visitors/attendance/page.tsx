"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, CheckCircle2, UserCheck } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface AttendanceRecord {
  id: string;
  employee: string;
  department: string;
  clockIn: string;
  clockOut: string | null;
  workMode: "ON_SITE" | "REMOTE";
  status: "PRESENT" | "LATE";
}

const ATTENDANCE: AttendanceRecord[] = [
  { id: "1", employee: "Femi Adeleke", department: "Finance & Accounting", clockIn: "07:55 AM", clockOut: null, workMode: "ON_SITE", status: "PRESENT" },
  { id: "2", employee: "Amina Yusuf", department: "Billing Operations", clockIn: "08:02 AM", clockOut: null, workMode: "ON_SITE", status: "PRESENT" },
  { id: "3", employee: "Emeka Okonkwo", department: "Yard Supervision", clockIn: "07:45 AM", clockOut: null, workMode: "ON_SITE", status: "PRESENT" },
  { id: "4", employee: "Chinedu Eze", department: "Computer Village Retail", clockIn: "08:42 AM", clockOut: null, workMode: "ON_SITE", status: "LATE" },
];

export default function VisitorsAttendancePage() {
  const [records] = useState<AttendanceRecord[]>(ATTENDANCE);

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
            <h1 className="text-2xl font-bold text-heading">Employee Daily Attendance Log</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Front desk biometric &amp; web clock-in/out timestamps across all branches.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Staff Member</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Clock-In Time</th>
                <th className="py-2.5">Clock-Out Time</th>
                <th className="py-2.5 text-center">Work Mode</th>
                <th className="py-2.5 text-center">Punctuality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{r.employee}</td>
                  <td className="py-3 text-muted">{r.department}</td>
                  <td className="py-3 font-mono font-semibold text-heading">{r.clockIn}</td>
                  <td className="py-3 text-muted">{r.clockOut || "Active Shift"}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      {r.workMode}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.status}
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
