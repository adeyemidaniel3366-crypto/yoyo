import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ name = "User", src, size = "md", className }: AvatarProps) {
  // Extract initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  // Pick deterministic background color based on name
  const colors = [
    "bg-indigo-600 text-white",
    "bg-emerald-600 text-white",
    "bg-blue-600 text-white",
    "bg-purple-600 text-white",
    "bg-rose-600 text-white",
    "bg-amber-600 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden select-none border border-black/5",
        size === "sm" && "w-7 h-7 text-xs",
        size === "md" && "w-9 h-9 text-xs",
        size === "lg" && "w-11 h-11 text-sm",
        size === "xl" && "w-16 h-16 text-lg",
        color,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
