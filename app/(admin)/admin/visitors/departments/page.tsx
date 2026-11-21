"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Building2, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface DeptItem {
  name: string;
  head: string;
  staffCount: number;
  floor: string;
}

const DEPARTMENTS: DeptItem[] = [
  { name: "Executive Suite & Board", head: "Chairman / CEO", staffCount: 4, floor: "Penthouse / 4th Floor" },
  { name: "Finance & Accounting", head: "Femi Adeleke", staffCount: 8, floor: "3rd Floor" },
  { name: "Retail Operations & E-Commerce", head: "Chinedu Eze", staffCount: 16, floor: "1st & 2nd Floor" },
  { name: "Hospitality & Guest Relations", head: "Adaeze Okafor", staffCount: 12, floor: "Reception / Suites" },
  { name: "Logistics & Material Yard", head: "Tunde Bakare", staffCount: 22, floor: "Builders Yard Annex" },
];

export default function VisitorsDepartmentsPage() {
  const [departments, setDepartments] = useState<DeptItem[]>(DEPARTMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newDept, setNewDept] = useState({
    name: "",
    head: "",
    staffCount: "5",
    floor: "2nd Floor West Wing",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim() || !newDept.head.trim()) return;

    const created: DeptItem = {
      name: newDept.name.trim(),
      head: newDept.head.trim(),
      staffCount: Number(newDept.staffCount) || 1,
      floor: newDept.floor.trim(),
    };

    setDepartments([...departments, created]);
    setModalOpen(false);
    setNewDept({ name: "", head: "", staffCount: "5", floor: "2nd Floor West Wing" });
    showToast(`Department "${created.name}" created successfully.`);
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
            <h1 className="text-2xl font-bold text-heading">Company Departments</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Divisions within Zino Group for visitor check-in routing and security escalation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-visitor/10 text-visitor flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Add Department</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal & Compliance Division"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department Head / Director *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barrister Emeka Nwosu"
                  value={newDept.head}
                  onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Staff Count</label>
                  <input
                    type="number"
                    value={newDept.staffCount}
                    onChange={(e) => setNewDept({ ...newDept, staffCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Floor / Wing</label>
                  <input
                    type="text"
                    value={newDept.floor}
                    onChange={(e) => setNewDept({ ...newDept, floor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                  />
                </div>
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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
