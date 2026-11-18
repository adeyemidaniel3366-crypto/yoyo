"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Building,
  Store,
  Warehouse,
  Globe,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { ServiceSlug, LOCATIONS, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function LocationsAdminPage() {
  const [locationsList] = useState(LOCATIONS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-active" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Locations & Facilities
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Physical stores, service apartments, warehouses, construction yards, and online hubs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add location")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-active text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locationsList.map((loc) => {
          const Icon =
            loc.type === "Shop"
              ? Store
              : loc.type === "Warehouse"
              ? Warehouse
              : loc.type === "Online"
              ? Globe
              : Building;

          return (
            <div
              key={loc.id}
              className="bg-white rounded-xl border border-border p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-heading">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                    Active
                  </span>
                </div>

                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Type: {loc.type} · Code: {loc.shortCode}
                </span>
                <h3 className="text-base font-bold text-heading mt-1">{loc.name}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{loc.address}</p>

                {/* Operating services */}
                <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Operating Services:
                  </p>
                  <div className="flex items-center flex-wrap gap-1">
                    {loc.services.map((s) => (
                      <SourceBadge key={s} source={s} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Stock Location</span>
                <span className="font-bold text-active">Manage Inventory →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
