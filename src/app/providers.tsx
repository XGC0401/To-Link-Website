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
        expand
        offset={20}
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            toast:
              "!min-w-[320px] !max-w-[560px] !border-2 !border-accent/35 !bg-panel-strong !p-5 !text-foreground !shadow-[0_22px_50px_rgba(117,58,14,0.28)]",
            title: "!text-[15px] !font-medium !leading-6",
            description: "!mt-1 !text-[13px] !leading-6 !text-foreground/90",
            icon: "!h-6 !w-6",
            closeButton:
              "!h-8 !w-8 !border !border-border !bg-panel !text-foreground hover:!border-accent/40 hover:!text-accent",
          },
        }}
      />
    </ToLinkProvider>
  );
}