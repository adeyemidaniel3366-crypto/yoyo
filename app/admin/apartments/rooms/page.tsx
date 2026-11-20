"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Tv,
  Wifi,
  Wind,
  Bath,
  Check,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";

interface RoomType {
  id: string;
  name: string;
  baseRateKobo: number;
  totalRooms: number;
  capacity: string;
  amenities: string[];
  imageUrl: string;
}

const INITIAL_TYPES: RoomType[] = [
  {
    id: "rt_1",
    name: "Classic Studio Apartment",
    baseRateKobo: 1000000,
    totalRooms: 4,
    capacity: "1 Adult",
    amenities: ["Air Conditioning", "Water Heater", "Fiber Wi-Fi"],
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
  },
  {
    id: "rt_2",
    name: "Deluxe Studio Suite",
    baseRateKobo: 3000000,
    totalRooms: 4,
    capacity: "2 Adults",
    amenities: ["Air Conditioning", "Fitted Kitchen", "Smart 4K TV", "Water Heater"],
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
  },
  {
    id: "rt_3",
    name: "Luxury 2-Bedroom Executive Suite",
    baseRateKobo: 5000000,
    totalRooms: 4,
    capacity: "4 Adults",
    amenities: ["Private Balcony", "Air Conditioning", "Full Chef Kitchen", "2 Bathrooms"],
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400",
  },
];

export default function ApartmentRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(INITIAL_TYPES);

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
            <h1 className="text-2xl font-bold text-heading">Apartment Room Types &amp; Suites</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Manage apartment configurations, suite pricing tiers, room inventory and guest amenities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Room type configuration updated successfully.")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-apartment text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roomTypes.map((rt) => (
          <div
            key={rt.id}
            className="bg-white rounded-2xl border border-border p-5 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] w-full rounded-xl bg-gray-50 overflow-hidden mb-4 border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rt.imageUrl} alt={rt.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-heading text-sm">{rt.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{rt.capacity} · {rt.totalRooms} Units</p>
                </div>
                <span className="font-black text-sm text-apartment">
                  {formatCurrency(rt.baseRateKobo)}
                  <span className="text-[10px] text-muted font-normal block text-right">/ night</span>
                </span>
              </div>

              <div className="my-4 pt-4 border-t border-border space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Amenities Included</p>
                <div className="flex flex-wrap gap-1.5">
                  {rt.amenities.map((am) => (
                    <span
                      key={am}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-border px-2 py-0.5 rounded-md text-heading"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted">Standard 10% Hotel Tax</span>
              <button
                type="button"
                className="font-bold text-apartment hover:underline"
                onClick={() => alert(`Editing ${rt.name}`)}
              >
                Edit Suite →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
