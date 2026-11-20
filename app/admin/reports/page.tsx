"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Building2,
  HardHat,
  Cpu,
  Smartphone,
  UserCheck,
  ArrowRight,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

export default function ReportsHubPage() {
  const reports = [
    { title: "Consolidated Group P&L", description: "Consolidated profit, loss, overheads, and EBITDA across all 6 business lines.", href: "/admin/reports/consolidated", icon: Layers, color: "#4F46E5" },
    { title: "Device Galaxy E-Commerce Sales", description: "Online cart conversions, average order value (AOV), and Lagos delivery performance.", href: "/admin/galaxy", icon: Smartphone, color: "#3B82F6" },
    { title: "Zino Spark POS & Margin Report", description: "Counter sales books, gross margins, Computer Village fast-moving models.", href: "/admin/spark/reports", icon: Cpu, color: "#2563EB" },
    { title: "Zino Apartments RevPAR & Occupancy", description: "Hospitality occupancy rate, Average Daily Rate (ADR), room revenue breakdown.", href: "/admin/apartments/reports", icon: Building2, color: "#1E3A5F" },
    { title: "Top Builders Daily Sales Book", description: "Cement bags dispatched, reinforcement steel rods, debtor balances and collections.", href: "/admin/builders/sales", icon: HardHat, color: "#F59E0B" },
    { title: "Billstacks Tax & VAT Return", description: "7.5% Federal VAT returns, 5% withholding tax schedule for FIRS and state LIRS.", href: "/admin/billstacks/tax", icon: Receipt, color: "#10B981" },
    { title: "Premises Visitor Foot Traffic", description: "Visitor check-ins, VIP pre-registration statistics, and employee attendance metrics.", href: "/admin/visitors/reports", icon: UserCheck, color: "#7C3AED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted hover:text-active flex items-center gap-1">
              Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-heading">Analytics &amp; Financial Reports Hub</h1>
          <p className="text-xs text-muted mt-0.5">
            Access cross-subsidiary financial statements, operational performance dashboards, and tax audit logs.
          </p>
        </div>

        <Link
          href="/admin/reports/consolidated"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-active text-white text-xs font-bold shadow-sm"
        >
          <Layers className="w-4 h-4" />
          <span>Consolidated P&amp;L Statement →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.title}
              href={r.href}
              className="bg-white rounded-2xl border border-border p-6 shadow-2xs hover:shadow-lg hover:border-active/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${r.color}15`, color: r.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-heading text-base group-hover:text-active transition-colors">
                  {r.title}
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-active">
                <span>Open Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
