"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Bell,
  Receipt,
  HardHat,
  Cpu,
  Building2,
  Smartphone,
  UserCheck,
  Users,
  BarChart3,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceSlug, SERVICE_CONFIG, PLATFORM_NAME } from "@/lib/constants";

interface AdminSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  bookingRequestsCount?: number;
  guestSupportCount?: number;
}

export function AdminSidebar({
  isOpenMobile,
  onCloseMobile,
  bookingRequestsCount = 0,
  guestSupportCount = 1,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Collapsed state for service groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    billstacks: pathname.includes("/admin/billstacks"),
    builders: pathname.includes("/admin/builders"),
    spark: pathname.includes("/admin/spark"),
    apartments: pathname.includes("/admin/apartments"),
    galaxy: pathname.includes("/admin/galaxy"),
    visitors: pathname.includes("/admin/visitors"),
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-sidebar text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#222244]",
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Logo Mark + Wordmark */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#222244] shrink-0">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-active flex items-center justify-center font-black text-white text-base tracking-wider shadow-md">
              Z1
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight block leading-tight">
                {PLATFORM_NAME}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase block">
                Unified Business
              </span>
            </div>
          </Link>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-xs scrollbar-thin scrollbar-thumb-gray-800">
          {/* MAIN */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">
              Main
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin", true)
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/activity"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/activity")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Activity className="w-4 h-4 text-gray-400" />
                <span>Activity Feed</span>
              </Link>
              <Link
                href="/admin/notifications"
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/notifications")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span>Notifications</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </Link>
            </nav>
          </div>

          {/* SERVICES */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">
              Services
            </p>
            <div className="space-y-1">
              {/* 1. Billstacks */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup("billstacks")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[ServiceSlug.BILLSTACKS].color }}
                    />
                    <span className="font-semibold text-gray-200">Billstacks</span>
                  </div>
                  {openGroups.billstacks ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openGroups.billstacks && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-4 mt-1">
                    <Link
                      href="/admin/billstacks"
                      className={cn(
                        "block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5",
                        isLinkActive("/admin/billstacks", true) && "text-white font-semibold bg-white/10"
                      )}
                    >
                      Dashboard
                    </Link>
                    <Link href="/admin/billstacks/invoices" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Invoices
                    </Link>
                    <Link href="/admin/billstacks/estimates" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Estimates
                    </Link>
                    <Link href="/admin/billstacks/recurring" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Recurring Invoices
                    </Link>
                    <Link href="/admin/billstacks/expenses" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Expenses
                    </Link>
                    <Link href="/admin/billstacks/purchase-orders" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Purchase Orders
                    </Link>
                    <Link href="/admin/billstacks/products" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Products
                    </Link>
                    <Link href="/admin/billstacks/tax" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Tax
                    </Link>
                    <Link href="/admin/billstacks/hrm" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      HRM
                    </Link>
                    <Link href="/admin/billstacks/affiliate" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Affiliate
                    </Link>
                  </div>
                )}
              </div>

              {/* 2. Top Builders */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup("builders")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[ServiceSlug.BUILDERS].color }}
                    />
                    <span className="font-semibold text-gray-200">Top Builders</span>
                  </div>
                  {openGroups.builders ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openGroups.builders && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-4 mt-1">
                    <Link href="/admin/builders" className={cn("block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5", isLinkActive("/admin/builders", true) && "text-white font-semibold bg-white/10")}>
                      Dashboard
                    </Link>
                    <Link href="/admin/builders/sales" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Daily Sales Book
                    </Link>
                    <Link href="/admin/builders/sales/new" className="block px-2.5 py-1.5 rounded text-amber-300 hover:text-white hover:bg-white/5 font-semibold">
                      + New Sale
                    </Link>
                    <Link href="/admin/builders/stock" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Stock Sheet
                    </Link>
                    <Link href="/admin/builders/stock/in" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Stock In
                    </Link>
                    <Link href="/admin/builders/stock/count" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Record Count
                    </Link>
                    <Link href="/admin/builders/debtors" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Debtors
                    </Link>
                    <Link href="/admin/builders/products" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Products
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Zino Spark */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup("spark")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[ServiceSlug.SPARK].color }}
                    />
                    <span className="font-semibold text-gray-200">Zino Spark</span>
                  </div>
                  {openGroups.spark ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openGroups.spark && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-4 mt-1">
                    <Link href="/admin/spark" className={cn("block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5", isLinkActive("/admin/spark", true) && "text-white font-semibold bg-white/10")}>
                      Dashboard
                    </Link>
                    <Link href="/admin/spark/pos" className="block px-2.5 py-1.5 rounded text-blue-300 hover:text-white hover:bg-white/5 font-semibold">
                      Sell (POS)
                    </Link>
                    <Link href="/admin/spark/products" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Products
                    </Link>
                    <Link href="/admin/spark/purchases" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Purchases
                    </Link>
                    <Link href="/admin/spark/transfers" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Stock Transfers
                    </Link>
                    <Link href="/admin/spark/adjustments" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Stock Adjustment
                    </Link>
                    <Link href="/admin/spark/stock-alert" className="block px-2.5 py-1.5 rounded text-rose-300 hover:text-white hover:bg-white/5 font-semibold">
                      Stock Alert
                    </Link>
                    <Link href="/admin/spark/expenses" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Expenses
                    </Link>
                    <Link href="/admin/spark/reports" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Reports
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. Zino Apartments */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup("apartments")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[ServiceSlug.APARTMENTS].color }}
                    />
                    <span className="font-semibold text-gray-200">Zino Apartments</span>
                  </div>
                  {openGroups.apartments ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openGroups.apartments && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-4 mt-1">
                    <Link href="/admin/apartments" className={cn("block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5", isLinkActive("/admin/apartments", true) && "text-white font-semibold bg-white/10")}>
                      Dashboard
                    </Link>
                    <Link href="/admin/apartments/front-desk" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Front Desk
                    </Link>
                    <Link href="/admin/apartments/bookings" className="flex items-center justify-between px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      <span>Bookings</span>
                      {bookingRequestsCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px] font-bold">
                          {bookingRequestsCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/admin/apartments/rooms" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Rooms & Types
                    </Link>
                    <Link href="/admin/apartments/setup" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Hotel Setup
                    </Link>
                    <Link href="/admin/apartments/guests" className="flex items-center justify-between px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      <span>Guests & Support</span>
                      {guestSupportCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[10px] font-bold">
                          {guestSupportCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/admin/apartments/payments" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Online Payments
                    </Link>
                    <Link href="/admin/apartments/reports" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Reports
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. Device Galaxy */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup("galaxy")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[ServiceSlug.GALAXY].color }}
                    />
                    <span className="font-semibold text-gray-200">Device Galaxy</span>
                  </div>
                  {openGroups.galaxy ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openGroups.galaxy && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-4 mt-1">
                    <Link href="/admin/galaxy" className={cn("block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5", isLinkActive("/admin/galaxy", true) && "text-white font-semibold bg-white/10")}>
                      Dashboard
                    </Link>
                    <Link href="/admin/galaxy/orders" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Orders
                    </Link>
                    <Link href="/admin/galaxy/products" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Products
                    </Link>
                    <Link href="/admin/galaxy/categories" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Categories
                    </Link>
                    <Link href="/admin/galaxy/brands" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Brands
                    </Link>
                    <Link href="/admin/galaxy/reviews" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Reviews
                    </Link>
                    <Link href="/admin/galaxy/coupons" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Coupons
                    </Link>
                    <Link href="/admin/galaxy/blog" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Blog
                    </Link>
                  </div>
                )}
              </div>

              {/* 6. Visitor Management */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup("visitors")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SERVICE_CONFIG[ServiceSlug.VISITORS].color }}
                    />
                    <span className="font-semibold text-gray-200">Visitor Management</span>
                  </div>
                  {openGroups.visitors ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openGroups.visitors && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-4 mt-1">
                    <Link href="/admin/visitors" className={cn("block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5", isLinkActive("/admin/visitors", true) && "text-white font-semibold bg-white/10")}>
                      Dashboard
                    </Link>
                    <Link href="/admin/visitors/list" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Visitors
                    </Link>
                    <Link href="/admin/visitors/pre-registers" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Pre-Registers
                    </Link>
                    <Link href="/admin/visitors/attendance" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Attendance
                    </Link>
                    <Link href="/admin/visitors/employees" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Employees
                    </Link>
                    <Link href="/admin/visitors/departments" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Departments
                    </Link>
                    <Link href="/admin/visitors/designations" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Designations
                    </Link>
                    <Link href="/admin/visitors/reports" className="block px-2.5 py-1.5 rounded text-gray-300 hover:text-white hover:bg-white/5">
                      Reports
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SHARED */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">
              Shared Engines
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin/products"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/products")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Package className="w-4 h-4 text-gray-400" />
                <span>Products &amp; Services</span>
              </Link>
              <Link
                href="/admin/contacts"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/contacts")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Users className="w-4 h-4 text-gray-400" />
                <span>Contacts Directory</span>
              </Link>
              <Link
                href="/admin/reports"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/reports", true)
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span>Reports Hub</span>
              </Link>
              <Link
                href="/admin/locations"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/locations")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Locations</span>
              </Link>
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/users", true)
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>Users & Roles</span>
              </Link>
            </nav>
          </div>

          {/* ORGANIZATION */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">
              Organization
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin/reports/consolidated"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/reports/consolidated")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Layers className="w-4 h-4 text-gray-400" />
                <span>Consolidated P&L</span>
              </Link>
              <Link
                href="/admin/users/staff"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/users/staff")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Users className="w-4 h-4 text-gray-400" />
                <span>Staff Access</span>
              </Link>
              <Link
                href="/admin/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isLinkActive("/admin/settings")
                    ? "bg-active text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Platform Settings</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Footer User Mini */}
        <div className="p-3 border-t border-[#222244] bg-[#111124]">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
          >
            <span>Visit Public Portal</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
