import React from "react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source?: ServiceSlug | string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showDot?: boolean;
}

export function SourceBadge({
  source,
  size = "md",
  className,
  showDot = true,
}: SourceBadgeProps) {
  // If no source is provided or source is null, render the "Shared" badge
  if (!source) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-700 select-none dark:bg-gray-800 dark:text-gray-300",
          size === "sm" && "text-[11px] px-2 py-0.5",
          size === "md" && "text-xs px-2.5 py-1",
          size === "lg" && "text-sm px-3 py-1.5",
          className
        )}
      >
        {showDot && <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 shrink-0" />}
        <span>Shared</span>
      </span>
    );
  }

  const slug = source as ServiceSlug;
  const config = SERVICE_CONFIG[slug] || {
    name: source,
    shortName: source,
    color: "#6B7280",
    tintBg: "#F3F4F6",
    darkColor: "#374151",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full select-none shrink-0 tracking-tight",
        size === "sm" && "text-[11px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        size === "lg" && "text-sm px-3.5 py-1.5",
        "dark:text-gray-200",
        className
      )}
      style={{
        backgroundColor: config.tintBg,
        color: config.darkColor,
      }}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
      )}
      <span>{config.shortName}</span>
    </span>
  );
}
