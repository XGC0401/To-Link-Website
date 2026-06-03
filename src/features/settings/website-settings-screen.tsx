"use client";

import { Moon, SunMedium } from "lucide-react";
import { useState } from "react";
import { FeatureShell } from "@/components/ui/feature-shell";
import { useToLink } from "@/lib/app-state";
import type { FontScale } from "@/lib/types";

const tabs = ["Appearance", "Notification Preference", "Language & Region", "Privacy & Security"] as const;

export function WebsiteSettingsScreen() {
  const { fontScale, language, setFontScale, theme, toggleLanguage, toggleTheme } = useToLink();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Appearance");
  const ThemeIcon = theme === "light" ? SunMedium : Moon;
  const themeLabel = theme === "light" ? "Light" : "Dark";

  return (
    <FeatureShell
      description="Website-wide preferences are centralized here, with appearance, notification, language, and privacy controls separated into focused tabs."
      title="Website Settings"
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex flex-wrap gap-2 rounded-[24px] border border-border bg-panel-strong p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={tab === activeTab ? "rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white" : "rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:bg-panel hover:text-foreground"}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-0 overflow-y-auto pr-1">
          {activeTab === "Appearance" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <section className="rounded-[28px] border border-border bg-panel-strong p-5">
                <h3 className="text-lg font-semibold text-foreground">Display mode</h3>
                <p className="mt-2 text-sm leading-7 text-muted">Switch between light and dark mode for the full interface.</p>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                  onClick={toggleTheme}
                  type="button"
                >
                  <ThemeIcon className="h-4 w-4" />
                  <span>Current: {themeLabel}</span>
                </button>
              </section>
              <section className="rounded-[28px] border border-border bg-panel-strong p-5">
                <h3 className="text-lg font-semibold text-foreground">Font scale</h3>
                <div className="mt-4 flex gap-2">
                  {(["s", "m", "b", "l"] as FontScale[]).map((value) => (
                    <button
                      key={value}
                      className={fontScale === value ? "flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white" : "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel text-sm font-semibold text-foreground"}
                      onClick={() => setFontScale(value)}
                      type="button"
                    >
                      {value.toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "Notification Preference" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                ["Messages", true],
                ["Likes and Comments", true],
                ["Friend Requests", false],
                ["Quest Reminders", true],
                ["Booking Updates", true],
              ].map(([label, required]) => (
                <section key={String(label)} className="rounded-[28px] border border-border bg-panel-strong p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                      <p className="mt-2 text-sm text-muted">{required ? "Critical or enabled by default." : "Optional notification."}</p>
                    </div>
                    <button className={required ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"} type="button">
                      {required ? "On" : "Off"}
                    </button>
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {activeTab === "Language & Region" ? (
            <section className="rounded-[28px] border border-border bg-panel-strong p-5">
              <h3 className="text-lg font-semibold text-foreground">Language</h3>
              <p className="mt-2 text-sm leading-7 text-muted">Toggle instantly between English and Traditional Chinese.</p>
              <button className="mt-4 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" onClick={toggleLanguage} type="button">
                Current: {language}
              </button>
            </section>
          ) : null}

          {activeTab === "Privacy & Security" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                "Block List management",
                "Password and email security",
                "Masked personal ID display",
                "Critical alert preferences",
              ].map((item) => (
                <section key={item} className="rounded-[28px] border border-border bg-panel-strong p-5">
                  <h3 className="text-lg font-semibold text-foreground">{item}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">This module is prepared for Firebase-backed profile persistence and admin-safe audit trails.</p>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </FeatureShell>
  );
}