"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SceneHeroCenterpiece() {
  return (
    <div className="relative w-full max-w-[440px] mx-auto select-none">
      {/* Subtle blue ambient glow behind the collage */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"
      />

      {/* Asymmetric 4-panel segmented editorial collage (Image 3 style on crisp white) */}
      <div className="relative grid grid-cols-12 gap-3 items-stretch">
        {/* Left Tall Rounded Panel */}
        <div className="col-span-5 flex flex-col justify-center pt-10 pb-4">
          <div className="relative h-[260px] sm:h-[290px] rounded-[26px] overflow-hidden border border-slate-200 bg-slate-100 shadow-xl group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80"
              alt="Zino One software engineering collaboration"
              className="w-full h-full object-cover grayscale contrast-115 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-blue-950/15 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold shadow-sm">
                6+ PLATFORMS
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Stacked Horizontal Rounded Slices */}
        <div className="col-span-7 flex flex-col gap-3">
          {/* Top Slice */}
          <div className="relative h-[106px] sm:h-[118px] rounded-[24px] overflow-hidden border border-slate-200 bg-slate-100 shadow-lg group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80"
              alt="Modern digital workspace architecture"
              className="w-full h-full object-cover grayscale contrast-115 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-blue-950/15" />
          </div>

          {/* Middle Slice */}
          <div className="relative h-[106px] sm:h-[118px] rounded-[24px] overflow-hidden border border-blue-400/60 bg-slate-100 shadow-lg group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=700&auto=format&fit=crop&q=80"
              alt="Software systems engineering team"
              className="w-full h-full object-cover grayscale contrast-115 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
          </div>

          {/* Bottom Slice */}
          <div className="relative h-[106px] sm:h-[118px] rounded-[24px] overflow-hidden border border-slate-200 bg-slate-100 shadow-lg group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&auto=format&fit=crop&q=80"
              alt="Enterprise operations and product delivery"
              className="w-full h-full object-cover grayscale contrast-115 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-[10px] font-mono text-white font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>162 ROUTES · 99.9% UPTIME</span>
            </div>
          </div>
        </div>

        {/* Bottom-Left Floating Circular Stamp Badge */}
        <Link
          href="#projects"
          aria-label="Explore Zino One platforms"
          className="absolute -bottom-3 -left-3 sm:-left-5 z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 hover:bg-blue-700 border-4 border-white shadow-xl flex flex-col items-center justify-center text-white transition-transform hover:scale-105 group"
        >
          <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-blue-100">
            ZINO ONE
          </span>
          <span className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center my-0.5 shadow-sm group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </span>
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-blue-100">
            EXPLORE
          </span>
        </Link>

        {/* Bottom-Right Electric Blue Sparkle Accents */}
        <div
          aria-hidden="true"
          className="absolute -bottom-4 -right-2 sm:-right-4 z-10 pointer-events-none flex items-end gap-1"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-500 drop-shadow-[0_0_6px_rgba(37,99,235,0.45)] -mb-1"
          >
            <path
              d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"
              fill="currentColor"
            />
          </svg>
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]"
          >
            <path
              d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
