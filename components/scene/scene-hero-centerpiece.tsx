"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Layers, Cpu, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function SceneHeroCenterpiece() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto aspect-square rounded-3xl p-8 bg-white/70 backdrop-blur-md border border-[#12110E]/10 shadow-lg shadow-black/5 flex flex-col justify-between transition-transform duration-300 ease-out select-none group"
      style={{
        transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
      }}
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCEFC3] border border-[#12110E]/10 text-xs font-mono font-bold text-[#12110E]">
          <span className="w-2 h-2 rounded-full bg-[#00CEC8] animate-pulse" />
          <span>zino one // CORE</span>
        </div>
        <span className="text-xs font-mono text-[#12110E]/50">LAGOS • ACTIVE</span>
      </div>

      {/* Central Visual: Kinetic Orbital Rings & Core */}
      <div className="relative flex items-center justify-center my-auto py-8">
        {/* Outer Ring - Turquoise */}
        <div
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#00CEC8]/30 animate-spin"
          style={{ animationDuration: "35s" }}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00CEC8] shadow-[0_0_12px_#00CEC8]" />
        </div>

        {/* Middle Ring - Peach */}
        <div
          className="absolute w-48 h-48 sm:w-52 sm:h-52 rounded-full border border-[#FF9C5F]/40 animate-spin"
          style={{ animationDuration: "25s", animationDirection: "reverse" }}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FF9C5F] shadow-[0_0_10px_#FF9C5F]" />
        </div>

        {/* Inner Ring - Orange-Red */}
        <div
          className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-dashed border-[#EB4203]/40 animate-spin"
          style={{ animationDuration: "18s" }}
        >
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#EB4203]" />
        </div>

        {/* Pulsing Core */}
        <Link
          href="#projects"
          className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00CEC8] via-[#FF9C5F] to-[#EB4203] p-[2.5px] shadow-xl hover:scale-105 transition-transform duration-300 group/core"
        >
          <div className="w-full h-full rounded-2xl bg-white p-2.5 flex items-center justify-center overflow-hidden">
            <Image
              src="/logos/zino-logo.png"
              alt="zino one core logo"
              width={70}
              height={70}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Bottom Metrics Pill Array */}
      <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-[#12110E]/10 font-mono">
        <div className="p-2 rounded-xl bg-[#FCEFC3]/80 border border-[#12110E]/5">
          <p className="text-xs font-black text-[#12110E]">6+</p>
          <p className="text-[10px] text-[#12110E]/60 uppercase">Platforms</p>
        </div>
        <div className="p-2 rounded-xl bg-[#FCEFC3]/80 border border-[#12110E]/5">
          <p className="text-xs font-black text-[#EB4203]">162</p>
          <p className="text-[10px] text-[#12110E]/60 uppercase">Routes</p>
        </div>
        <div className="p-2 rounded-xl bg-[#FCEFC3]/80 border border-[#12110E]/5">
          <p className="text-xs font-black text-[#00CEC8]">99.9%</p>
          <p className="text-[10px] text-[#12110E]/60 uppercase">Uptime</p>
        </div>
      </div>
    </div>
  );
}
