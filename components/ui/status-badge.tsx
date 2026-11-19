import React from "react";
import { getStatusColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  className,
  showDot = true,
}: StatusBadgeProps) {
  const color = getStatusColor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full select-none",
        color.bg,
        color.text,
        size === "sm" && "text-[11px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-0.5",
        "dark:text-gray-200",
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.dot, "dark:bg-gray-300")} />
      )}
      <span>{color.label || status}</span>
    </span>
  );
}
