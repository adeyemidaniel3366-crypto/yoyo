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
            className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-10 px-3.5 rounded-lg border bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none",
            "border-gray-200 hover:border-gray-400 focus:border-active focus:ring-2 focus:ring-active/20",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-200",
            props.disabled && "bg-gray-50 text-gray-400 cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
