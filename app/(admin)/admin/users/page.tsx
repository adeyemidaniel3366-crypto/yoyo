"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Plus, ArrowLeft, Search, Lock, UserCheck, X, CheckCircle2 } from "lucide-react";
import { Role, ServiceSlug } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  services: string[];
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
}

const USERS: PlatformUser[] = [
  { id: "u1", name: "Super Administrator", email: "admin@zinoone.com", role: "SUPER_ADMIN", services: ["ALL_SERVICES"], status: "ACTIVE", lastLogin: "Just now" },
  { id: "u2", name: "Femi Adeleke", email: "femi.adeleke@zinoone.com", role: "ACCOUNTANT", services: ["BILLSTACKS", "APARTMENTS"], status: "ACTIVE", lastLogin: "Today, 08:30" },
  { id: "u3", name: "Adaeze Okafor", email: "adaeze.o@zinoapartments.com", role: "FRONT_DESK", services: ["APARTMENTS"], status: "ACTIVE", lastLogin: "Today, 07:45" },
  { id: "u4", name: "Chinedu Eze", email: "chinedu@devicegalaxy.com", role: "STORE_MANAGER", services: ["GALAXY", "SPARK"], status: "ACTIVE", lastLogin: "Yesterday" },
  { id: "u5", name: "Tunde Bakare", email: "tunde@topbuilders.ng", role: "YARD_SUPERVISOR", services: ["BUILDERS"], status: "ACTIVE", lastLogin: "18 Nov 2026" },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<PlatformUser[]>(USERS);
  const [search, setSearch] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "STORE_MANAGER",
    service: "SPARK",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim()) return;

    const created: PlatformUser = {
      id: `u_${Date.now()}`,
      name: newStaff.name.trim(),
      email: newStaff.email.trim().toLowerCase(),
      role: newStaff.role,
      services: [newStaff.service],
      status: "ACTIVE",
      lastLogin: "Invited — Pending first login",
    };

    setUsers([created, ...users]);
    setInviteModalOpen(false);
    setNewStaff({ name: "", email: "", role: "STORE_MANAGER", service: "SPARK" });
    showToast(`Staff invitation sent to ${created.email}`);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

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
            <Link href="/admin" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-heading">Users &amp; Roles Management</h1>
          <p className="text-xs text-muted mt-0.5">
            Role-based access control (RBAC), multi-subsidiary permissions, and user authentication.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-active text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Invite Staff User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-active"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">User Full Name</th>
                <th className="py-2.5">Email Address</th>
                <th className="py-2.5">Assigned Role</th>
                <th className="py-2.5">Accessible Services</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{u.name}</td>
                  <td className="py-3 font-mono text-muted">{u.email}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-active border border-indigo-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-[11px] font-semibold text-gray-700">
                      {u.services.join(", ")}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={u.status} size="sm" />
                  </td>
                  <td className="py-3 text-muted">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-heading space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-base">Invite Staff User</h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-muted hover:text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-heading mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adekunle"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div>
                <label className="block font-bold text-heading mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="samuel@zinoone.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-heading mb-1">Assigned Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SERVICE_MANAGER">Service Manager</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                    <option value="CASHIER">Cashier (POS)</option>
                    <option value="FRONT_DESK">Front Desk Concierge</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="RECEPTION">Reception / Kiosk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Service Access</label>
                  <select
                    value={newStaff.service}
                    onChange={(e) => setNewStaff({ ...newStaff, service: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                  >
                    <option value="ALL_SERVICES">All Services</option>
                    <option value="SPARK">Zino Spark</option>
                    <option value="APARTMENTS">Zino Apartments</option>
                    <option value="BUILDERS">Top Builders</option>
                    <option value="GALAXY">Device Galaxy</option>
                    <option value="BILLSTACKS">Billstacks</option>
                    <option value="VISITORS">Visitor Security</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-active text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
