import React from "react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "Admin Dashboard — Zino One",
  description: "Unified business management platform for all 6 services.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </ToastProvider>
  );
}
