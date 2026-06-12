"use client";

import { createContext, useContext, useMemo } from "react";
import {
  usePersistedDashboardData,
  usePersistedSharedContent,
} from "@/hooks/use-persisted-app-data";

interface DashboardDataContextValue {
  dashboardData: ReturnType<typeof usePersistedDashboardData>;
  sharedContent: ReturnType<typeof usePersistedSharedContent>;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  // These subscriptions only set up once and persist across page navigations
  const dashboardData = usePersistedDashboardData();
  const sharedContent = usePersistedSharedContent();

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      dashboardData,
      sharedContent,
    }),
    [dashboardData, sharedContent],
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }
  return context;
}
