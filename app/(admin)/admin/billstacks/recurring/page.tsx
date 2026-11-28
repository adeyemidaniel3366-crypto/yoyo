"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Repeat, Plus, ArrowLeft, Play, Pause, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import { NumberInput } from "@/components/ui/number-input";

interface RecurringProfile {
  id: string;
  profileName: string;
  client: string;
  amountKobo: number;
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  nextRun: string;
  isActive: boolean;
}

const PROFILES: RecurringProfile[] = [];

export default function BillstacksRecurringPage() {
  const [profiles, setProfiles] = useState<RecurringProfile[]>(PROFILES);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState({
    profileName: "",
    client: "",
    amountNaira: "",
    frequency: "MONTHLY" as "MONTHLY" | "QUARTERLY" | "ANNUALLY",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const toggleStatus = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isActive;
          showToast(`Schedule for ${p.client} is now ${nextState ? "ACTIVE" : "PAUSED"}.`);
          return { ...p, isActive: nextState };
        }
        return p;
      })
    );
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfile.profileName.trim() || !newProfile.client.trim() || !newProfile.amountNaira.trim()) return;

    const amountKobo = Math.round(Number(newProfile.amountNaira) * 100);
    const nextRun = "01 Dec 2026";

    const created: RecurringProfile = {
      id: `rp_${Date.now()}`,
      profileName: newProfile.profileName.trim(),
      client: newProfile.client.trim(),
      amountKobo,
      frequency: newProfile.frequency,
      nextRun,
      isActive: true,
    };

    setProfiles([created, ...profiles]);
    setModalOpen(false);
    setNewProfile({ profileName: "", client: "", amountNaira: "", frequency: "MONTHLY" });
    showToast(`Recurring profile "${created.profileName}" configured for ${created.client}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-emerald-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/billstacks" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Billstacks Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Recurring Invoices &amp; Subscriptions</h1>
            <SourceBadge source={ServiceSlug.BILLSTACKS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Automated monthly retainers, scheduled client billing, and subscription cadences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Schedule</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Profile / Service</th>
                <th className="py-2.5">Client</th>
                <th className="py-2.5">Frequency</th>
                <th className="py-2.5">Next Run Date</th>
                <th className="py-2.5 text-right">Cadence Amount</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{p.profileName}</td>
                  <td className="py-3 text-muted">{p.client}</td>
                  <td className="py-3 font-mono font-semibold">{p.frequency}</td>
                  <td className="py-3 text-muted">{p.nextRun}</td>
                  <td className="py-3 text-right font-black text-heading">
                    {formatCurrency(p.amountKobo)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-muted"
                      }`}
                    >
                      {p.isActive ? "ACTIVE" : "PAUSED"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(p.id)}
                      className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-1 text-heading"
                    >
                      {p.isActive ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-500" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-500" /> Resume
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-billstacks/10 flex items-center justify-center text-billstacks">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">New Recurring Schedule</h3>
                  <p className="text-xs text-gray-500">Automate recurring client retainer invoices</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Profile / Retainer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Managed DevOps SLA"
                  value={newProfile.profileName}
                  onChange={(e) => setNewProfile({ ...newProfile, profileName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client / Subscriber *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Chartered Bank"
                  value={newProfile.client}
                  onChange={(e) => setNewProfile({ ...newProfile, client: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cadence Amount (₦) *
                  </label>
                  <NumberInput
                    required
                    min={1}
                    placeholder="e.g. 750,000"
                    prefix="₦"
                    value={newProfile.amountNaira}
                    onChange={(v) => setNewProfile({ ...newProfile, amountNaira: v === "" ? "" : String(v) })}
                    className="rounded-xl text-xs focus:border-billstacks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                  <select
                    value={newProfile.frequency}
                    onChange={(e) => setNewProfile({ ...newProfile, frequency: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-billstacks bg-white text-gray-900"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-billstacks text-white text-xs font-bold hover:opacity-95 shadow-sm"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
