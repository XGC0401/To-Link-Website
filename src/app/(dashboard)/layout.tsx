"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardDataProvider } from "@/lib/dashboard-data-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardDataProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardDataProvider>
  );
}
