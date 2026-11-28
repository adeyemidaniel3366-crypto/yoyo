"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  UserCheck,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowLeft,
  Search,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface FrontDeskRoom {
  roomNo: string;
  type: string;
  guestName: string | null;
  status: "OCCUPIED" | "AVAILABLE" | "CLEANING" | "RESERVED";
  checkIn: string | null;
  checkOut: string | null;
  dailyRateKobo: number;
}

const INITIAL_ROOMS: FrontDeskRoom[] = [];

export default function ApartmentsFrontDeskPage() {
  const [rooms, setRooms] = useState<FrontDeskRoom[]>(INITIAL_ROOMS);
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<FrontDeskRoom | null>(null);

  const toggleRoomStatus = (roomNo: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNo !== roomNo) return r;
        if (r.status === "OCCUPIED") {
          return { ...r, status: "CLEANING", guestName: null, checkIn: null, checkOut: null };
        }
        if (r.status === "CLEANING") {
          return { ...r, status: "AVAILABLE" };
        }
        return { ...r, status: "OCCUPIED", guestName: "Walk-in Guest", checkIn: "Today", checkOut: "Tomorrow" };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/apartments" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Front Desk &amp; Room Rack</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Live room occupancy matrix, express guest check-in/out, and housekeeping status.
          </p>
        </div>

        <Link
          href="/admin/apartments/bookings"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-apartment text-white text-xs font-bold shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          <span>Manage Bookings</span>
        </Link>
      </div>

      {/* Room Rack Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border">
          <p className="text-xs text-muted">Total Suites</p>
          <h3 className="text-xl font-bold text-heading mt-1">{rooms.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border">
          <p className="text-xs text-emerald-600 font-semibold">Occupied (Live)</p>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">
            {rooms.filter((r) => r.status === "OCCUPIED").length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border">
          <p className="text-xs text-blue-600 font-semibold">Available Ready</p>
          <h3 className="text-xl font-bold text-blue-600 mt-1">
            {rooms.filter((r) => r.status === "AVAILABLE").length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border">
          <p className="text-xs text-amber-600 font-semibold">Housekeeping</p>
          <h3 className="text-xl font-bold text-amber-600 mt-1">
            {rooms.filter((r) => r.status === "CLEANING").length}
          </h3>
        </div>
      </div>

      {/* Room Matrix Grid */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-heading">Apartment Room Matrix</h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room no or guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-border text-xs text-heading"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms
            .filter((r) => !search || r.roomNo.toLowerCase().includes(search.toLowerCase()) || r.guestName?.toLowerCase().includes(search.toLowerCase()))
            .map((room) => (
              <div
                key={room.roomNo}
                className={`p-5 rounded-xl border transition-all ${
                  room.status === "OCCUPIED"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : room.status === "CLEANING"
                    ? "bg-amber-50/40 border-amber-200"
                    : room.status === "RESERVED"
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-gray-50/40 border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-black text-heading">{room.roomNo}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      room.status === "OCCUPIED"
                        ? "bg-emerald-600 text-white"
                        : room.status === "CLEANING"
                        ? "bg-amber-500 text-white"
                        : room.status === "RESERVED"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <p className="font-bold text-xs text-heading">{room.type}</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Rate: {formatCurrency(room.dailyRateKobo)} / night
                </p>

                <div className="my-3 pt-3 border-t border-border/60 text-xs">
                  {room.guestName ? (
                    <div>
                      <p className="font-semibold text-heading truncate">{room.guestName}</p>
                      <p className="text-[11px] text-muted">
                        {room.checkIn} → {room.checkOut}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted italic text-[11px]">No active guest in room</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleRoomStatus(room.roomNo)}
                  className="w-full py-2 rounded-lg bg-white border border-border text-heading hover:bg-gray-50 text-xs font-bold transition-colors shadow-2xs"
                >
                  {room.status === "OCCUPIED"
                    ? "Check-Out & Mark Cleaning"
                    : room.status === "CLEANING"
                    ? "Mark Clean & Ready"
                    : "Express Walk-in Check-In"}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
