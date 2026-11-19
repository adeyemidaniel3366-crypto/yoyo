"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { ServiceSlug } from "@/lib/constants";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceSlug | "ALL">("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [bookingRequestsCount, setBookingRequestsCount] = useState<number>(0);

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
    <div className="min-h-screen bg-content-bg flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        bookingRequestsCount={bookingRequestsCount}
        guestSupportCount={1}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Topbar */}
        <AdminTopbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          selectedService={selectedService}
          onSelectService={setSelectedService}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          bookingRequestsCount={bookingRequestsCount}
          userName={user?.name || "Admin"}
          userRole={user?.role || "Super Admin"}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
