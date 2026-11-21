"use client";

import React, { useState } from "react";
import { MoreVertical, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  rightAction,
  className,
}: ChartCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-5 shadow-2xs text-gray-900", className)}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {rightAction}

          {/* Hamburger options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 min-w-[140px] text-xs text-gray-900">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      window.print();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-gray-100 text-gray-900 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" />
                    <span>Print chart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      // Trigger clean browser print dialog for document export
                      if (typeof window !== "undefined") {
                        window.print();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-gray-100 text-gray-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Export / Print PDF</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
