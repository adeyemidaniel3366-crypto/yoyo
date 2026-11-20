"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Plus, ArrowLeft, Search, Lock, UserCheck } from "lucide-react";
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
  const [users] = useState<PlatformUser[]>(USERS);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
          onClick={() => alert("Invite New User dialog")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-active text-white text-xs font-bold shadow-sm"
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
    </div>
  );
}
