"use client";

import React, { useState } from "react";
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

  return (
    <div className="min-h-screen bg-content-bg flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        bookingRequestsCount={0}
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
          bookingRequestsCount={0}
          userName="Admin"
          userRole="Super Admin"
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
