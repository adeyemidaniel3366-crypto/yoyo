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
  X,
  Building2,
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
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/apartments" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Apartments Guest Directory</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            VIP guest resident registry, historical booking frequency, and open concierge support requests.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-apartments"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Guest Profile</th>
                <th className="py-2.5">Direct Contact</th>
                <th className="py-2.5 text-center">Stays Frequency</th>
                <th className="py-2.5">Most Recent Stay</th>
                <th className="py-2.5">Concierge Requests</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{g.name}</td>
                  <td className="py-3">
                    <p className="text-heading font-medium">{g.phone}</p>
                    <p className="text-muted text-[11px]">{g.email}</p>
                  </td>
                  <td className="py-3 text-center font-black text-apartments">
                    {g.totalStays} {g.totalStays === 1 ? "Stay" : "Stays"}
                  </td>
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
                      onClick={() => setSelectedGuest(g)}
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

      {/* Guest Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-apartments/10 text-apartments flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedGuest.name}</h3>
                  <p className="text-xs text-gray-500">VIP Resident Profile</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuest(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone Number:</span>
                <span className="font-semibold text-gray-900">{selectedGuest.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Address:</span>
                <span className="font-semibold text-gray-900">{selectedGuest.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Completed Stays:</span>
                <span className="font-bold text-apartments">{selectedGuest.totalStays} Stays</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Stay Recorded:</span>
                <span className="font-semibold text-gray-900">{selectedGuest.lastStay}</span>
              </div>
              {selectedGuest.supportTicket && (
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="text-amber-700 font-semibold">Active Ticket:</span>
                  <span className="text-xs text-gray-800">{selectedGuest.supportTicket}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${selectedGuest.phone}`}
                className="py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-apartments" />
                <span>Call Resident</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  showToast(`Concierge SMS dispatched to ${selectedGuest.phone}`);
                  setSelectedGuest(null);
                }}
                className="py-2.5 rounded-xl bg-apartments text-white text-xs font-bold hover:opacity-95 shadow-sm transition-opacity flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
