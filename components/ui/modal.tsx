"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
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
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "dark:bg-black/80"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          "dark:bg-black/80",
          "cursor-pointer"
        )}
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Dialog box */}
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-xl border border-border w-full z-10 overflow-hidden flex flex-col max-h-[90vh]",
          "dark:bg-gray-800",
          size === "sm" && "max-w-md dark:border-gray-700",
          size === "md" && "max-w-lg dark:border-gray-700",
          size === "lg" && "max-w-2xl dark:border-gray-700",
          size === "xl" && "max-w-4xl dark:border-gray-700"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-heading">{title}</h3>
            {description && (
              <p className="text-xs text-muted mt-0.5">{description}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-muted hover:text-heading p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto dark:text-gray-200">{children}</div>
      </div>
    </div>
  );
}
