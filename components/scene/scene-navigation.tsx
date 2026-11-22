"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Command, Menu, X, ArrowUpRight } from "lucide-react";

interface SceneNavigationProps {
  onOpenCommandPalette: () => void;
}

export function SceneNavigation({
  onOpenCommandPalette,
}: SceneNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Platforms", href: "#platforms" },
  ];

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-blue-600 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Clean White Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 px-4 sm:px-8 py-3.5 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden group-hover:scale-105 transition-all">
              <Image
                src="/logos/zino-logo.png"
                alt="zino one logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-black block leading-none">
                zino one
              </span>
              <span className="text-[11px] font-mono text-blue-600 block mt-0.5">
                Zino company
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-mono font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions: Search & Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 hover:text-black transition-all cursor-pointer"
              title="Search projects & shortcuts (Ctrl+K / Cmd+K)"
            >
              <Command className="w-3 h-3 text-blue-600" />
              <span>Search</span>
              <kbd className="text-[10px] bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold tracking-wide transition-all shadow-sm"
            >
              <span>Sign In</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-black"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-3 font-mono text-sm">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-black hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white"
              >
                <span>Command Search</span>
                <span>⌘K</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
