import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5 dark:text-gray-100"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-10 px-3.5 rounded-lg border bg-white/90 text-sm text-heading placeholder:text-muted/60 transition-colors outline-none",
            "border-border dark:border-gray-600 hover:border-gray-400 focus:border-active focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-300",
            props.disabled && "bg-gray-50 text-muted cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium dark:text-rose-400">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-muted dark:text-gray-300">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
