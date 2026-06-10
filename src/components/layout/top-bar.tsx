"use client";

import Link from "next/link";
import { Bell, CircleHelp, Menu, MoonStar, SunMedium } from "lucide-react";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { usePersistedCurrentUserProfile, usePersistedDashboardData } from "@/hooks/use-persisted-app-data";
import { getPageDescription, getPageTitle } from "@/lib/navigation";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  const showWelcome = pathname === "/home";
  const { profile } = usePersistedCurrentUserProfile();
  const {
    language,
    notificationsOpen,
    setNotificationsOpen,
    setSidebarOpen,
    sidebarOpen,
    theme,
    toggleTheme,
  } = useToLink();
  const dashboardData = usePersistedDashboardData();
  const notificationCount = dashboardData.notificationsByLanguage[language]?.length ?? 0;
  const pageDescriptionKey = getPageDescription(pathname);

  return (
    <header className="app-panel app-panel-strong flex items-center justify-between gap-4 rounded-[28px] border px-4 py-3 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-panel-strong text-foreground transition hover:border-accent/40 hover:text-accent"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          {showWelcome ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
              {t(language, "page.welcome")}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <h1 className="truncate font-display text-2xl font-semibold text-foreground">
              {t(language, getPageTitle(pathname))}
            </h1>
            {pageDescriptionKey ? (
              <div className="group relative hidden shrink-0 md:block">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-panel-strong text-muted transition group-hover:border-accent/40 group-hover:text-accent">
                  <CircleHelp className="h-4 w-4" />
                </div>
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-80 max-w-[60vw] -translate-x-1/2 rounded-[18px] border border-border bg-panel-strong px-4 py-3 text-sm leading-6 text-muted opacity-0 shadow-xl transition group-hover:opacity-100">
                  {t(language, pageDescriptionKey)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={cn(
            "flex h-11 items-center gap-2 rounded-2xl border px-3 text-sm font-medium transition",
            notificationsOpen
              ? "border-accent bg-accent text-white"
              : "border-border bg-panel-strong text-foreground hover:border-accent/40 hover:text-accent",
          )}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          type="button"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden md:inline">{t(language, "control.notifications")}</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
            {notificationCount}
          </span>
        </button>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-panel-strong text-foreground transition hover:border-accent/40 hover:text-accent"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "light" ? (
            <MoonStar className="h-4.5 w-4.5" />
          ) : (
            <SunMedium className="h-4.5 w-4.5" />
          )}
        </button>

        <Link
          className="group flex items-center gap-3 rounded-2xl border border-border bg-panel-strong px-3 py-2 transition hover:border-accent/40 hover:bg-accent-soft/70 hover:text-accent hover:shadow-[0_12px_30px_rgba(243,107,33,0.12)]"
          href="/settings/profile"
        >
          <AvatarBadge
            alt={profile.name}
            className="h-9 w-9 bg-accent text-sm font-bold text-white transition group-hover:scale-105 group-hover:bg-accent-strong"
            textClassName="text-white"
            value={profile.avatar}
          />
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-foreground transition group-hover:text-accent-strong">
              {profile.name}
            </p>
            <p className="text-xs text-muted transition group-hover:text-accent-strong/80">
              @{profile.username}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}