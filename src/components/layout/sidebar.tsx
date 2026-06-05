"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BellRing,
  Blocks,
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Compass,
  FileText,
  HandHelping,
  House,
  Languages,
  LogOut,
  MessageCircleMore,
  MessagesSquare,
  ScanSearch,
  Settings2,
  ShoppingBag,
  Sparkles,
  SquareStack,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { FONT_SCALE_LABELS } from "@/lib/app-config";
import { currentUser } from "@/lib/demo-data";
import { getFirebaseServices } from "@/lib/firebase";
import { infoNavigation, sidebarNavigation, type NavigationIcon } from "@/lib/navigation";
import { t } from "@/lib/translations";
import type { FontScale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";

const iconMap: Record<NavigationIcon, React.ComponentType<{ className?: string }>> = {
  home: House,
  posts: SquareStack,
  nearby: Compass,
  connections: MessageCircleMore,
  activities: CalendarDays,
  building: Building2,
  settings: Settings2,
  info: CircleHelp,
  logout: LogOut,
  sharing: BookOpenText,
  secondHand: ShoppingBag,
  lostFound: ScanSearch,
  quest: HandHelping,
  shop: ShoppingBag,
  community: Users,
  message: MessagesSquare,
  friends: Users,
  event: BellRing,
  calendar: CalendarDays,
  booking: Blocks,
  ai: Sparkles,
  document: FileText,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeInfoPanel,
    closeInfoPanel,
    fontScale,
    language,
    openInfoPanel,
    setFontScale,
    setSidebarOpen,
    sidebarOpen,
    toggleLanguage,
  } = useToLink();

  const [expandedGroups, setExpandedGroups] = useState(
    () => new Set<string>(),
  );

  function toggleGroup(labelKey: string) {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setExpandedGroups((current) => {
        const next = new Set(current);

        next.add(labelKey);

        return next;
      });
      return;
    }

    setExpandedGroups((current) => {
      const next = new Set(current);

      if (next.has(labelKey)) {
        next.delete(labelKey);
      } else {
        next.add(labelKey);
      }

      return next;
    });
  }

  function handleActionItem(item: (typeof infoNavigation)[number]) {
    if (item.action.type === "signOut") {
      const services = getFirebaseServices();

      if (!services) {
        toast.success(t(language, "auth.signedOut"));
        closeInfoPanel();
        router.push("/");
        return;
      }

      void signOut(services.auth)
        .then(() => {
          toast.success(t(language, "auth.signedOut"));
          closeInfoPanel();
          router.push("/");
        })
        .catch((error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : t(language, "auth.signOutError"),
          );
        });
      return;
    }

    if (item.action.type === "infoModal") {
      openInfoPanel(item.action.panelId);
      return;
    }

    toast(item.action.message, { duration: 2000 });
  }

  return (
    <aside
      className={cn(
        "relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-border/70 bg-panel-muted/90 px-3 py-4 backdrop-blur md:flex",
        sidebarOpen ? "w-[19rem]" : "w-[6.1rem]",
      )}
    >
      <div className="flex items-center gap-3 px-3 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-white shadow-lg shadow-accent/30">
          TL
        </div>
        {sidebarOpen ? (
          <div>
            <p className="font-display text-xl font-semibold">{t(language, "brand")}</p>
            <p className="text-xs text-muted">{currentUser.name}</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {sidebarNavigation.map((item, index) => {
          if (item.kind === "separator") {
            return <div key={`separator-${index}`} className="my-3 border-t border-border/80" />;
          }

          if (item.kind === "route") {
            return (
              <SidebarRouteLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={pathname === item.href}
                collapsed={!sidebarOpen}
                label={t(language, item.labelKey)}
              />
            );
          }

          if (item.kind === "action") {
            return null;
          }

          const Icon = iconMap[item.icon];
          const isGroupActive = item.children.some((child) => pathname.startsWith(child.href));
          const shouldExpand = sidebarOpen && expandedGroups.has(item.labelKey);
          const isSettingsGroup = item.labelKey === "nav.settings";

          return (
            <div key={item.labelKey} className="space-y-1">
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-muted transition",
                  isGroupActive && "bg-accent-soft text-accent-strong",
                )}
                onClick={() => toggleGroup(item.labelKey)}
                type="button"
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {sidebarOpen ? (
                  <>
                    <span className="flex-1">{t(language, item.labelKey)}</span>
                    {shouldExpand ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
                ) : null}
              </button>

              {shouldExpand ? (
                <div className="space-y-1 pl-4">
                  {item.children.map((child) => (
                    <SidebarRouteLink
                      key={child.href}
                      href={child.href}
                      icon={child.icon}
                      active={pathname === child.href}
                      collapsed={!sidebarOpen}
                      label={t(language, child.labelKey)}
                    />
                  ))}

                  {isSettingsGroup ? (
                    <div className="space-y-3 px-3 py-2">
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                          {t(language, "control.fontSize")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(FONT_SCALE_LABELS) as FontScale[]).map((value) => (
                            <button
                              key={value}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                                fontScale === value
                                  ? "border-accent bg-accent text-white"
                                  : "border-border bg-panel-strong text-muted hover:border-accent/40 hover:text-foreground",
                              )}
                              onClick={() => setFontScale(value)}
                              type="button"
                            >
                              {FONT_SCALE_LABELS[value]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                          {t(language, "control.language")}
                        </p>
                        <button
                          className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-panel-strong px-3 py-2.5 text-sm font-semibold text-muted transition hover:text-foreground"
                          onClick={toggleLanguage}
                          type="button"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Languages className="h-3.5 w-3.5" />
                            {t(language, "control.language")}
                          </span>
                          <span>{language === "en" ? "繁中" : "EN"}</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
        <div className="my-3 border-t border-border/80" />

        <div className="space-y-1">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-muted transition",
              activeInfoPanel && "bg-accent-soft text-accent-strong",
            )}
            onClick={() => toggleGroup("nav.info")}
            type="button"
          >
            <CircleHelp className="h-4.5 w-4.5 shrink-0" />
            {sidebarOpen ? (
              <>
                <span className="flex-1">{t(language, "nav.info")}</span>
                {expandedGroups.has("nav.info") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            ) : null}
          </button>

          {sidebarOpen && expandedGroups.has("nav.info") ? (
            <div className="space-y-1 pl-4">
              {infoNavigation.map((item) => {
                const Icon = iconMap[item.icon];
                const isOpen =
                  item.action.type === "infoModal" && activeInfoPanel === item.action.panelId;

                return (
                  <button
                    key={item.labelKey}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
                      isOpen
                        ? "bg-accent text-white"
                        : "text-muted hover:bg-panel-strong hover:text-foreground",
                    )}
                    onClick={() => handleActionItem(item)}
                    type="button"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{t(language, item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </nav>
    </aside>
  );
}

function SidebarRouteLink({
  active,
  collapsed,
  href,
  icon,
  label,
}: {
  active: boolean;
  collapsed: boolean;
  href: string;
  icon: NavigationIcon;
  label: string;
}) {
  const Icon = iconMap[icon];

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-accent text-white shadow-lg shadow-accent/25"
          : "text-muted hover:bg-panel-strong hover:text-foreground",
      )}
      href={href}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      {collapsed ? null : <span>{label}</span>}
    </Link>
  );
}