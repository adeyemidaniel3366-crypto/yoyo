"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Briefcase,
  QrCode,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { ChartCard } from "@/components/ui/chart-card";
import { usePlatformStore } from "@/lib/platform-store";

export default function VisitorManagementDashboardPage() {
  const { visitors, checkoutVisitor } = usePlatformStore();
  const [userName, setUserName] = useState("John Doe");
  const [visitorData, setVisitorData] = useState<{
    totalVisitors: number;
    totalPreRegisters: number;
    todayAttendance: number;
    totalEmployees: number;
  }>({
    totalVisitors: 5,
    totalPreRegisters: 5,
    todayAttendance: 0,
    totalEmployees: 5,
  });

  React.useEffect(() => {
    // Fetch authenticated user
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data) {
          const u = res.data;
          setUserName(`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Staff");
        }
      })
      .catch(() => {});

    // Fetch live visitor summary
    fetch("/api/visitors/reports/daily")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data) {
          const d = res.data;
          setVisitorData({
            totalVisitors: d.totalVisits ?? 5,
            totalPreRegisters: d.visitsByStatus?.find((v: any) => v.status === "EXPECTED")?.count ?? 5,
            todayAttendance: d.attendanceByStatus?.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0) ?? 0,
            totalEmployees: 5,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Determine greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning!" : hour < 18 ? "Good Afternoon!" : "Good Night!";

  // 4 Overview cards synced with live visitors list
  const overviewCards = [
    { title: "Total Employees", value: String(visitorData.totalEmployees), bg: "bg-[#0A1931] text-white" },
    { title: "Total Visitors", value: String(visitors.length), bg: "bg-[#6D5DF6] text-white" },
    { title: "Total Pre Registers", value: String(visitorData.totalPreRegisters), bg: "bg-[#3B82F6] text-white" },
    { title: "Active Inside Premises", value: String(visitors.filter((v) => v.status === "CHECKED_IN").length), bg: "bg-[#8B5CF6] text-white" },
  ];

  // 12 Nov - 18 Nov Chart Data
  const weeklyVisitorData = [
    { date: "12", preReg: 0, frontDesk: 0 },
    { date: "13", preReg: 0, frontDesk: 0 },
    { date: "14", preReg: 0, frontDesk: 0 },
    { date: "15", preReg: 0, frontDesk: 0 },
    { date: "16", preReg: 0, frontDesk: 0 },
    { date: "17", preReg: 0, frontDesk: 0 },
    { date: "18", preReg: 0, frontDesk: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header matching Screenshot */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-white border border-border p-0.5 overflow-hidden shrink-0">
            <Image src="/logos/visitor-management.png" alt="Visitor Management" width={36} height={36} className="w-full h-full object-contain" />
          </span>
          <SourceBadge source={ServiceSlug.VISITORS} size="sm" />
          <span className="text-xs text-muted font-bold uppercase tracking-wider">Enterprise Security</span>
        </div>
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mt-1">
          {greeting}
        </h1>
        <p className="text-lg font-bold text-muted">{userName}</p>
      </div>

      {/* Overview Cards (4) */}
      <div>
        <h3 className="text-base font-bold text-heading mb-3">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card) => (
            <div
              key={card.title}
              className={`p-6 rounded-2xl shadow-sm flex items-center gap-4 ${card.bg}`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <div>
                <p className="text-xs font-semibold opacity-80">{card.title}</p>
                <p className="text-3xl font-black mt-0.5">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Visitor Charts (Pre-Registered Visitors & Front-Desk Visitors) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pre-Registered Visitors */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
            <h4 className="font-bold text-heading text-sm">Pre-Registered Visitors</h4>
            <span className="text-xs text-muted font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>12 Nov - 18 Nov</span>
            </span>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVisitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} domain={[0, 2]} />
                <Tooltip />
                <Line type="monotone" dataKey="preReg" stroke="#1E3A8A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Front-Desk Visitors */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
            <h4 className="font-bold text-heading text-sm">Front-Desk Visitors</h4>
            <span className="text-xs text-muted font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>12 Nov - 18 Nov</span>
            </span>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVisitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} domain={[0, 2]} />
                <Tooltip />
                <Line type="monotone" dataKey="frontDesk" stroke="#1E3A8A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Launch Kiosk & Operations Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <Link
          href="/visit"
          target="_blank"
          className="p-5 rounded-xl border border-border bg-white hover:border-active transition-all shadow-2xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-visitors-tint text-visitors flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-heading text-sm">Launch Visitor Kiosk</p>
              <p className="text-[11px] text-muted font-normal">Self check-in screen for iPad/tablets</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/visitors/attendance"
          className="p-5 rounded-xl border border-border bg-white hover:border-active transition-all shadow-2xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-heading text-sm">Employee Attendance</p>
              <p className="text-[11px] text-muted font-normal">Daily biometric / clock in logs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/visitors/pre-registers"
          className="p-5 rounded-xl border border-border bg-white hover:border-active transition-all shadow-2xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-heading text-sm">Pre-Registration Invites</p>
              <p className="text-[11px] text-muted font-normal">VIP visitor invitations & badges</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Live Visitors List Table on Admin Visitor Management Dashboard */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-heading">Live Visitors &amp; Appointments List</h3>
            <p className="text-xs text-muted">
              Real-time visitor check-ins, time of visit, time of appointment, and premises status synced from the reception kiosk.
            </p>
          </div>
          <Link
            href="/admin/visitors/list"
            className="text-xs font-bold text-visitor hover:underline"
          >
            Open Full Visitor Logbook →
          </Link>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Badge #</th>
                <th className="py-2.5">Visitor Name &amp; Phone</th>
                <th className="py-2.5">Host Staff Member</th>
                <th className="py-2.5">Purpose</th>
                <th className="py-2.5">Visit Schedule</th>
                <th className="py-2.5">Appointment Schedule</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visitors.map((v) => (
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
                    {v.status === "CHECKED_IN" && (
                      <button
                        type="button"
                        onClick={() => checkoutVisitor(v.id)}
                        className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                      >
                        Check Out
                      </button>
                    )}
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
