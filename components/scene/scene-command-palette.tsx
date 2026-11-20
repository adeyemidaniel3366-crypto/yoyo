"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  ExternalLink,
  User,
  Layers,
  Globe,
  Terminal,
  ShoppingBag,
  Building2,
  HardHat,
  Receipt,
  UserCheck,
  X,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { SCENE_ONE_PROFILE } from "@/lib/scene-data";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SceneCommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigationItems = [
    { id: "space-about", label: "About Zino company", category: "Navigation", href: "#about", icon: User },
    { id: "space-projects", label: "Explore Projects & Software", category: "Navigation", href: "#projects", icon: Layers },
    { id: "space-platforms", label: "Digital Platforms & Websites", category: "Navigation", href: "#platforms", icon: Globe },
    { id: "action-copy-email", label: "Copy Email (adeyemiZino3366@gmail.com)", category: "Quick Action", href: "action:copy-email", icon: Mail },
    { id: "app-admin", label: "Zino One Unified Operations Core", category: "Live Applications", href: "/admin", icon: Terminal },
    { id: "app-shop", label: "Device Galaxy Electronics E-Commerce", category: "Live Applications", href: "/shop", icon: ShoppingBag },
    { id: "app-apartments", label: "Zino Luxury Apartments Hotel PMS", category: "Live Applications", href: "/apartments", icon: Building2 },
    { id: "app-builders", label: "Top Builders Materials Dispatch", category: "Live Applications", href: "/builders", icon: HardHat },
    { id: "app-billstacks", label: "Billstacks Cloud Invoicing Workspace", category: "Live Applications", href: "/billstacks", icon: Receipt },
    { id: "app-visit", label: "Security & Visitor Check-In Kiosk", category: "Live Applications", href: "/visit", icon: UserCheck },
    { id: "ext-neadston", label: "Neadston Limited Partner Portal", category: "External Websites", href: "https://sales.neadstonltd.com/", isExternal: true, icon: ExternalLink },
    { id: "ext-estoworld", label: "Esto World Sales Ecosystem", category: "External Websites", href: "https://sales.estoworld.com/login", isExternal: true, icon: ExternalLink },
    { id: "ext-github", label: "GitHub Profile & Repositories", category: "External Websites", href: "https://github.com/adeyemiZino3366-crypto", isExternal: true, icon: ExternalLink },
  ];

  const filtered = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: (typeof navigationItems)[0]) => {
    if (item.href === "action:copy-email") {
      navigator.clipboard.writeText(SCENE_ONE_PROFILE.email);
      setCopiedEmail(true);
      setTimeout(() => {
        setCopiedEmail(false);
        onClose();
      }, 1200);
      return;
    }

    onClose();
    if (item.isExternal) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else if (item.href.startsWith("#")) {
      const el = document.getElementById(item.href.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(item.href);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
        } else if (e.key === "Enter" && filtered[selectedIndex]) {
          e.preventDefault();
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[#12110E]/15 bg-[#FFFDF5] text-[#12110E] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#12110E]/10 bg-white">
          <Search className="w-5 h-5 text-[#EB4203]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, apps, platforms, or actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm font-medium text-[#12110E] placeholder:text-[#12110E]/40 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCEFC3] text-[#12110E]/70 border border-[#12110E]/10">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#12110E]/60 hover:text-[#12110E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#12110E]/60">
              No matching destinations found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-medium ${
                    isSelected
                      ? "bg-[#00CEC8]/15 text-[#12110E] font-semibold translate-x-1"
                      : "hover:bg-[#FCEFC3]/60 text-[#12110E]/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#00CEC8] text-[#12110E]"
                          : "bg-white border border-[#12110E]/10 text-[#12110E]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#12110E]">{item.label}</p>
                      <p className="text-[10px] text-[#12110E]/50 font-mono uppercase">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.href === "action:copy-email" && copiedEmail ? (
                      <span className="text-[11px] font-bold text-[#00CEC8] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    ) : item.isExternal ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF9C5F]/20 text-[#12110E] border border-[#FF9C5F]/40">
                        External ↗
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-[#12110E]/40" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#12110E]/10 bg-white flex items-center justify-between text-[11px] font-mono text-[#12110E]/60">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span className="text-[#EB4203] font-semibold">zino one Navigation</span>
        </div>
      </div>
    </div>
  );
}
