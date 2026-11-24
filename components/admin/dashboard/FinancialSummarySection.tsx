"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

function FinancialCard({
  title,
  value,
  delta,
  isPositive,
  accentColor,
  subtitle,
}: {
  title: string;
  value: string;
  delta?: number;
  isPositive?: boolean;
  accentColor: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex min-w-0">
      <div className="w-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 p-5 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-gray-900 truncate">{value}</p>
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs font-semibold",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {delta >= 0 ? "+" : ""}
              {delta}% vs prev period
            </span>
          </div>
        )}
        {subtitle && <p className="text-[11px] text-gray-500 mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}

export function FinancialSummarySection({
  totalRevenueKobo,
  totalExpenseKobo,
  netProfitKobo,
  activeServiceScope,
  formatMoney,
}: {
  totalRevenueKobo: number;
  totalExpenseKobo: number;
  netProfitKobo: number;
  activeServiceScope: ServiceSlug | "ALL";
  formatMoney: (kobo: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FinancialCard
        title="Revenue Today"
        value={formatMoney(totalRevenueKobo)}
        delta={18.4}
        isPositive={true}
        accentColor="#28A745"
        subtitle={
          activeServiceScope === "ALL"
            ? "All 6 services combined"
            : `${SERVICE_CONFIG[activeServiceScope].name} revenue`
        }
      />
      <FinancialCard
        title="Total Expenses Today"
        value={formatMoney(totalExpenseKobo)}
        delta={-5.2}
        isPositive={true}
        accentColor="#E74C3C"
        subtitle="Ops, payroll, restocks & purchases"
      />
      <FinancialCard
        title="Net Profit This Month"
        value={formatMoney(netProfitKobo)}
        delta={22.1}
        isPositive={true}
        accentColor="#4F46E5"
        subtitle="Revenue minus all recorded expenses"
      />
    </div>
  );
}
