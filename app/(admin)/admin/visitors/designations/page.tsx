"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Briefcase, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface RoleItem {
  title: string;
  level: string;
  code: string;
}

const ROLES: RoleItem[] = [];

export default function VisitorsDesignationsPage() {
  const [roles, setRoles] = useState<RoleItem[]>(ROLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({
    title: "",
    level: "Middle Management",
    code: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.title.trim()) return;

    const code =
      newRole.code.trim().toUpperCase() ||
      `ROLE-${Math.floor(10 + Math.random() * 90)}`;

    const created: RoleItem = {
      title: newRole.title.trim(),
      level: newRole.level,
      code,
    };

    setRoles([...roles, created]);
    setModalOpen(false);
    setNewRole({ title: "", level: "Middle Management", code: "" });
    showToast(`Role designation "${created.title}" registered.`);
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
            <h1 className="text-2xl font-bold text-heading">Job Roles &amp; Designations</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Staff job titles and organizational hierarchy positions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-visitor/10 text-visitor flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Add Designation</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Security Officer"
                  value={newRole.title}
                  onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Organizational Tier</label>
                <select
                  value={newRole.level}
                  onChange={(e) => setNewRole({ ...newRole, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor bg-white text-gray-900"
                >
                  <option value="Executive Level">Executive Level</option>
                  <option value="Senior Management">Senior Management</option>
                  <option value="Middle Management">Middle Management</option>
                  <option value="Engineering">Engineering / Technical</option>
                  <option value="Frontline Operations">Frontline Operations</option>
                  <option value="Support & Maintenance">Support &amp; Facilities</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Role Code</label>
                <input
                  type="text"
                  placeholder="e.g. SEC-07 (or auto)"
                  value={newRole.code}
                  onChange={(e) => setNewRole({ ...newRole, code: e.target.value })}
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
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
