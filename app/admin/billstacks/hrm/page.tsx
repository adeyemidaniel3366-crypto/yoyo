"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Plus, ArrowLeft, Search, DollarSign } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface EmployeePayroll {
  id: string;
  name: string;
  role: string;
  department: string;
  salaryKobo: number;
  status: "ACTIVE" | "ON_LEAVE";
}

const EMPLOYEES: EmployeePayroll[] = [
  { id: "e1", name: "Femi Adeleke", role: "Financial Controller", department: "Finance", salaryKobo: 65000000, status: "ACTIVE" },
  { id: "e2", name: "Chinedu Eze", role: "Senior Accountant", department: "Finance", salaryKobo: 45000000, status: "ACTIVE" },
  { id: "e3", name: "Amina Yusuf", role: "Billing Specialist", department: "Operations", salaryKobo: 32000000, status: "ACTIVE" },
];

export default function BillstacksHrmPage() {
  const [employees] = useState<EmployeePayroll[]>(EMPLOYEES);

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
            <h1 className="text-2xl font-bold text-heading">HRM &amp; Payroll Management</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Staff salary records, monthly payroll generation, and PAYE tax schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Generate Monthly Payroll")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm"
        >
          <DollarSign className="w-4 h-4" />
          <span>Run November Payroll</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Staff Name</th>
                <th className="py-2.5">Designation</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5 text-right">Monthly Net (₦)</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{emp.name}</td>
                  <td className="py-3 text-muted">{emp.role}</td>
                  <td className="py-3 text-muted">{emp.department}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(emp.salaryKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {emp.status}
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
