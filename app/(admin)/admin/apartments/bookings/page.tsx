"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Building2,
  User,
  Phone,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/money";
import { getApartmentBookings } from "@/lib/apartments-data";

interface BookingRecord {
  id: string;
  bookingRef: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalKobo: number;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
  paymentStatus: "PAID" | "PART_PAID" | "UNPAID";
}

export default function ApartmentsBookingsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [liveBookings, setLiveBookings] = useState<BookingRecord[] | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchBookings = () => {
    const customBookings = getApartmentBookings().map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      guestName: b.guestName,
      roomName: `${b.suiteName} (${b.roomNumber || "Suite Assigned"})`,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,
      totalKobo: b.totalKobo,
      status: (b.paymentStatus === "PAID" ? "CONFIRMED" : "CONFIRMED") as BookingRecord["status"],
      paymentStatus: (b.paymentStatus === "PAID" ? "PAID" : "UNPAID") as BookingRecord["paymentStatus"],
    }));

    fetch("/api/apartments/bookings")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && Array.isArray(res.data)) {
          const mapped: BookingRecord[] = res.data.map((b: any) => ({
            id: b.id,
            bookingRef: b.ref,
            guestName: b.contact?.name || "Guest",
            roomName: b.room?.number ? `${b.roomType?.name || "Room"} (${b.room.number})` : b.roomType?.name || "Room",
            checkIn: typeof b.checkIn === "string" ? b.checkIn.slice(0, 10) : "",
            checkOut: typeof b.checkOut === "string" ? b.checkOut.slice(0, 10) : "",
            nights: b.nights || 1,
            totalKobo: b.totalKobo || 0,
            status: b.status,
            paymentStatus: b.paymentStatus || "PAID",
          }));
          setLiveBookings([...customBookings, ...mapped]);
        } else {
          setLiveBookings([...customBookings, ...defaultBookings]);
        }
      })
      .catch(() => {
        setLiveBookings([...customBookings, ...defaultBookings]);
      });
  };

  React.useEffect(() => {
    fetchBookings();
    window.addEventListener("zino_apartments_bookings_update", fetchBookings);
    return () => window.removeEventListener("zino_apartments_bookings_update", fetchBookings);
  }, []);

  const handleBookingAction = async (bookingRef: string, action: "check-in" | "check-out" | "cancel") => {
    setActionLoading(bookingRef);
    setActionFeedback(null);
    try {
      const payload =
        action === "cancel"
          ? { reason: "Cancelled by administrator" }
          : {};
      const res = await fetch(`/api/apartments/bookings/${bookingRef}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.ok) {
        fetchBookings();
      } else {
        setActionFeedback(json?.error?.message || `Could not complete ${action} on ${bookingRef}.`);
      }
    } catch {
      setActionFeedback(`Network error updating booking ${bookingRef}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const defaultBookings: BookingRecord[] = [];

  const bookings = liveBookings ?? defaultBookings;

  const totalBookingsCount = bookings.length;
  const activeCheckInsCount = bookings.filter((b) => b.status === "CHECKED_IN").length;
  const upcomingArrivalsCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const confirmedRevenueKobo = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (b.totalKobo || 0), 0);

  const filteredBookings = selectedStatus === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === selectedStatus);

  const columns: ColumnDef<BookingRecord>[] = [
    {
      key: "source",
      header: "Source",
      cell: () => <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />,
    },
    {
      key: "bookingRef",
      header: "Booking Ref",
      accessorKey: "bookingRef",
      cell: (row) => (
        <span className="font-mono font-semibold text-gray-900">{row.bookingRef}</span>
      ),
    },
    {
      key: "guestName",
      header: "Guest",
      accessorKey: "guestName",
      cell: (row) => (
        <div className="font-medium text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {row.guestName.charAt(0)}
          </div>
          {row.guestName}
        </div>
      ),
    },
    {
      key: "roomName",
      header: "Room / Type",
      accessorKey: "roomName",
      cell: (row) => <span className="text-gray-700">{row.roomName}</span>,
    },
    {
      key: "dates",
      header: "Stay Dates",
      cell: (row) => (
        <div className="text-xs">
          <span className="text-gray-900 font-medium">{row.checkIn}</span>
          <span className="text-gray-400 mx-1">→</span>
          <span className="text-gray-900 font-medium">{row.checkOut}</span>
          <span className="ml-1 text-gray-400">({row.nights} nts)</span>
        </div>
      ),
    },
    {
      key: "totalKobo",
      header: "Total",
      accessorKey: "totalKobo",
      cell: (row) => (
        <span className="font-semibold text-gray-900 font-mono">
          {formatCurrency(row.totalKobo)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Booking Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      accessorKey: "paymentStatus",
      cell: (row) => <StatusBadge status={row.paymentStatus} size="sm" />,
    },
    {
      key: "actions",
      header: "Action",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "CONFIRMED" && (
            <button
              type="button"
              disabled={actionLoading === row.bookingRef}
              onClick={() => handleBookingAction(row.bookingRef, "check-in")}
              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors disabled:opacity-50"
            >
              Check In
            </button>
          )}
          {row.status === "CHECKED_IN" && (
            <button
              type="button"
              disabled={actionLoading === row.bookingRef}
              onClick={() => handleBookingAction(row.bookingRef, "check-out")}
              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors disabled:opacity-50"
            >
              Check Out
            </button>
          )}
          {row.status !== "CHECKED_OUT" && row.status !== "CANCELLED" && (
            <button
              type="button"
              disabled={actionLoading === row.bookingRef}
              onClick={() => handleBookingAction(row.bookingRef, "cancel")}
              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[11px] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {actionFeedback && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-rose-500 hover:text-rose-800 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Apartments Bookings & Reservations</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="md" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage Lekki Phase 1 serviced apartment guest check-ins, reservations, and stay payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/apartments"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            Public Booking Page
          </Link>
          <Link
            href="/admin/apartments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            Hotel Overview
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={String(totalBookingsCount)}
          icon={Calendar}
          source={ServiceSlug.APARTMENTS}
        />
        <StatCard
          title="Active Check-Ins"
          value={String(activeCheckInsCount)}
          icon={Building2}
          source={ServiceSlug.APARTMENTS}
        />
        <StatCard
          title="Upcoming Arrivals"
          value={String(upcomingArrivalsCount)}
          icon={Clock}
          source={ServiceSlug.APARTMENTS}
        />
        <StatCard
          title="Confirmed Revenue"
          value={formatCurrency(confirmedRevenueKobo)}
          icon={CheckCircle2}
          source={ServiceSlug.APARTMENTS}
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "CHECKED_IN", "CONFIRMED", "CHECKED_OUT"].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedStatus === st
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={filteredBookings}
          title="All Reservations & Bookings"
          searchPlaceholder="Search by ref, guest name, or room..."
        />
      </div>
    </div>
  );
}
