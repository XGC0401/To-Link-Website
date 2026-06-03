"use client";

import { Toaster } from "sonner";
import type { StoredPreferences } from "@/lib/preferences";
import { ToLinkProvider } from "@/lib/app-state";

export function Providers({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences: StoredPreferences;
}) {
  return (
    <ToLinkProvider initialPreferences={initialPreferences}>
      {children}
      <Toaster
        closeButton
        duration={3000}
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            toast: "!border-border !bg-panel-strong !text-foreground",
          },
        }}
      />
    </ToLinkProvider>
  );
}