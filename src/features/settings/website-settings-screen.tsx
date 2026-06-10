"use client";

import { Moon, SunMedium } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FeatureShell } from "@/components/ui/feature-shell";
import { removePersistedBlockedUser, usePersistedBlockedUsers } from "@/hooks/use-persisted-app-data";
import { useToLink } from "@/lib/app-state";
import { t } from "@/lib/translations";
import type { FontScale } from "@/lib/types";

const tabs = ["appearance", "notifications", "language", "privacy"] as const;
type SettingsTab = (typeof tabs)[number];

export function WebsiteSettingsScreen() {
  const { fontScale, language, setFontScale, theme, toggleLanguage, toggleTheme } = useToLink();
  const blockedUsers = usePersistedBlockedUsers();
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    bookings: true,
    friends: false,
    likes: true,
    messages: true,
    quests: true,
  });
  const ThemeIcon = theme === "light" ? SunMedium : Moon;
  const themeLabel = theme === "light" ? t(language, "settings.currentLight") : t(language, "settings.currentDark");

  async function handleUnblock(blockedUserId: string, blockedUserName: string) {
    setUnblockingId(blockedUserId);

    try {
      const removed = await removePersistedBlockedUser(blockedUserId);

      if (!removed) {
        toast.error(language === "zh-HK" ? "暫時無法解除封鎖。" : "Unable to unblock this user right now.");
        return;
      }

      toast.success(
        language === "zh-HK"
          ? `已解除封鎖 ${blockedUserName}。`
          : `${blockedUserName} has been unblocked.`,
      );
    } finally {
      setUnblockingId(null);
    }
  }

  return (
    <FeatureShell
      description={t(language, "settings.description")}
      title={t(language, "nav.settings.website")}
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
                ["messages", t(language, "settings.notif.messages")],
                ["likes", t(language, "settings.notif.likes")],
                ["friends", t(language, "settings.notif.friends")],
                ["quests", t(language, "settings.notif.quests")],
                ["bookings", t(language, "settings.notif.bookings")],
              ].map(([key, label]) => {
                const typedKey = key as keyof typeof notificationPreferences;
                const enabled = notificationPreferences[typedKey];

                return (
                <section key={String(label)} className="rounded-[28px] border border-border bg-panel-strong p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                      <p className="mt-2 text-sm text-muted">{enabled ? t(language, "settings.notif.critical") : t(language, "settings.notif.optional")}</p>
                    </div>
                    <button
                      className={enabled ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"}
                      onClick={() =>
                        setNotificationPreferences((current) => ({
                          ...current,
                          [typedKey]: !current[typedKey],
                        }))
                      }
                      type="button"
                    >
                      {enabled ? t(language, "common.on") : t(language, "common.off")}
                    </button>
                  </div>
                </section>
              );})}
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
              <section className="rounded-[28px] border border-border bg-panel-strong p-5">
                <h3 className="text-lg font-semibold text-foreground">{t(language, "settings.privacy.blockList")}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {language === "zh-HK"
                    ? "被封鎖的用戶在 Posts 頁面會被隱藏，你可隨時在這裡解除封鎖。"
                    : "Blocked users are hidden from the Posts feed, and you can unblock them here at any time."}
                </p>
                {blockedUsers.items.length ? (
                  <div className="mt-4 space-y-3">
                    {blockedUsers.items.map((blockedUser) => (
                      <div key={blockedUser.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-border bg-panel px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                            {blockedUser.avatar}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{blockedUser.name}</p>
                            <p className="text-xs text-muted">
                              {language === "zh-HK"
                                ? `封鎖於 ${new Date(blockedUser.blockedAt).toLocaleDateString("zh-HK")}`
                                : `Blocked on ${new Date(blockedUser.blockedAt).toLocaleDateString("en-HK")}`}
                            </p>
                          </div>
                        </div>
                        <button
                          className="rounded-full border border-border bg-panel-strong px-4 py-2 text-sm font-semibold text-foreground"
                          disabled={unblockingId === blockedUser.id}
                          onClick={() => {
                            void handleUnblock(blockedUser.id, blockedUser.name);
                          }}
                          type="button"
                        >
                          {unblockingId === blockedUser.id
                            ? t(language, "common.working")
                            : language === "zh-HK"
                              ? "解除封鎖"
                              : "Unblock"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-[20px] border border-dashed border-border px-4 py-3 text-sm text-muted">
                    {language === "zh-HK" ? "目前沒有已封鎖的用戶。" : "No users are currently blocked."}
                  </p>
                )}
              </section>
              {[
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