"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  align?: "left" | "right";
}

export function DateRangePicker({
  value = { from: "2026-11-04", to: "2026-11-18" },
  onChange,
  className,
  align = "right",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRange, setCurrentRange] = useState<DateRange>(value);

  // Format label for display
  const formatDateLabel = (dStr: string) => {
    try {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    } catch {}
    return dStr;
  };

  const handlePreset = (preset: "today" | "7d" | "30d" | "month") => {
    const today = new Date(2026, 10, 18); // Default demo baseline: Nov 18, 2026
    const formatD = (d: Date) => d.toISOString().split("T")[0];

    let fromD = new Date(today);
    if (preset === "today") {
      fromD = today;
    } else if (preset === "7d") {
      fromD.setDate(today.getDate() - 7);
    } else if (preset === "30d") {
      fromD.setDate(today.getDate() - 30);
    } else if (preset === "month") {
      fromD = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const newRange = { from: formatD(fromD), to: formatD(today) };
    setCurrentRange(newRange);
    onChange?.(newRange);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-heading hover:bg-gray-50 transition-colors shadow-2xs select-none"
      >
        <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
        <span>
          {formatDateLabel(currentRange.from)} - {formatDateLabel(currentRange.to)}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute z-50 mt-1 w-64 rounded-xl border border-border bg-white p-3 shadow-lg",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="grid grid-cols-2 gap-1.5 mb-3 pb-3 border-b border-border">
              <button
                type="button"
                onClick={() => handlePreset("today")}
                className="text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-heading hover:bg-gray-100 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handlePreset("7d")}
                className="text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-heading hover:bg-gray-100 transition-colors"
              >
                Last 7 days
              </button>
              <button
                type="button"
                onClick={() => handlePreset("30d")}
                className="text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-heading hover:bg-gray-100 transition-colors"
              >
                Last 30 days
              </button>
              <button
                type="button"
                onClick={() => handlePreset("month")}
                className="text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-heading hover:bg-gray-100 transition-colors"
              >
                This month
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={currentRange.from}
                  onChange={(e) => {
                    const newR = { ...currentRange, from: e.target.value };
                    setCurrentRange(newR);
                    onChange?.(newR);
                  }}
                  className="w-full h-8 px-2 text-xs border border-border rounded-md outline-none focus:border-active"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={currentRange.to}
                  onChange={(e) => {
                    const newR = { ...currentRange, to: e.target.value };
                    setCurrentRange(newR);
                    onChange?.(newR);
                  }}
                  className="w-full h-8 px-2 text-xs border border-border rounded-md outline-none focus:border-active"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
