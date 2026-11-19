"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string; // e.g. "480px"
  footer?: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = "480px",
  footer,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-end",
        "dark:bg-black/40"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in",
          "dark:bg-black/40",
          "cursor-pointer"
        )}
        onClick={onClose}
        aria-label="Close drawer"
      />

      {/* Slide-out drawer */}
      <div
        className={cn(
          "relative bg-white h-full shadow-2xl z-10 flex flex-col border-l border-border",
          "w-full sm:max-w-md lg:max-w-[480px] dark:bg-gray-800 dark:border-gray-700 animate-slide-left"
        )}
        style={{ width: width && window.innerWidth >= 640 ? width: undefined }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-base font-bold text-heading">{title}</h3>
            {description && (
              <p className="text-xs text-muted mt-0.5 dark:text-gray-300">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-gray-100 transition-colors dark:hover:bg-gray-700/30"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 dark:text-gray-200">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
