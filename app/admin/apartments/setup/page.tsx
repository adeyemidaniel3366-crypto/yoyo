"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Clock,
  Save,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Wifi,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function ApartmentSetupPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    propertyName: "Zino Luxury Apartments & Suites",
    address: "Lekki Phase 1, Lagos, Nigeria",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    taxPercentage: "10.0",
    cautionFeeNgn: "50000",
    wifiSsid: "Zino_Apartments_Guest_5G",
    wifiPassword: "zinoluxurystay",
    cancellationPolicy: "Full refund up to 24 hours prior to check-in date.",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/apartments" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Apartment Property Setup</h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Check-in/out policies, VAT rules, security deposits, and guest amenities configuration.
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Property settings saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Property Name</label>
            <input
              type="text"
              value={settings.propertyName}
              onChange={(e) => setSettings({ ...settings, propertyName: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Property Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Check-in Time</label>
            <input
              type="time"
              value={settings.checkInTime}
              onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Check-out Time</label>
            <input
              type="time"
              value={settings.checkOutTime}
              onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Apartment Tax %</label>
            <input
              type="number"
              value={settings.taxPercentage}
              onChange={(e) => setSettings({ ...settings, taxPercentage: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Guest Wi-Fi Network (SSID)</label>
            <input
              type="text"
              value={settings.wifiSsid}
              onChange={(e) => setSettings({ ...settings, wifiSsid: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-heading block mb-1">Guest Wi-Fi Password</label>
            <input
              type="text"
              value={settings.wifiPassword}
              onChange={(e) => setSettings({ ...settings, wifiPassword: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs text-heading font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Cancellation &amp; Refund Policy</label>
          <textarea
            rows={3}
            value={settings.cancellationPolicy}
            onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
            className="w-full p-3 rounded-xl border border-border text-xs text-heading resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-apartment text-white text-xs font-bold shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Apartment Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
