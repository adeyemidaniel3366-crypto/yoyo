"use client";

import React, { useState, useMemo } from "react";
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
import { usePlatformStore } from "@/lib/platform-store";
import { getApartmentBookings, getApartmentSuites, getBookingStayState } from "@/lib/apartments-data";

export default function ZinoApartmentsAdminDashboard() {
  const [excludingTax, setExcludingTax] = useState(true);
  const { products: storeProducts, invoices, roomStatuses, setRoomStatus } = usePlatformStore();
  const [bookings, setBookings] = useState<any[]>(() => getApartmentBookings());

  React.useEffect(() => {
    const handleUpdate = () => setBookings(getApartmentBookings());
    window.addEventListener("zino_apartments_bookings_update", handleUpdate);
    return () => window.removeEventListener("zino_apartments_bookings_update", handleUpdate);
  }, []);

  // Live suites from store or apartment catalog
  const apartmentSuites = useMemo(() => {
    const pSuites = storeProducts.filter((p) => p.source === ServiceSlug.APARTMENTS && p.status !== "ARCHIVED");
    if (pSuites.length > 0) return pSuites;
    return getApartmentSuites();
  }, [storeProducts]);

  const totalSuitesCount = apartmentSuites.length;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Compute live real metrics from bookings
  const metrics = useMemo(() => {
    let pendingCheckIn = 0;
    let upcomingCheckIn = 0;
    let upcomingCheckOut = 0;
    let delayedCheckout = 0;
    let activeBooking = 0;
    let bookedRoomsToday = 0;

    bookings.forEach((b) => {
      const state = getBookingStayState(b, todayStr);
      if (state === "ARRIVING_TODAY") {
        pendingCheckIn += 1;
        bookedRoomsToday += 1;
      } else if (state === "UPCOMING") {
        upcomingCheckIn += 1;
      } else if (state === "OVERDUE_CHECKOUT") {
        delayedCheckout += 1;
        activeBooking += 1;
        bookedRoomsToday += 1;
      } else if (state === "IN_HOUSE") {
        activeBooking += 1;
        bookedRoomsToday += 1;
        if (b.checkOut === todayStr) {
          upcomingCheckOut += 1;
        }
      }
    });

    const availableRooms = Math.max(0, totalSuitesCount - bookedRoomsToday);

    return {
      pendingCheckIn,
      upcomingCheckIn,
      upcomingCheckOut,
      delayedCheckout,
      activeBooking,
      bookedRoomsToday,
      availableRooms,
      totalBookings: bookings.length,
    };
  }, [bookings, todayStr, totalSuitesCount]);

  // Registered guests computed from unique bookings & invoice contacts
  const guestMetrics = useMemo(() => {
    const guestMap = new Map<string, { email: string; phone: string }>();
    bookings.forEach((b) => {
      const name = b.guestName || "Guest";
      if (!guestMap.has(name)) {
        guestMap.set(name, { email: b.guestEmail || "", phone: b.guestPhone || "" });
      }
    });

    invoices
      .filter((i) => i.source === ServiceSlug.APARTMENTS)
      .forEach((i) => {
        if (i.customer && !guestMap.has(i.customer)) {
          guestMap.set(i.customer, { email: "", phone: "" });
        }
      });

    const totalRegistered = guestMap.size;
    let activeGuests = 0;
    let emailUnverified = 0;
    let phoneUnverified = 0;

    guestMap.forEach((info, name) => {
      const hasActive = bookings.some(
        (b) => b.guestName === name && (b.paymentStatus === "PAID" || b.paymentStatus === "CONFIRMED")
      );
      if (hasActive) activeGuests += 1;
      if (!info.email || !info.email.includes("@")) emailUnverified += 1;
      if (!info.phone || info.phone.length < 7) phoneUnverified += 1;
    });

    return {
      totalRegistered,
      activeGuests,
      emailUnverified,
      phoneUnverified,
    };
  }, [bookings, invoices]);

  // 8 Top Stat Cards for Zino Luxury Apartments
  const topStats = [
    { title: "Delayed Checkout", value: String(metrics.delayedCheckout), icon: LogOut, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Pending Check-In", value: String(metrics.pendingCheckIn), icon: LogIn, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { title: "Upcoming Check-In", value: String(metrics.upcomingCheckIn), icon: ArrowRight, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-100" },
    { title: "Upcoming Checkout", value: String(metrics.upcomingCheckOut), icon: LogOut, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Today's Booked Rooms", value: String(metrics.bookedRoomsToday), icon: CheckSquare, color: "text-indigo-900", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Today's Available Rooms", value: String(metrics.availableRooms), icon: BedDouble, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Active Booking", value: String(metrics.activeBooking), icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Total Bookings", value: String(metrics.totalBookings), icon: Building2, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  // 4 Bottom Guest Stat Cards
  const guestStats = [
    { title: "Total Registered Guests", value: String(guestMetrics.totalRegistered), icon: Users, bg: "bg-indigo-600 text-white" },
    { title: "Active Registered Guests", value: String(guestMetrics.activeGuests), icon: CheckSquare, bg: "bg-emerald-600 text-white" },
    { title: "Email Unverified Guests", value: String(guestMetrics.emailUnverified), icon: Mail, bg: "bg-rose-600 text-white" },
    { title: "Mobile Unverified Guests", value: String(guestMetrics.phoneUnverified), icon: Smartphone, bg: "bg-amber-600 text-white" },
  ];

  // Live Chart Data from real bookings & invoices
  const { bookingReportData, paymentReportData } = useMemo(() => {
    const daysMap: Record<string, { bookings: number; received: number; returned: number }> = {};
    const now = new Date();

    for (let i = 8; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 2);
      const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      daysMap[label] = { bookings: 0, received: 0, returned: 0 };
    }

    bookings.forEach((b) => {
      const d = b.createdAt ? new Date(b.createdAt) : new Date();
      const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      if (daysMap[label]) {
        daysMap[label].bookings += 1;
        if (b.paymentStatus === "PAID" || b.paymentStatus === "CONFIRMED") {
          daysMap[label].received += Math.round((b.totalKobo || 0) / 100);
        }
      }
    });

    invoices
      .filter((i) => i.source === ServiceSlug.APARTMENTS)
      .forEach((inv) => {
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date();
        const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
        if (daysMap[label] && inv.status === "PAID") {
          daysMap[label].received += Math.round((inv.amountKobo || 0) / 100);
        }
      });

    const bData = Object.entries(daysMap).map(([date, val]) => ({ date, bookings: val.bookings }));
    const pData = Object.entries(daysMap).map(([date, val]) => ({
      date,
      received: val.received,
      returned: val.returned,
    }));

    return { bookingReportData: bData, paymentReportData: pData };
  }, [bookings, invoices]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 rounded-lg bg-white border border-apartments/25 p-0.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              <Image
                src="/logos/zino-spark.png"
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
            <span>Booking Requests ({metrics.pendingCheckIn})</span>
          </Link>
        </div>
      </div>

      {/* Row 1 — 8 Real Stat Cards */}
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

      {/* Row 2 — 2 Live Charts */}
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
                <YAxis stroke="#8A8A9A" fontSize={11} tickLine={false} allowDecimals={false} />
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
                  formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, "Amount"]}
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

      {/* Row 3 — 4 Guest Stats Cards */}
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

      {/* Room Status Board Mini (Live inventory) */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-heading">Room Inventory &amp; Status Board</h3>
            <p className="text-xs text-muted">Zino Service Apartment — Lekki MAIN ({totalSuitesCount} Suites Catalogued)</p>
          </div>
          <Link
            href="/admin/apartments/rooms"
            className="text-xs font-bold text-active hover:underline"
          >
            Manage room types →
          </Link>
        </div>

        {apartmentSuites.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted">
            No apartment suites catalogued yet. Add suites from{" "}
            <Link href="/admin/products/new?service=apartments" className="text-active font-bold underline">
              Add New Product / Suite
            </Link>.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {apartmentSuites.map((suite, idx) => {
              const suiteId = suite.id || `suite-${idx}`;
              const currentStatus = roomStatuses[suiteId] || "AVAILABLE";
              const subtitle = "label" in suite ? suite.label : "subtitle" in suite ? suite.subtitle : "Suite";

              return (
                <div
                  key={suiteId}
                  className={`p-3 rounded-lg border text-center font-medium cursor-pointer transition-all hover:shadow-xs ${
                    currentStatus === "AVAILABLE"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : currentStatus === "OCCUPIED"
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-purple-50 border-purple-200 text-purple-900"
                  }`}
                  onClick={() => {
                    const next = currentStatus === "AVAILABLE" ? "OCCUPIED" : currentStatus === "OCCUPIED" ? "CLEANING" : "AVAILABLE";
                    setRoomStatus(suiteId, next);
                  }}
                  title="Click to toggle status"
                >
                  <p className="text-sm font-black truncate">{suite.name}</p>
                  <p className="text-[10px] text-muted truncate mt-0.5">{subtitle}</p>
                  <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider">
                    {currentStatus}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
