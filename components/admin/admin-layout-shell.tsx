"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { usePlatformStore } from "@/lib/platform-store";
import { getApartmentBookings } from "@/lib/apartments-data";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { globalServiceFilter, updateGlobalServiceFilter, globalLocationFilter, updateGlobalLocationFilter } = usePlatformStore();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [bookingRequestsCount, setBookingRequestsCount] = useState<number>(0);
  const [guestSupportCount, setGuestSupportCount] = useState<number>(0);

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

    // Compute live pending bookings from real stored bookings
    const computeLiveCounts = () => {
      const allBookings = getApartmentBookings();
      const pending = allBookings.filter(
        (b) => b.paymentStatus === "PENDING_ARRIVAL" || b.paymentStatus === "PENDING_PAYMENT"
      ).length;
      setBookingRequestsCount(pending);
    };

    computeLiveCounts();
    window.addEventListener("zino_apartments_bookings_update", computeLiveCounts);

    // Fetch live pending booking requests count from backend if available
    fetch("/api/apartments/front-desk/today")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && res?.data?.stats) {
          const count = res.data.stats.arrivalsCount ?? 0;
          setBookingRequestsCount((prev) => Math.max(prev, count));
        }
      })
      .catch(() => {});

    // Fetch live guest support messages/requests count
    fetch("/api/apartments/contact")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.ok && Array.isArray(res?.data)) {
          setGuestSupportCount(res.data.filter((m: any) => !m.resolved).length);
        } else {
          setGuestSupportCount(0);
        }
      })
      .catch(() => {
        setGuestSupportCount(0);
      });

    return () => {
      window.removeEventListener("zino_apartments_bookings_update", computeLiveCounts);
    };
  }, []);

  return (
    <div className="min-h-screen bg-content-bg flex overflow-x-hidden max-w-full">
      {/* Sidebar */}
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        bookingRequestsCount={bookingRequestsCount}
        guestSupportCount={guestSupportCount}
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
