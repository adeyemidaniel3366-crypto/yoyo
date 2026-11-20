"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FCEFC3]/30 flex flex-col items-center justify-between p-6 text-center font-sans">
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#12110E]/15 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/logos/zino-logo.png"
              alt="zino one logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-sm text-[#12110E]">zino one</span>
        </Link>
      </header>

      <main className="max-w-md w-full bg-white rounded-3xl border border-[#12110E]/10 p-8 shadow-xl space-y-6 my-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#12110E] text-white flex items-center justify-center mx-auto shadow-md">
          <Compass className="w-7 h-7 text-[#00CEC8]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#EB4203] uppercase tracking-widest block">
            404 Error
          </span>
          <h1 className="text-2xl font-black text-[#12110E] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-[#12110E]/70 leading-relaxed">
            The page or digital environment you are looking for does not exist or has been relocated within the Zino One ecosystem.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#EB4203] hover:bg-[#EB4203]/90 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Hub</span>
          </Link>
          <Link
            href="/apartments"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12110E] font-semibold text-xs transition-colors"
          >
            <span>Luxury Suites</span>
          </Link>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto py-4 text-xs font-mono text-[#12110E]/40">
        <span>zino one © 2026 Zino company. All rights reserved.</span>
      </footer>
    </div>
  );
}
