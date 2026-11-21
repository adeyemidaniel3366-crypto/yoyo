"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Plus, ArrowLeft, Mail, Phone, X, CheckCircle2 } from "lucide-react";
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
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState({
    name: "",
    department: "Executive",
    designation: "Executive Assistant",
    phone: "",
    email: "",
    extension: "Ext. 501",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.email.trim()) return;

    const created: Employee = {
      id: `emp_${Date.now()}`,
      name: newEmp.name.trim(),
      department: newEmp.department,
      designation: newEmp.designation,
      phone: newEmp.phone.trim() || "+234 800 000 0000",
      email: newEmp.email.trim(),
      extension: newEmp.extension.trim(),
    };

    setEmployees([...employees, created]);
    setModalOpen(false);
    setNewEmp({
      name: "",
      department: "Executive",
      designation: "Executive Assistant",
      phone: "",
      email: "",
      extension: "Ext. 501",
    });
    showToast(`Employee host "${created.name}" added to reception directory.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-purple-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
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
                    <p className="font-medium text-heading">{emp.email}</p>
                    <p className="text-[11px] text-muted">{emp.phone}</p>
                  </td>
                  <td className="py-3 font-mono font-bold text-heading">{emp.extension}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-visitor/10 text-visitor flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Add Employee Host</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Fashola"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor bg-white text-gray-900"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Supply Yard">Supply Yard</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@zinoone.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+234 800..."
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Intercom / Desk Extension</label>
                <input
                  type="text"
                  value={newEmp.extension}
                  onChange={(e) => setNewEmp({ ...newEmp, extension: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono focus:outline-none focus:border-visitor"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-visitor text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Add Host
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
