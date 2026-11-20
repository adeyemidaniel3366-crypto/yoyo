"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalStays: number;
  lastStay: string;
  supportTicket?: string;
  supportStatus?: "OPEN" | "RESOLVED";
}

const GUESTS: Guest[] = [
  { id: "g1", name: "Adaeze Okafor", phone: "+234 803 123 4567", email: "adaeze.o@gmail.com", totalStays: 3, lastStay: "19 Nov 2026", supportTicket: "Extra room card key request", supportStatus: "OPEN" },
  { id: "g2", name: "Engr. Tunde Bakare", phone: "+234 802 987 6543", email: "tunde.bakare@vertex.ng", totalStays: 5, lastStay: "18 Nov 2026" },
  { id: "g3", name: "Chief Okonkwo", phone: "+234 805 555 1234", email: "okonkwo.builders@yahoo.com", totalStays: 2, lastStay: "17 Nov 2026" },
  { id: "g4", name: "Dr. Babatunde Alabi", phone: "+234 810 444 8899", email: "dr.alabi@unilag.edu.ng", totalStays: 1, lastStay: "10 Nov 2026" },
];

export default function ApartmentGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>(GUESTS);
  const [search, setSearch] = useState("");

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/apartments" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Apartment Guests &amp; Support</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Guest directory, stay frequency history, concierge support tickets and inquiries.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-apartment"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Guest Name</th>
                <th className="py-2.5">Contact</th>
                <th className="py-2.5 text-center">Total Stays</th>
                <th className="py-2.5">Last Stay</th>
                <th className="py-2.5">Concierge / Support Ticket</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{g.name}</td>
                  <td className="py-3">
                    <p className="text-heading font-medium">{g.phone}</p>
                    <p className="text-[11px] text-muted">{g.email}</p>
                  </td>
                  <td className="py-3 text-center font-bold text-apartment">{g.totalStays}</td>
                  <td className="py-3 text-muted">{g.lastStay}</td>
                  <td className="py-3">
                    {g.supportTicket ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <MessageSquare className="w-3 h-3" />
                        {g.supportTicket} ({g.supportStatus})
                      </span>
                    ) : (
                      <span className="text-muted italic text-[11px]">No open tickets</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Contacting guest ${g.name}`)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-heading hover:bg-gray-50"
                    >
                      View Profile
                    </button>
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
