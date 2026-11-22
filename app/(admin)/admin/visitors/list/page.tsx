"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Search, ArrowLeft, Printer, Plus, X, CheckCircle2, Trash2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { usePlatformStore } from "@/lib/platform-store";

const getSafeTime24 = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function VisitorsListPage() {
  const { visitors, addVisitor, checkoutVisitor, deleteVisitor } = usePlatformStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newVis, setNewVis] = useState({
    name: "",
    phone: "",
    hostEmployee: "Mr. Femi Adeleke (Finance)",
    purpose: "Business Meeting",
    visitDate: new Date().toISOString().slice(0, 10),
    visitTime: getSafeTime24(),
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: "10:00",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filtered = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.badgeNo.toLowerCase().includes(search.toLowerCase()) ||
      v.hostEmployee.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVis.name.trim()) return;
    const created = addVisitor(newVis);
    setModalOpen(false);
    setNewVis({
      name: "",
      phone: "",
      hostEmployee: "Mr. Femi Adeleke (Finance)",
      purpose: "Business Meeting",
      visitDate: new Date().toISOString().slice(0, 10),
      visitTime: getSafeTime24(),
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: "10:00",
    });
    showToast(`Visitor ${created.name} (${created.badgeNo}) checked in.`);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
            <h1 className="text-2xl font-bold text-heading">Live Visitors Logbook</h1>
            <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Real-time digital visitor register, time of visit, appointment time, and security check-out.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-visitor text-white text-xs font-bold shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Visitor</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-heading text-xs font-bold shadow-2xs hover:bg-gray-50"
          >
            <Printer className="w-4 h-4 text-muted" />
            <span>Print Logbook</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search visitor badge #, name, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-visitor"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Badge #</th>
                <th className="py-2.5">Visitor Name &amp; Phone</th>
                <th className="py-2.5">Host Staff Member</th>
                <th className="py-2.5">Visit Purpose</th>
                <th className="py-2.5">Visit Schedule</th>
                <th className="py-2.5">Appointment Schedule</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-mono font-bold text-visitor">{v.badgeNo}</td>
                  <td className="py-3">
                    <p className="font-bold text-heading">{v.name}</p>
                    <p className="text-[11px] text-muted">{v.phone}</p>
                  </td>
                  <td className="py-3 font-semibold text-heading">{v.hostEmployee}</td>
                  <td className="py-3 text-muted">{v.purpose}</td>
                  <td className="py-3 font-mono">
                    <p className="text-heading font-bold">{v.visitTime}</p>
                    <p className="text-[11px] text-muted">{v.visitDate}</p>
                  </td>
                  <td className="py-3 font-mono">
                    <p className="text-blue-600 font-bold">{v.appointmentTime || v.visitTime}</p>
                    <p className="text-[11px] text-blue-500">{v.appointmentDate || v.visitDate}</p>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.status === "CHECKED_IN"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {v.status === "CHECKED_IN" ? "INSIDE PREMISES" : `DEPARTED (${v.checkOut})`}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {v.status === "CHECKED_IN" && (
                        <button
                          type="button"
                          onClick={() => checkoutVisitor(v.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100"
                        >
                          Check Out
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          deleteVisitor(v.id);
                          showToast(`Removed visitor log ${v.badgeNo}`);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Visitor Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900">Log New Visitor Entry</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddVisitor} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Visitor Name *</label>
                  <input
                    type="text"
                    required
                    value={newVis.name}
                    onChange={(e) => setNewVis({ ...newVis, name: e.target.value })}
                    placeholder="e.g. Dr. Kunle Adebayo"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newVis.phone}
                    onChange={(e) => setNewVis({ ...newVis, phone: e.target.value })}
                    placeholder="+234 80..."
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Host Staff Member</label>
                  <input
                    type="text"
                    value={newVis.hostEmployee}
                    onChange={(e) => setNewVis({ ...newVis, hostEmployee: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    value={newVis.purpose}
                    onChange={(e) => setNewVis({ ...newVis, purpose: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Visit *</label>
                  <input
                    type="date"
                    required
                    value={newVis.visitDate}
                    onChange={(e) => setNewVis({ ...newVis, visitDate: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Time of Visit *</label>
                  <input
                    type="time"
                    step="60"
                    required
                    value={newVis.visitTime}
                    onChange={(e) => setNewVis({ ...newVis, visitTime: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Date of Appt *</label>
                  <input
                    type="date"
                    required
                    value={newVis.appointmentDate}
                    onChange={(e) => setNewVis({ ...newVis, appointmentDate: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-blue-200 bg-blue-50/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Time of Appt *</label>
                  <input
                    type="time"
                    step="60"
                    required
                    value={newVis.appointmentTime}
                    onChange={(e) => setNewVis({ ...newVis, appointmentTime: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-blue-200 bg-blue-50/30 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-visitor text-white font-bold">
                  Issue Badge &amp; Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
