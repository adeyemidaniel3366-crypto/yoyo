import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceBadge } from "./source-badge";
import { ServiceSlug } from "@/lib/constants";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string; // e.g. text-blue-600 or hex
  iconBg?: string; // e.g. bg-blue-50 or hex
  delta?: {
    value: number; // e.g. 5.2%
    isPositive: boolean;
    period?: string; // e.g. "vs yesterday"
  };
  source?: ServiceSlug;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "#4F46E5",
  iconBg = "#EEF2FF",
  delta,
  source,
  subtitle,
  onClick,
  className,
}: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-all duration-200 flex items-start gap-4 text-gray-900",
        isClickable && "hover:shadow-md hover:border-gray-300 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-active/20",
        className
      )}
    >
      {/* Icon tile (48px, rounded-10px) */}
      <div
        className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
        style={{
          backgroundColor: iconBg.startsWith("#") ? iconBg : undefined,
          color: iconColor.startsWith("#") ? iconColor : undefined,
        }}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[13px] font-medium text-gray-500 truncate">{title}</p>
          {source && <SourceBadge source={source} size="sm" />}
        </div>

        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight tabular-nums truncate" title={String(value)}>
          {value}
        </h3>

        {/* Delta or subtitle */}
        <div className="mt-1 flex items-center gap-2">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                delta.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {delta.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{delta.isPositive ? "+" : ""}{delta.value}%</span>
              {delta.period && (
                <span className="text-gray-400 font-normal ml-0.5">{delta.period}</span>
              )}
            </span>
          )}

          {subtitle && !delta && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
