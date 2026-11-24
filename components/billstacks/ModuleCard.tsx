"use client";

import React from "react";
import {
  Package,
  Calculator,
  Users,
  Gift,
  FileText,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { BillstacksModule } from "@/lib/billstacks-modules";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  module: BillstacksModule;
  onSelect?: (moduleId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Package: Package,
  Calculator: Calculator,
  Users: Users,
  Gift: Gift,
  FileText: FileText,
  RotateCcw: RotateCcw,
  ShieldCheck: ShieldCheck,
};

export function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const IconComponent = ICON_MAP[module.icon] || Package;
  const isCore = module.category === "core";
  const isAddon = module.category === "addon";
  const isPremium = module.category === "premium";

  return (
    <div
      onClick={() => onSelect?.(module.id)}
      className={cn(
        "bg-white rounded-2xl p-6 border transition-all hover:shadow-lg cursor-pointer group flex flex-col justify-between",
        isCore && "border-emerald-200 hover:border-emerald-400",
        isAddon && "border-blue-200 hover:border-blue-400",
        isPremium && "border-purple-200 hover:border-purple-400"
      )}
    >
      <div>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
              isCore && "bg-emerald-100 text-emerald-600",
              isAddon && "bg-blue-100 text-blue-600",
              isPremium && "bg-purple-100 text-purple-600"
            )}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-base truncate">{module.name}</h3>
              {module.isPopular && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase shrink-0">
                  Popular
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{module.description}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
          {module.features.slice(0, 4).map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{feature}</span>
            </li>
          ))}
          {module.features.length > 4 && (
            <li className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px] pt-1">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>+{module.features.length - 4} more features</span>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
            isCore && "bg-emerald-100 text-emerald-700",
            isAddon && "bg-blue-100 text-blue-700",
            isPremium && "bg-purple-100 text-purple-700"
          )}
        >
          {module.category}
        </span>
        <span className="text-[11px] font-semibold text-gray-400 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
          Open in App →
        </span>
      </div>
    </div>
  );
}
