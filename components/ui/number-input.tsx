"use client";

import React, { forwardRef, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number | string;
  onChange?: (value: number | "") => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  decimalPlaces?: number;
  prefix?: string; // e.g. "₦", "$"
  suffix?: string; // e.g. "/month", " units"
}

/**
 * Formats a numeric string with thousand-separator commas live as the user types.
 * Examples:
 *  "100000"    -> "100,000"
 *  "100000.5"  -> "100,000.5"
 *  "0"         -> "0"
 */
export function formatNumberWithCommas(
  value: string,
  allowNegative = false,
  allowDecimal = false,
  decimalPlaces = 2
): string {
  if (!value) return "";

  // Strip commas and any disallowed characters
  let cleaned = value.replace(/,/g, "").replace(allowDecimal ? /[^0-9.-]/g : /[^0-9-]/g, "");

  // Handle negative sign only at the start
  const isNegative = allowNegative && cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");

  // Handle decimal point (keep only the first one if allowed)
  let integerPart = cleaned;
  let decimalPart = "";
  let hasDecimalPoint = false;

  if (allowDecimal && cleaned.includes(".")) {
    hasDecimalPoint = true;
    const dotIdx = cleaned.indexOf(".");
    integerPart = cleaned.slice(0, dotIdx);
    decimalPart = cleaned.slice(dotIdx + 1).replace(/\./g, "");
    if (decimalPlaces > 0) {
      decimalPart = decimalPart.slice(0, decimalPlaces);
    }
  } else {
    integerPart = cleaned.replace(/\./g, "");
  }

  // Strip redundant leading zeros (e.g., "005" -> "5"), keeping a single "0"
  if (integerPart.length > 1) {
    integerPart = integerPart.replace(/^0+/, "") || "0";
  }

  // Add thousand-separator commas using regex (safe for any length)
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  let result = formattedInt;
  if (hasDecimalPoint) {
    result = (formattedInt || "0") + "." + decimalPart;
  }

  if (isNegative) {
    result = "-" + result;
  }

  return result;
}

/**
 * Helper to format any freeform price/label string while preserving currency symbols or suffixes
 * e.g. "100000" -> "100,000", "₦100000 / night" -> "₦100,000 / night"
 */
export function formatNumbersInText(text: string): string {
  return text.replace(/\d+(?:,\d+)*(?:\.\d+)?/g, (match) => {
    const raw = match.replace(/,/g, "");
    const [intPart, decPart] = raw.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  });
}

function parseFormattedValue(
  formatted: string,
  allowNegative: boolean,
  allowDecimal: boolean
): number | "" {
  if (!formatted || formatted === "-" || formatted === "." || formatted === "-.") return "";

  const cleaned = formatted.replace(/,/g, "");
  const parsed = Number(cleaned);

  if (Number.isNaN(parsed)) return "";
  if (!allowNegative && parsed < 0) return Math.abs(parsed);
  if (!allowDecimal) return Math.trunc(parsed);

  return parsed;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      value,
      onChange,
      placeholder,
      min,
      max,
      step,
      allowNegative = false,
      allowDecimal = false,
      decimalPlaces = 2,
      prefix,
      suffix,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const innerRef = useRef<HTMLInputElement | null>(null);

    const setRefs = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    };

    const getFormattedPropValue = (val: number | string | undefined): string => {
      if (val === undefined || val === null || val === "") return "";
      return formatNumberWithCommas(String(val), allowNegative, allowDecimal, decimalPlaces);
    };

    const [displayValue, setDisplayValue] = useState<string>(() => getFormattedPropValue(value));
    const [isFocused, setIsFocused] = useState(false);

    // Keep displayValue synced when external prop changes
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(getFormattedPropValue(value));
      } else {
        // Even while focused, if external reset happens (e.g. form reset to "" or 0)
        const currentParsed = parseFormattedValue(displayValue, allowNegative, allowDecimal);
        const propParsed =
          value === "" || value === undefined || value === null
            ? ""
            : parseFormattedValue(String(value), allowNegative, allowDecimal);
        if (propParsed === "" && displayValue !== "" && displayValue !== "-") {
          setDisplayValue("");
        } else if (
          propParsed !== "" &&
          currentParsed !== "" &&
          propParsed !== currentParsed &&
          !(allowDecimal && displayValue.endsWith("."))
        ) {
          setDisplayValue(getFormattedPropValue(value));
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, isFocused, allowNegative, allowDecimal, decimalPlaces]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputEl = e.target;
      const rawValue = inputEl.value;
      const selectionStart = inputEl.selectionStart ?? rawValue.length;

      // Count how many non-comma characters were before the cursor
      const charsBeforeCursor = rawValue
        .slice(0, selectionStart)
        .replace(/,/g, "").length;

      const formatted = formatNumberWithCommas(
        rawValue,
        allowNegative,
        allowDecimal,
        decimalPlaces
      );

      setDisplayValue(formatted);

      // Restore cursor position accurately after comma insertion/removal
      requestAnimationFrame(() => {
        if (innerRef.current && document.activeElement === innerRef.current) {
          let nonCommaCount = 0;
          let newPos = formatted.length;
          for (let i = 0; i < formatted.length; i++) {
            if (nonCommaCount >= charsBeforeCursor) {
              newPos = i;
              break;
            }
            if (formatted[i] !== ",") {
              nonCommaCount++;
            }
          }
          if (nonCommaCount < charsBeforeCursor) {
            newPos = formatted.length;
          }
          try {
            innerRef.current.setSelectionRange(newPos, newPos);
          } catch {
            // ignore selection errors on unsupported inputs
          }
        }
      });

      const parsed = parseFormattedValue(formatted, allowNegative, allowDecimal);
      onChange?.(parsed);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (displayValue) {
        const parsed = parseFormattedValue(displayValue, allowNegative, allowDecimal);
        if (parsed !== "" && !Number.isNaN(parsed)) {
          let clamped = parsed;
          if (min !== undefined && clamped < min) clamped = min;
          if (max !== undefined && clamped > max) clamped = max;
          const reformatted = formatNumberWithCommas(
            String(clamped),
            allowNegative,
            allowDecimal,
            decimalPlaces
          );
          setDisplayValue(reformatted);
          if (clamped !== parsed) {
            onChange?.(clamped);
          }
        } else {
          setDisplayValue("");
        }
      }
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

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
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            ref={setRefs}
            type="text"
            inputMode={allowDecimal ? "decimal" : "numeric"}
            autoComplete="off"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-valuemin={min}
            aria-valuemax={max}
            className={cn(
              "w-full h-9 px-3 rounded-lg border bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none tabular-nums",
              "border-gray-200 hover:border-gray-400 focus:border-active focus:ring-2 focus:ring-active/20",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-200",
              disabled && "bg-gray-50 text-gray-400 cursor-not-allowed",
              prefix && "pl-8",
              suffix && "pr-12",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
