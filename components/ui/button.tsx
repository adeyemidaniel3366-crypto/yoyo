import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          // Variants
          variant === "primary" &&
            "bg-active text-white hover:bg-indigo-700 focus-visible:ring-active shadow-sm",
          variant === "secondary" &&
            "bg-white border border-border text-heading hover:bg-gray-50 focus-visible:ring-gray-200 shadow-sm",
          variant === "outline" &&
            "border border-border text-heading bg-transparent hover:bg-gray-100 focus-visible:ring-gray-200",
          variant === "danger" &&
            "bg-rose-600 text-white hover:bg-rose-700 focus-rose-500 shadow-sm",
          variant === "success" &&
            "bg-emerald-600 text-white hover:bg-emerald-700 focus-emerald-500 shadow-sm",
          variant === "ghost" &&
            "bg-transparent text-heading hover:bg-gray-100 focus-visible:ring-gray-200",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs gap-1.5",
          size === "md" && "h-10 px-4 text-sm gap-2",
          size === "lg" && "h-12 px-6 text-base gap-2.5",
          size === "icon" && "h-10 w-10 p-0",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
