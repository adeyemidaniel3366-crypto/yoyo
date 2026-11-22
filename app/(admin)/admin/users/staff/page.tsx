"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Plus, ArrowLeft, Search, Shield, Key, X, CheckCircle2, Trash2 } from "lucide-react";

interface StaffAccess {
  id: string;
  name: string;
  position: string;
  branch: string;
  accessCardId: string;
  pinSet: boolean;
  issuedDate?: string;
}

const STAFF: StaffAccess[] = [
  { id: "1", name: "Femi Adeleke", position: "Financial Controller", branch: "HQ Victoria Island", accessCardId: "CRD-8821", pinSet: true, issuedDate: "2026-01-15" },
  { id: "2", name: "Chinedu Eze", position: "Store Manager", branch: "Computer Village (Medical Rd)", accessCardId: "CRD-8822", pinSet: true, issuedDate: "2026-03-10" },
  { id: "3", name: "Adaeze Okafor", position: "Front Desk Concierge", branch: "Zino Apartments Lekki", accessCardId: "CRD-8823", pinSet: true, issuedDate: "2026-06-01" },
  { id: "4", name: "Tunde Bakare", position: "Yard Supervisor", branch: "Top Builders Supply Yard", accessCardId: "CRD-8824", pinSet: true, issuedDate: "2026-02-12" },
];

export default function StaffAccessPage() {
  const [staff, setStaff] = useState<StaffAccess[]>(STAFF);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    name: "",
    position: "",
    branch: "HQ Victoria Island",
    pin: "1234",
    issuedDate: new Date().toISOString().slice(0, 10),
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleIssueCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name.trim()) return;

    const created: StaffAccess = {
      id: `crd_${Date.now()}`,
      name: newCard.name.trim(),
      position: newCard.position.trim() || "Staff Member",
      branch: newCard.branch,
      accessCardId: `CRD-${Math.floor(1000 + Math.random() * 9000)}`,
      pinSet: Boolean(newCard.pin.trim()),
      issuedDate: newCard.issuedDate || new Date().toISOString().slice(0, 10),
    };

    setStaff([created, ...staff]);
    setCardModalOpen(false);
    setNewCard({ name: "", position: "", branch: "HQ Victoria Island", pin: "1234", issuedDate: new Date().toISOString().slice(0, 10) });
    showToast(`Security Keycard ${created.accessCardId} issued to ${created.name}`);
  };

  const handleDeleteCard = (s: StaffAccess) => {
    setStaff((prev) => prev.filter((item) => item.id !== s.id));
    showToast(`Revoked and deleted Keycard ${s.accessCardId} & PIN for ${s.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          onClick={() => setCardModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-active text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors"
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
                <th className="py-2.5">Issued Date</th>
                <th className="py-2.5 text-center">POS Terminal PIN</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{s.name}</td>
                  <td className="py-3 text-muted">{s.position}</td>
                  <td className="py-3 font-semibold text-heading">{s.branch}</td>
                  <td className="py-3 font-mono font-bold text-active">{s.accessCardId}</td>
                  <td className="py-3 text-muted font-mono">{s.issuedDate || "2026-01-15"}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {s.pinSet ? "PIN ACTIVE" : "NO PIN"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Delete Keycard & PIN"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Card Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-heading space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-base">Issue Staff Keycard &amp; POS PIN</h3>
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-muted hover:text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleIssueCardSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-heading mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sandra Obi"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-heading mb-1">Position / Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Cashier / Floor Lead"
                    value={newCard.position}
                    onChange={(e) => setNewCard({ ...newCard, position: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Assigned Branch</label>
                  <select
                    value={newCard.branch}
                    onChange={(e) => setNewCard({ ...newCard, branch: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                  >
                    <option value="HQ Victoria Island">HQ Victoria Island</option>
                    <option value="Computer Village (Medical Rd)">Computer Village (Medical Rd)</option>
                    <option value="Zino Apartments Lekki">Zino Apartments Lekki</option>
                    <option value="Top Builders Supply Yard">Top Builders Supply Yard</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-heading mb-1">Terminal Unlock PIN (4 digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={newCard.pin}
                    onChange={(e) => setNewCard({ ...newCard, pin: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border font-mono tracking-widest outline-none focus:border-active"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newCard.issuedDate}
                    onChange={(e) => setNewCard({ ...newCard, issuedDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                  />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCardModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-active text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
