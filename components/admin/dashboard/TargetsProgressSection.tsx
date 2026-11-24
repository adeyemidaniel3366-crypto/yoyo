"use client";

import React from "react";
import { Target, Pencil } from "lucide-react";
import { UnifiedMonthlyTargets } from "@/lib/platform-store";

function TargetBar({
  label,
  current,
  target,
  unit = "",
  color = "#4F46E5",
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-900">{label}</span>
        <span className="text-gray-500">
          <strong className="text-gray-900">
            {unit}
            {current.toLocaleString()}
          </strong>{" "}
          / {unit}
          {target.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function TargetsProgressSection({
  targets,
  totalRevenueKobo,
  totalExpenseKobo,
  bookingsCount,
  visitorsCount,
  onEditClick,
}: {
  targets: UnifiedMonthlyTargets;
  totalRevenueKobo: number;
  totalExpenseKobo: number;
  bookingsCount: number;
  visitorsCount: number;
  onEditClick: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 pb-3 mb-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-active" />
          <h3 className="text-base font-semibold text-gray-900">
            Monthly Targets vs Live Actuals
          </h3>
        </div>
        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3 h-3 text-active" />
          <span>Edit Targets</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TargetBar
          label="Sales & Revenue Target"
          current={Math.round(totalRevenueKobo / 100)}
          target={Math.round(targets.salesTargetKobo / 100)}
          unit="₦"
          color="#4F46E5"
        />
        <TargetBar
          label="Expense Budget Utilization"
          current={Math.round(totalExpenseKobo / 100)}
          target={Math.round(targets.expenseBudgetKobo / 100)}
          unit="₦"
          color="#E74C3C"
        />
        <TargetBar
          label="Apartment Bookings Target"
          current={bookingsCount}
          target={targets.bookingsTarget}
          unit=""
          color="#1E3A5F"
        />
        <TargetBar
          label="Visitor Check-In Target"
          current={visitorsCount}
          target={targets.visitorsTarget}
          unit=""
          color="#7C3AED"
        />
      </div>
    </div>
  );
}
