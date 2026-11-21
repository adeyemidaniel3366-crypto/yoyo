"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { usePlatformStore } from "@/lib/platform-store";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { globalServiceFilter, updateGlobalServiceFilter, globalLocationFilter, updateGlobalLocationFilter } = usePlatformStore();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [bookingRequestsCount, setBookingRequestsCount] = useState<number>(2);

  useEffect(() => {
    // Load current authenticated user session
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data) {
          const u = res.data;
          const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
          setUser({
            name: fullName || u.email || "Admin User",
            role: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles.join(", ") : "Admin",
          });
        }
      })
      .catch(() => {});

    // Fetch live pending booking requests count
    fetch("/api/apartments/front-desk/today")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data?.stats) {
          setBookingRequestsCount(res.data.stats.arrivalsCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-content-bg flex overflow-x-hidden max-w-full">
      {/* Sidebar */}
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        bookingRequestsCount={bookingRequestsCount}
        guestSupportCount={1}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full lg:pl-[260px]">
        {/* Topbar */}
        <AdminTopbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          selectedService={globalServiceFilter}
          onSelectService={updateGlobalServiceFilter}
          selectedLocation={globalLocationFilter}
          onSelectLocation={updateGlobalLocationFilter}
          bookingRequestsCount={bookingRequestsCount}
          userName={user?.name || "Admin"}
          userRole={user?.role || "Super Admin"}
        />

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-7 max-w-7xl w-full min-w-0 mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
