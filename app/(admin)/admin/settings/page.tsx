"use client";

import React, { useState } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Lock,
  Layers,
  CreditCard,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG, PLATFORM_NAME } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function PlatformSettingsPage() {
  const [platformName, setPlatformName] = useState(PLATFORM_NAME);
  const [currency] = useState("NGN (Nigerian Naira - ₦)");
  const [paystackKey, setPaystackKey] = useState("pk_test_************************");
  const [flutterwaveKey, setFlutterwaveKey] = useState("FLWPUBK_TEST-****************");
  const [isSaved, setIsSaved] = useState(false);

  const [serviceStatus, setServiceStatus] = useState<Record<ServiceSlug, boolean>>({
    [ServiceSlug.BILLSTACKS]: true,
    [ServiceSlug.BUILDERS]: true,
    [ServiceSlug.SPARK]: true,
    [ServiceSlug.APARTMENTS]: true,
    [ServiceSlug.GALAXY]: true,
    [ServiceSlug.VISITORS]: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-active" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Platform Settings & Service Registry
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Global configuration, branding, active services registry, and gateway settings.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Platform Branding & Identity */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <h3 className="font-bold text-heading text-base pb-2 border-b border-border">
            Platform Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                Platform Title (NEXT_PUBLIC_PLATFORM_NAME)
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs font-bold text-heading focus:outline-none focus:border-active"
              />
              <p className="text-[11px] text-muted mt-1">
                Changing this updates the header, browser title, and portal brand everywhere.
              </p>
            </div>

            <div>
              <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                Default Currency
              </label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-gray-50 text-xs text-muted font-bold select-none">
                <Lock className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>{currency} (Locked integer kobo)</span>
              </div>
              <p className="text-[11px] text-muted mt-1">
                Locked platform-wide. All amounts computed in integer kobo.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Service Registry (Super Admin Enable/Disable) */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 className="font-bold text-heading text-base">Service Registry</h3>
              <p className="text-xs text-muted">
                Control which business units appear on the public portal and admin sidebar.
              </p>
            </div>
            <span className="text-xs font-bold text-active">Super Admin Only</span>
          </div>

          <div className="divide-y divide-border">
            {Object.values(ServiceSlug).map((slug) => {
              const cfg = SERVICE_CONFIG[slug];
              const isEnabled = serviceStatus[slug];

              return (
                <div key={slug} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <div>
                      <p className="font-bold text-heading text-sm">{cfg.name}</p>
                      <p className="text-[11px] text-muted">
                        Slug: <code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{slug}</code> · Route: {cfg.publicRoute}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <SourceBadge source={slug} size="sm" />
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) =>
                          setServiceStatus((prev) => ({
                            ...prev,
                            [slug]: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-active"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Payment Gateways */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <h3 className="font-bold text-heading text-base pb-2 border-b border-border">
            Online Payment Gateways
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                Paystack Public Key (Apartments & Galaxy Checkout)
              </label>
              <input
                type="text"
                value={paystackKey}
                onChange={(e) => setPaystackKey(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs font-mono text-heading focus:outline-none focus:border-active"
              />
            </div>

            <div>
              <label className="block font-bold text-heading uppercase tracking-wider mb-1">
                Flutterwave Public Key (Alternative Gateway)
              </label>
              <input
                type="text"
                value={flutterwaveKey}
                onChange={(e) => setFlutterwaveKey(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs font-mono text-heading focus:outline-none focus:border-active"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-active text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
