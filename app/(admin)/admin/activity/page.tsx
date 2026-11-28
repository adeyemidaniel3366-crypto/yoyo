"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Filter,
  Search,
  Calendar,
  User,
  MapPin,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG, LOCATIONS } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";

interface ActivityItem {
  id: string;
  source: ServiceSlug;
  time: string;
  timestamp: string;
  actor: string;
  action: string;
  recordTitle: string;
  recordHref: string;
  amountKobo?: number;
  location?: string;
  category: "sale" | "booking" | "payment" | "stock" | "visit" | "system";
}

export default function ActivityTimelinePage() {
  const { activities: liveStoreActivities } = usePlatformStore();
  const [selectedSource, setSelectedSource] = useState<ServiceSlug | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const staticActivities: ActivityItem[] = [];

  const allActivities: ActivityItem[] = useMemo(() => {
    const mappedLive: ActivityItem[] = liveStoreActivities.map((la) => ({
      id: la.id,
      source: la.source,
      time: la.time,
      timestamp: "Today",
      actor: la.actor,
      action: la.action,
      recordTitle: `${SERVICE_CONFIG[la.source]?.name ?? la.source} Activity`,
      recordHref: "/admin",
      amountKobo: la.amount ? Number(la.amount.replace(/[^0-9]/g, "")) * 100 || undefined : undefined,
      location: la.location || undefined,
      category: la.source === ServiceSlug.APARTMENTS ? "booking" : la.source === ServiceSlug.VISITORS ? "visit" : "sale",
    }));
    return [...mappedLive, ...staticActivities];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStoreActivities]);

  const filtered = useMemo(() => {
    return allActivities.filter((item) => {
      if (selectedSource !== "ALL" && item.source !== selectedSource) return false;
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.actor.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          item.recordTitle.toLowerCase().includes(q) ||
          (item.location && item.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allActivities, selectedSource, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-active" />
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Cross-Service Activity Timeline
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Single chronological audit trail of all transactions, movements, bookings, and alerts across the platform.
          </p>
        </div>

        <DateRangePicker align="right" />
      </div>

      {/* Filter Bar with Service Coloured Pills */}
      <div className="bg-white p-4 rounded-xl border border-border space-y-3 shadow-2xs">
        {/* Source Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="font-semibold text-muted mr-1">Filter by Service:</span>
          <button
            type="button"
            onClick={() => setSelectedSource("ALL")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              selectedSource === "ALL"
                ? "bg-heading text-white shadow-2xs"
                : "bg-gray-100 text-body hover:bg-gray-200"
            }`}
          >
            All Services
          </button>
          {Object.values(ServiceSlug).map((slug) => {
            const cfg = SERVICE_CONFIG[slug];
            const isSelected = selectedSource === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setSelectedSource(slug)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all"
                style={{
                  backgroundColor: isSelected ? cfg.color : cfg.tintBg,
                  color: isSelected ? "#ffffff" : cfg.darkColor,
                  boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.15)" : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? "#ffffff" : cfg.color }}
                />
                <span>{cfg.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Action Type & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted overflow-x-auto w-full sm:w-auto">
            <span>Action Type:</span>
            {["ALL", "sale", "booking", "payment", "stock", "visit", "system"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-active text-white"
                    : "hover:bg-gray-100 text-body"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actors, records, actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded border border-border bg-white text-xs text-heading placeholder:text-muted focus:outline-none focus:border-active"
            />
          </div>
        </div>
      </div>

      {/* Chronological Timeline List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-2xs divide-y divide-border">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const cfg = SERVICE_CONFIG[item.source];

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/70 transition-colors border-l-4"
                style={{ borderLeftColor: cfg?.color || "#4F46E5" }}
              >
                {/* Time Badge */}
                <div className="text-right shrink-0 w-20 hidden sm:block">
                  <span className="text-xs font-bold text-heading block">{item.time}</span>
                  <span className="text-[10px] text-muted block">{item.timestamp}</span>
                </div>

                {/* Source Badge */}
                <SourceBadge source={item.source} size="sm" className="shrink-0 mt-0.5" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs text-body leading-relaxed">
                      <span className="font-bold text-heading">{item.actor}</span>{" "}
                      <span>{item.action}</span>
                    </p>

                    {item.amountKobo && (
                      <span className="text-xs font-extrabold text-heading shrink-0">
                        {formatCurrency(item.amountKobo)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center flex-wrap gap-4 mt-2 text-[11px] text-muted">
                    <Link
                      href={item.recordHref}
                      className="inline-flex items-center gap-1 font-semibold text-active hover:underline"
                    >
                      <span>{item.recordTitle}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    {item.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted" />
                        <span>{item.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-muted">
            No activity matches the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
