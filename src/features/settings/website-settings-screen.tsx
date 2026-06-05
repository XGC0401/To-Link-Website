"use client";

import { Moon, SunMedium } from "lucide-react";
import { useState } from "react";
import { FeatureShell } from "@/components/ui/feature-shell";
import { useToLink } from "@/lib/app-state";
import { t } from "@/lib/translations";
import type { FontScale } from "@/lib/types";

const tabs = ["appearance", "notifications", "language", "privacy"] as const;
type SettingsTab = (typeof tabs)[number];

export function WebsiteSettingsScreen() {
  const { fontScale, language, setFontScale, theme, toggleLanguage, toggleTheme } = useToLink();
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const ThemeIcon = theme === "light" ? SunMedium : Moon;
  const themeLabel = theme === "light" ? t(language, "settings.currentLight") : t(language, "settings.currentDark");

  return (
    <FeatureShell
      description={t(language, "settings.description")}
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
              {tab === "appearance" ? t(language, "settings.appearance")
                : tab === "notifications" ? t(language, "settings.notificationPref")
                : tab === "language" ? t(language, "settings.languageRegion")
                : t(language, "settings.privacySecurity")}
            </button>
          ))}
        </div>

        <div className="min-h-0 overflow-y-auto pr-1">
          {activeTab === "appearance" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <section className="rounded-[28px] border border-border bg-panel-strong p-5">
                <h3 className="text-lg font-semibold text-foreground">{t(language, "settings.displayMode")}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{t(language, "settings.displayModeDesc")}</p>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                  onClick={toggleTheme}
                  type="button"
                >
                  <ThemeIcon className="h-4 w-4" />
                  <span>{t(language, "common.current")} {themeLabel}</span>
                </button>
              </section>
              <section className="rounded-[28px] border border-border bg-panel-strong p-5">
                <h3 className="text-lg font-semibold text-foreground">{t(language, "settings.fontScale")}</h3>
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

          {activeTab === "notifications" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                [t(language, "settings.notif.messages"), true],
                [t(language, "settings.notif.likes"), true],
                [t(language, "settings.notif.friends"), false],
                [t(language, "settings.notif.quests"), true],
                [t(language, "settings.notif.bookings"), true],
              ].map(([label, required]) => (
                <section key={String(label)} className="rounded-[28px] border border-border bg-panel-strong p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                      <p className="mt-2 text-sm text-muted">{required ? t(language, "settings.notif.critical") : t(language, "settings.notif.optional")}</p>
                    </div>
                    <button className={required ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"} type="button">
                      {required ? t(language, "common.on") : t(language, "common.off")}
                    </button>
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {activeTab === "language" ? (
            <section className="rounded-[28px] border border-border bg-panel-strong p-5">
              <h3 className="text-lg font-semibold text-foreground">{t(language, "settings.languageTitle")}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{t(language, "settings.languageDesc")}</p>
              <button className="mt-4 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" onClick={toggleLanguage} type="button">
                {t(language, "common.current")} {language === "en" ? t(language, "settings.currentEn") : t(language, "settings.currentZh")}
              </button>
            </section>
          ) : null}

          {activeTab === "privacy" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                t(language, "settings.privacy.blockList"),
                t(language, "settings.privacy.password"),
                t(language, "settings.privacy.maskedId"),
                t(language, "settings.privacy.alerts"),
              ].map((item) => (
                <section key={item} className="rounded-[28px] border border-border bg-panel-strong p-5">
                  <h3 className="text-lg font-semibold text-foreground">{item}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{t(language, "settings.privacy.desc")}</p>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </FeatureShell>
  );
}