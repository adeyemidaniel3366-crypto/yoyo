"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Plus, ArrowLeft, Search, Mail, Phone } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  phone: string;
  email: string;
  extension: string;
}

const EMPLOYEES: Employee[] = [
  { id: "1", name: "Femi Adeleke", department: "Finance", designation: "Financial Controller", phone: "+234 802 333 4455", email: "femi.adeleke@zinoone.com", extension: "Ext. 201" },
  { id: "2", name: "Adaeze Okafor", department: "Hospitality", designation: "Front Office Lead", phone: "+234 803 123 4567", email: "adaeze.o@zinoapartments.com", extension: "Ext. 101" },
  { id: "3", name: "Chinedu Eze", department: "Retail & Electronics", designation: "Branch Manager (Medical Road)", phone: "+234 805 777 8899", email: "chinedu@devicegalaxy.com", extension: "Ext. 301" },
  { id: "4", name: "Tunde Bakare", department: "Supply Yard", designation: "Yard Inventory Supervisor", phone: "+234 809 111 2233", email: "tunde@topbuilders.ng", extension: "Ext. 401" },
];

export default function VisitorsEmployeesPage() {
  const [employees] = useState<Employee[]>(EMPLOYEES);

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
            <h1 className="text-2xl font-bold text-heading">Employee Host Directory</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Staff available for visitor selection on reception tablet kiosks and VIP appointment booking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Employee")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Employee Name</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Designation</th>
                <th className="py-2.5">Contact Details</th>
                <th className="py-2.5">Desk Extension</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{emp.name}</td>
                  <td className="py-3 font-semibold text-visitor">{emp.department}</td>
                  <td className="py-3 text-muted">{emp.designation}</td>
                  <td className="py-3">
                    <p className="text-heading">{emp.phone}</p>
                    <p className="text-[11px] text-muted">{emp.email}</p>
                  </td>
                  <td className="py-3 font-mono font-bold text-muted">{emp.extension}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
