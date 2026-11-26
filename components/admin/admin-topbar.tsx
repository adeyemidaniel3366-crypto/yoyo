"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Globe,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
  Settings as SettingsIcon,
  Clock,
  Compass,
  BookOpen,
  Filter,
  X,
  CheckCircle2,
  Layers,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceSlug, SERVICE_CONFIG, LOCATIONS } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";

interface AdminTopbarProps {
  onToggleMobileSidebar: () => void;
  selectedService?: ServiceSlug | "ALL";
  onSelectService?: (service: ServiceSlug | "ALL") => void;
  selectedLocation?: string;
  onSelectLocation?: (locationId: string) => void;
  bookingRequestsCount?: number;
  userName?: string;
  userRole?: string;
}

export function AdminTopbar({
  onToggleMobileSidebar,
  selectedService = "ALL",
  onSelectService,
  selectedLocation = "ALL",
  onSelectLocation,
  bookingRequestsCount = 0,
  userName = "Admin",
  userRole = "Super Admin",
}: AdminTopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockFeedback, setClockFeedback] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  React.useEffect(() => {
    // Check notifications
    fetch("/api/notifications?perPage=10")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && Array.isArray(res.data)) {
          const unread = res.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, []);

  const handleClockToggle = async () => {
    setClockLoading(true);
    setClockFeedback(null);
    try {
      const endpoint = isClockedIn
        ? "/api/visitors/attendance/clock-out"
        : "/api/visitors/attendance/clock-in";
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setIsClockedIn(!isClockedIn);
        setClockFeedback(isClockedIn ? "Clocked out successfully." : "Clocked in successfully.");
      } else {
        if (typeof document !== "undefined" && document.cookie.includes("demo-offline-session")) {
          setIsClockedIn(!isClockedIn);
          setClockFeedback(isClockedIn ? "Demo Clock-out recorded." : "Demo Clock-in recorded.");
        } else {
          setClockFeedback(data?.error?.message || "Attendance request failed on server.");
        }
      }
    } catch {
      if (typeof document !== "undefined" && document.cookie.includes("demo-offline-session")) {
        setIsClockedIn(!isClockedIn);
        setClockFeedback(isClockedIn ? "Demo Clock-out recorded." : "Demo Clock-in recorded.");
      } else {
        setClockFeedback("Network error: Could not reach attendance server.");
      }
    } finally {
      setClockLoading(false);
      setTimeout(() => setClockFeedback(null), 4000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "authjs.session-token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "__Secure-authjs.session-token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 min-h-16 bg-topbar text-white border-b border-[#242442] flex items-center justify-between gap-2 px-3 sm:px-6 shadow-sm">
      {/* Left side: Hamburger + Global Search */}
      <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin" className="lg:hidden flex items-center shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden shadow-xs">
            <Image
              src="/logos/zino-logo.png"
              alt="Zino One Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-[#14142B] border border-[#2B2B4D] text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-active focus:ring-1 focus:ring-active transition-all"
          />
        </form>
      </div>

      {/* Center: Tour, Guide, Location/Service dropdown, Booking Requests */}
      <div className="hidden xl:flex items-center gap-2.5">
        {/* Tour button */}
        <button
          type="button"
          onClick={() => setShowTourModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-600 bg-transparent text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Tour</span>
        </button>

        {/* Guide button */}
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-active text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>

        {/* Service / Location Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2F2F52] bg-[#14142B] text-xs font-semibold text-gray-200 hover:text-white transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-active" />
            <span className="truncate max-w-[180px]">
              {selectedService === "ALL" ? "All Services" : SERVICE_CONFIG[selectedService]?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showLocationDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLocationDropdown(false)} />
              <div className="absolute right-0 mt-1 z-50 w-64 bg-[#1A1A2E] text-white border border-[#2E2E50] rounded-xl shadow-2xl p-2 text-xs">
                <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Filter by Service
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectService?.("ALL");
                    setShowLocationDropdown(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors",
                    selectedService === "ALL" ? "bg-active text-white font-semibold" : "text-gray-300"
                  )}
                >
                  All Services (Unified)
                </button>
                {Object.values(ServiceSlug).map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => {
                      onSelectService?.(slug);
                      setShowLocationDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2",
                      selectedService === slug ? "bg-active text-white font-semibold" : "text-gray-300"
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[slug].color }}
                    />
                    <span>{SERVICE_CONFIG[slug].name}</span>
                  </button>
                ))}

                <div className="border-t border-[#2E2E50] my-2" />
                <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Filter by Location
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectLocation?.("ALL");
                    setShowLocationDropdown(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors",
                    selectedLocation === "ALL" ? "bg-active text-white font-semibold" : "text-gray-300"
                  )}
                >
                  All Locations
                </button>
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation?.(loc.id);
                      setShowLocationDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors truncate",
                      selectedLocation === loc.id ? "bg-active text-white font-semibold" : "text-gray-300"
                    )}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booking Requests button with badge count */}
        <Link
          href="/admin/apartments/bookings?status=requested"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors shadow-sm"
        >
          <span>Booking Requests</span>
          <span className="w-5 h-5 rounded-full bg-white text-rose-700 text-[11px] flex items-center justify-center font-extrabold">
            {bookingRequestsCount}
          </span>
        </Link>
      </div>

      {/* Right side: Clock In/Out, Notifications, User profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Clock In / Out button (Staff attendance) */}
        <button
          type="button"
          disabled={clockLoading}
          onClick={handleClockToggle}
          className={cn(
            "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50",
            isClockedIn
              ? "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/30"
              : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{clockLoading ? "Updating..." : isClockedIn ? "Checkout" : "Clock In"}</span>
        </button>

        {/* Notifications Bell */}
        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-topbar">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Language selector */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-300 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="font-medium">English</span>
        </div>

        {/* User Avatar + Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Avatar name={userName} size="sm" />
            <div className="hidden md:block text-left text-xs">
              <span className="font-semibold text-white block leading-tight">{userName}</span>
              <span className="text-[10px] text-gray-400 block leading-none">{userRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
              <div className="absolute right-0 mt-2 z-50 w-52 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-xl p-1.5 text-xs">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="font-bold text-gray-900">{userName}</p>
                  <p className="text-gray-500 text-[11px] truncate">{userRole}</p>
                </div>
                <Link
                  href="/admin/users/staff"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-800"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-800"
                >
                  <SettingsIcon className="w-4 h-4 text-gray-500" />
                  <span>Platform Settings</span>
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Clock Feedback Toast */}
      {clockFeedback && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-indigo-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{clockFeedback}</span>
        </div>
      )}

      {/* Tour Walkthrough Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-gray-900 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-active" />
                <h3 className="font-extrabold text-base text-gray-900">Zino One Platform Tour</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-950">
                <p className="font-bold text-active mb-0.5">1. Unified Multi-Service Workspace</p>
                <p>All 6 businesses (Spark POS, Apartments, Builders, Galaxy, Billstacks, Visitors) stream transactions directly to this single command center.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900">
                <p className="font-bold text-gray-900 mb-0.5">2. Central Products &amp; Invoices</p>
                <p>Manage catalog items, pricing, images via drag-and-drop, and track consolidated cash flow with export to CSV, Excel, PDF, and Print.</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950">
                <p className="font-bold text-emerald-700 mb-0.5">3. Live Staff &amp; Attendance</p>
                <p>Clock in/out directly from the top bar to log reception attendance and security passes in real time.</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="px-4 py-2 rounded-xl bg-active text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Operational Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-gray-900 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-active" />
                <h3 className="font-extrabold text-base text-gray-900">Zino One Operational Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 font-mono font-bold text-[10px] text-gray-800">Ctrl+K</span>
                <p className="text-gray-700">Global Search palette for instant navigation across products, invoices, and service pages.</p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 font-mono font-bold text-[10px] text-gray-800">Filter</span>
                <p className="text-gray-700">Use the topbar Scope dropdown to narrow dashboard views by service branch or physical depot.</p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 font-mono font-bold text-[10px] text-gray-800">Exports</span>
                <p className="text-gray-700">Any activity or financial table can be exported directly to CSV, Excel, PDF, or Print.</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
