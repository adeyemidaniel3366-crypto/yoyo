"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Plus, ArrowLeft, QrCode, Mail, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface PreRegisterRow {
  id: string;
  passCode: string;
  guestName: string;
  email: string;
  expectedDate: string;
  host: string;
  status: "APPROVED" | "PENDING_ARRIVAL" | "CHECKED_IN";
}

const PRE_REGISTERS: PreRegisterRow[] = [
  { id: "1", passCode: "PASS-7721", guestName: "Dr. Oladipo Johnson", email: "dr.johnson@apexhealth.ng", expectedDate: "20 Nov 2026, 02:00 PM", host: "Chief Operating Officer", status: "PENDING_ARRIVAL" },
  { id: "2", passCode: "PASS-7720", guestName: "Sarah Alabi", email: "s.alabi@kpmg.com", expectedDate: "20 Nov 2026, 04:30 PM", host: "Head of Internal Audit", status: "APPROVED" },
  { id: "3", passCode: "PASS-7719", guestName: "Emeka Okoye", email: "emeka@dangote.com", expectedDate: "21 Nov 2026, 10:00 AM", host: "Procurement Director", status: "APPROVED" },
];

export default function VisitorsPreRegistersPage() {
  const [list, setList] = useState<PreRegisterRow[]>(PRE_REGISTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newReg, setNewReg] = useState({
    guestName: "",
    email: "",
    expectedDate: "22 Nov 2026, 11:00 AM",
    host: "Managing Director",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreatePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg.guestName.trim() || !newReg.email.trim()) return;

    const passCode = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: PreRegisterRow = {
      id: `pr_${Date.now()}`,
      passCode,
      guestName: newReg.guestName.trim(),
      email: newReg.email.trim(),
      expectedDate: newReg.expectedDate,
      host: newReg.host,
      status: "APPROVED",
    };

    setList([created, ...list]);
    setModalOpen(false);
    setNewReg({
      guestName: "",
      email: "",
      expectedDate: "22 Nov 2026, 11:00 AM",
      host: "Managing Director",
    });
    showToast(`VIP Pass ${passCode} generated and dispatched to ${created.email}!`);
  };

  const handleResend = (pr: PreRegisterRow) => {
    showToast(`QR access pass ${pr.passCode} resent to ${pr.email}.`);
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
            <h1 className="text-2xl font-bold text-heading">VIP Pre-Registered Visitors</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Pre-approved appointments with automatic QR pass generation and front desk fast-track.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ Pre-Register Guest</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Pass Code</th>
                <th className="py-2.5">VIP Guest Name</th>
                <th className="py-2.5">Expected Appointment</th>
                <th className="py-2.5">Host Executive</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((pr) => (
                <tr key={pr.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-visitor flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>{pr.passCode}</span>
                  </td>
                  <td className="py-3 font-bold text-heading">{pr.guestName}</td>
                  <td className="py-3 text-muted">{pr.expectedDate}</td>
                  <td className="py-3 font-semibold text-heading">{pr.host}</td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      {pr.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleResend(pr)}
                      className="px-3 py-1 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50"
                    >
                      Resend QR Pass
                    </button>
                  </td>
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
                <h3 className="text-base font-bold text-gray-900">Pre-Register VIP Visitor</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePreRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barrister Funmi Coker"
                  value={newReg.guestName}
                  onChange={(e) => setNewReg({ ...newReg, guestName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address (for QR Pass) *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. funmi.coker@lawfirm.ng"
                  value={newReg.email}
                  onChange={(e) => setNewReg({ ...newReg, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Appointment Time</label>
                  <input
                    type="text"
                    value={newReg.expectedDate}
                    onChange={(e) => setNewReg({ ...newReg, expectedDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Host Executive</label>
                  <select
                    value={newReg.host}
                    onChange={(e) => setNewReg({ ...newReg, host: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-visitor bg-white text-gray-900"
                  >
                    <option value="Managing Director">Managing Director</option>
                    <option value="Chief Operating Officer">Chief Operating Officer</option>
                    <option value="Procurement Director">Procurement Director</option>
                    <option value="Head of Audit">Head of Audit</option>
                  </select>
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
                  Generate &amp; Dispatch Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
