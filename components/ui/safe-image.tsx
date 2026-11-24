"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackLabel?: string;
  fallbackClassName?: string;
}

/**
 * Resilient Next.js Image wrapper that gracefully falls back to a clean neutral
 * placeholder if an external URL or local upload fails to load.
 */
export function SafeImage({
  src,
  alt,
  className,
  fallbackLabel,
  fallbackClassName,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel || "Image unavailable"}
        className={cn(
          "flex flex-col items-center justify-center bg-slate-100 text-slate-400 select-none",
          fallbackClassName || className
        )}
      >
        <ImageOff className="w-6 h-6 mb-1 opacity-60" />
        {fallbackLabel && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 text-center truncate max-w-full">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      unoptimized
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
