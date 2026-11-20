"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Calendar,
  LogIn,
  LogOut,
  BedDouble,
  CheckSquare,
  Users,
  Mail,
  Smartphone,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { ChartCard } from "@/components/ui/chart-card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/money";

export default function ZinoApartmentsAdminDashboard() {
  const [excludingTax, setExcludingTax] = useState(true);

  // 8 Top Stat Cards for Zino Luxury Apartments
  const topStats = [
    { title: "Delayed Checkout", value: "0", icon: LogOut, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Pending Check-In", value: "2", icon: LogIn, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { title: "Upcoming Check-In", value: "3", icon: ArrowRight, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-100" },
    { title: "Upcoming Checkout", value: "1", icon: LogOut, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Today's Booked Rooms", value: "9", icon: CheckSquare, color: "text-indigo-900", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Today's Available Rooms", value: "3", icon: BedDouble, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Active Booking", value: "9", icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Total Bookings", value: "48", icon: Building2, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  // 4 Bottom Guest Stat Cards
  const guestStats = [
    { title: "Total Registered Guests", value: "142", icon: Users, bg: "bg-indigo-600 text-white" },
    { title: "Active Registered Guests", value: "38", icon: CheckSquare, bg: "bg-emerald-600 text-white" },
    { title: "Email Unverified Guests", value: "4", icon: Mail, bg: "bg-rose-600 text-white" },
    { title: "Mobile Unverified Guests", value: "2", icon: Smartphone, bg: "bg-amber-600 text-white" },
  ];

  // Chart data for Booking Report (Nov 4 - Nov 20, 2026)
  const bookingReportData = [
    { date: "04-Nov", bookings: 4 },
    { date: "06-Nov", bookings: 6 },
    { date: "08-Nov", bookings: 5 },
    { date: "10-Nov", bookings: 8 },
    { date: "12-Nov", bookings: 7 },
    { date: "14-Nov", bookings: 9 },
    { date: "16-Nov", bookings: 8 },
    { date: "18-Nov", bookings: 11 },
    { date: "20-Nov", bookings: 12 },
  ];

  // Chart data for Payment Report (Received vs Returned in ₦)
  const paymentReportData = [
    { date: "04-Nov", received: 240000, returned: 0 },
    { date: "06-Nov", received: 380000, returned: 0 },
    { date: "08-Nov", received: 310000, returned: 0 },
    { date: "10-Nov", received: 520000, returned: 0 },
    { date: "12-Nov", received: 450000, returned: 0 },
    { date: "14-Nov", received: 610000, returned: 0 },
    { date: "16-Nov", received: 580000, returned: 0 },
    { date: "18-Nov", received: 720000, returned: 0 },
    { date: "20-Nov", received: 850000, returned: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 rounded-lg bg-white border border-apartments/25 p-0.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              <Image
                src="/logos/apartments-logo.png"
                alt="Zino Luxury Apartments"
                width={80}
                height={55}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-heading tracking-tight">Zino Apartments Dashboard</h1>
                <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
              </div>
              <p className="text-xs text-muted mt-0.5">
                Zino Luxury Serviced Living — Lekki Phase 1, Lagos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/apartments/front-desk"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-apartments text-white text-xs font-bold hover:bg-apartments-dark transition-colors shadow-sm"
          >
            <span>Front Desk Arrivals</span>
          </Link>
          <Link
            href="/admin/apartments/bookings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
          >
            <span>Booking Requests (0)</span>
          </Link>
        </div>
      </div>

      {/* Row 1 — 8 Stat Cards from screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((st) => {
          const Icon = st.icon;

          return (
            <div
              key={st.title}
              className="bg-white p-5 rounded-xl border border-border shadow-2xs flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-2xl font-bold text-heading tracking-tight">{st.value}</p>
                <p className="text-xs text-muted mt-1 font-medium">{st.title}</p>
              </div>

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${st.bg} ${st.color} ${st.border}`}>
                <Icon className="w-6 h-6 stroke-[1.75]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2 — 2 Charts Matching Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Report (Excluding Tax) */}
        <ChartCard
          title="Booking Report"
          subtitle={excludingTax ? "(Excluding Tax)" : "(Including Tax)"}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExcludingTax(!excludingTax)}
                className="text-[11px] font-semibold text-active hover:underline"
              >
                {excludingTax ? "Include Tax" : "Exclude Tax"}
              </button>
              <DateRangePicker />
            </div>
          }
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingReportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} domain={[0, 2]} />
                <Tooltip
                  formatter={(val: any) => [val, "Bookings"]}
                  contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#4F46E5" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Payment Report (Received vs Returned) */}
        <ChartCard
          title="Payment Report"
          subtitle="Received Amount vs Returned Amount"
          rightAction={<DateRangePicker />}
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentReportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="date" stroke="#8A8A9A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`₦${val}`, "Amount"]}
                  contentStyle={{ backgroundColor: "#1A1A2E", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="received" name="Received Amount" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="returned" name="Returned Amount" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 — 4 Guest Stats Cards Matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guestStats.map((st) => {
          const Icon = st.icon;

          return (
            <div
              key={st.title}
              className={`p-5 rounded-xl shadow-2xs flex items-center justify-between gap-3 ${st.bg}`}
            >
              <div>
                <p className="text-3xl font-black">{st.value}</p>
                <p className="text-xs font-semibold opacity-90 mt-1">{st.title}</p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-white stroke-[2]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Status Board Mini */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-heading">Room Inventory & Status Board</h3>
            <p className="text-xs text-muted">Zino Service Apartment — Lekki MAIN (12 Rooms Total)</p>
          </div>
          <Link
            href="/admin/apartments/rooms"
            className="text-xs font-bold text-active hover:underline"
          >
            Manage room types →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {[
            { num: "101", type: "Classic Studio", status: "AVAILABLE" },
            { num: "102", type: "Classic Studio", status: "AVAILABLE" },
            { num: "201", type: "Compact Studio", status: "OCCUPIED" },
            { num: "202", type: "Compact Studio", status: "AVAILABLE" },
            { num: "301", type: "Deluxe Studio", status: "OCCUPIED" },
            { num: "302", type: "Deluxe Studio", status: "CLEANING" },
            { num: "401", type: "Executive 1-Bed", status: "AVAILABLE" },
            { num: "402", type: "Executive 1-Bed", status: "AVAILABLE" },
            { num: "501", type: "Luxury 2-Bed", status: "OCCUPIED" },
            { num: "502", type: "Luxury 2-Bed", status: "MAINTENANCE" },
            { num: "601", type: "Luxury 2-Bed", status: "AVAILABLE" },
            { num: "602", type: "Luxury 2-Bed", status: "AVAILABLE" },
          ].map((rm) => (
            <div
              key={rm.num}
              className={`p-3 rounded-lg border text-center font-medium ${
                rm.status === "AVAILABLE"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : rm.status === "OCCUPIED"
                  ? "bg-blue-50 border-blue-200 text-blue-900"
                  : rm.status === "CLEANING"
                  ? "bg-purple-50 border-purple-200 text-purple-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <p className="text-sm font-black">Room {rm.num}</p>
              <p className="text-[10px] text-muted truncate mt-0.5">{rm.type}</p>
              <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider">
                {rm.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
