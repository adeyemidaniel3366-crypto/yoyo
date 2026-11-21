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
  X,
} from "lucide-react";
import { ServiceSlug, LOCATIONS, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function LocationsAdminPage() {
  const [locationsList, setLocationsList] = useState(LOCATIONS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newLoc, setNewLoc] = useState({
    name: "",
    shortCode: "",
    type: "Shop",
    address: "",
    phone: "+234 800 000 0000",
    service: ServiceSlug.SPARK,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name.trim()) return;

    const created = {
      id: `loc_${Date.now()}`,
      name: newLoc.name.trim(),
      shortCode: newLoc.shortCode.trim() || newLoc.name.slice(0, 4).toUpperCase(),
      type: newLoc.type,
      address: newLoc.address.trim() || "Lagos, Nigeria",
      phone: newLoc.phone.trim(),
      services: [newLoc.service],
    };

    setLocationsList([...locationsList, created]);
    setAddModalOpen(false);
    setNewLoc({
      name: "",
      shortCode: "",
      type: "Shop",
      address: "",
      phone: "+234 800 000 0000",
      service: ServiceSlug.SPARK,
    });
    showToast(`Added location "${created.name}" successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          onClick={() => setAddModalOpen(true)}
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

      {/* Add Location Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-heading space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-base">Add New Location / Hub</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-muted hover:text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLocationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-heading mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Village Main Store"
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-heading mb-1">Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CV-01"
                    value={newLoc.shortCode}
                    onChange={(e) => setNewLoc({ ...newLoc, shortCode: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border font-mono outline-none focus:border-active uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Facility Type</label>
                  <select
                    value={newLoc.type}
                    onChange={(e) => setNewLoc({ ...newLoc, type: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                  >
                    <option value="Shop">Shop / Retail Store</option>
                    <option value="Apartment">Service Apartment</option>
                    <option value="Warehouse">Warehouse / Yard</option>
                    <option value="Online">Online Dispatch</option>
                    <option value="Office">Office / HQ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-heading mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 14 Medical Road, Ikeja"
                  value={newLoc.address}
                  onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border outline-none focus:border-active"
                />
              </div>
              <div>
                <label className="block font-bold text-heading mb-1">Operating Business Service</label>
                <select
                  value={newLoc.service}
                  onChange={(e) => setNewLoc({ ...newLoc, service: e.target.value as ServiceSlug })}
                  className="w-full h-9 px-2 rounded-xl border border-border outline-none focus:border-active bg-white text-gray-900"
                >
                  <option value={ServiceSlug.SPARK}>Zino Spark (Retail POS)</option>
                  <option value={ServiceSlug.APARTMENTS}>Zino Apartments (Hospitality)</option>
                  <option value={ServiceSlug.BUILDERS}>Top Builders (Materials Yard)</option>
                  <option value={ServiceSlug.GALAXY}>Device Galaxy (E-Commerce)</option>
                  <option value={ServiceSlug.BILLSTACKS}>Billstacks (Cloud Invoicing)</option>
                  <option value={ServiceSlug.VISITORS}>Visitor Management (Front Desk)</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-active text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
