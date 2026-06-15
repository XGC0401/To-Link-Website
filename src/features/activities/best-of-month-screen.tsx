"use client";

import { Crown, Star, Trophy } from "lucide-react";
import { useMemo } from "react";
import { FeatureShell } from "@/components/ui/feature-shell";
import { usePersistedConnections, usePersistedCurrentUserProfile } from "@/hooks/use-persisted-app-data";
import { usePersistedPosts } from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";
import { useToLink } from "@/lib/app-state";
import { useCalendarEvents } from "@/hooks/use-calendar-events";

interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatar: string;
  questsCompleted: number;
  activitiesCount: number;
}

const RANK_CONFIG = [
  {
    rankKey: "bestOfMonth.rank1" as const,
    icon: Crown,
    ring: "ring-2 ring-yellow-400",
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    badge: "bg-yellow-100 text-yellow-700",
    cardBg: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
  },
  {
    rankKey: "bestOfMonth.rank2" as const,
    icon: Trophy,
    ring: "ring-2 ring-slate-400",
    bg: "bg-gradient-to-br from-slate-400 to-slate-500",
    badge: "bg-slate-100 text-slate-600",
    cardBg: "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200",
  },
  {
    rankKey: "bestOfMonth.rank3" as const,
    icon: Star,
    ring: "ring-2 ring-amber-600",
    bg: "bg-gradient-to-br from-amber-600 to-orange-600",
    badge: "bg-amber-100 text-amber-700",
    cardBg: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
  },
] as const;

export function BestOfMonthScreen() {
  const { language } = useToLink();
  const { profile } = usePersistedCurrentUserProfile();
  const connections = usePersistedConnections();
  const { items: posts } = usePersistedPosts();
  const calendarEvents = useCalendarEvents();

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    // Gather all known users: current user + friend suggestions + friends
    const allUsers = [
      { id: profile.id, name: profile.name, username: profile.username, avatar: profile.avatar },
      ...connections.friendSuggestions.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar })),
      ...connections.friendList.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar })),
    ];

    // Deduplicate by id
    const seen = new Set<string>();
    const unique = allUsers.filter((u) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });

    // Count quests completed per author
    const questCounts: Record<string, number> = {};
    for (const post of posts) {
      if (post.category === "quest" || post.category === "lostFound") {
        questCounts[post.authorId] = (questCounts[post.authorId] ?? 0) + 1;
      }
    }

    // Count calendar events per participant (use seeded events for demo)
    const activityCounts: Record<string, number> = {};
    for (const event of calendarEvents) {
      // Attribute each calendar event to the current user as a proxy
      activityCounts[profile.id] = (activityCounts[profile.id] ?? 0) + 1;
    }

    return unique
      .map((u) => ({
        ...u,
        questsCompleted: questCounts[u.id] ?? 0,
        activitiesCount: activityCounts[u.id] ?? 0,
      }))
      .sort((a, b) => b.questsCompleted - a.questsCompleted || b.activitiesCount - a.activitiesCount)
      .slice(0, 3);
  }, [profile, connections.friendSuggestions, connections.friendList, posts, calendarEvents]);

  return (
    <FeatureShell description={t(language, "bestOfMonth.subtitle")} title={t(language, "bestOfMonth.title")}>
      <div className="space-y-8">
        {/* Podium row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {RANK_CONFIG.map((config, index) => {
            const entry = leaderboard[index];
            const Icon = config.icon;

            if (!entry) {
              return (
                <div key={index} className={`flex flex-col items-center rounded-[28px] border p-6 ${config.cardBg}`}>
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-white text-xl font-black ${config.bg}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm text-muted">{t(language, "bestOfMonth.empty")}</p>
                </div>
              );
            }

            return (
              <div key={entry.id} className={`flex flex-col items-center rounded-[28px] border p-6 ${config.cardBg}`}>
                <div className="relative">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white shadow-lg ${config.bg} ${config.ring}`}>
                    {entry.avatar}
                  </div>
                  <span className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${config.badge}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-3 text-center font-bold text-foreground">{entry.name}</p>
                <p className="text-xs text-muted">@{entry.username}</p>
                <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
                  {t(language, "bestOfMonth.rank1").replace("1st", `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"}`).replace("第一名", `第${index + 1}名`)}
                  {t(language, config.rankKey)}
                </span>
                <div className="mt-4 w-full space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2">
                    <span className="text-muted">{language === "zh-HK" ? "完成任務" : "Quests"}</span>
                    <span className="font-bold text-foreground">{entry.questsCompleted} {t(language, "bestOfMonth.quests")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2">
                    <span className="text-muted">{language === "zh-HK" ? "參與活動" : "Activities"}</span>
                    <span className="font-bold text-foreground">{entry.activitiesCount} {t(language, "bestOfMonth.activities")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full ranking table */}
        <div className="rounded-[28px] border border-border bg-panel-strong p-5">
          <h3 className="mb-4 font-semibold text-foreground">{language === "zh-HK" ? "完整排行榜" : "Full Rankings"}</h3>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted">{t(language, "bestOfMonth.empty")}</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-4 rounded-2xl border border-border bg-panel px-4 py-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${index === 0 ? "bg-yellow-400" : index === 1 ? "bg-slate-400" : "bg-amber-600"}`}>
                    {index + 1}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {entry.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{entry.name}</p>
                    <p className="text-xs text-muted">@{entry.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">{entry.questsCompleted} {t(language, "bestOfMonth.quests")} · {entry.activitiesCount} {t(language, "bestOfMonth.activities")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FeatureShell>
  );
}

/** Compact popup card for the home page */
export function BestOfMonthPopup({
  onViewAll,
}: {
  onViewAll: () => void;
}) {
  const { language } = useToLink();
  const { profile } = usePersistedCurrentUserProfile();
  const connections = usePersistedConnections();
  const { items: posts } = usePersistedPosts();
  const calendarEvents = useCalendarEvents();

  const top3 = useMemo<LeaderboardEntry[]>(() => {
    const allUsers = [
      { id: profile.id, name: profile.name, username: profile.username, avatar: profile.avatar },
      ...connections.friendSuggestions.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar })),
      ...connections.friendList.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar })),
    ];
    const seen = new Set<string>();

    const questCounts: Record<string, number> = {};
    for (const post of posts) {
      if (post.category === "quest" || post.category === "lostFound") {
        questCounts[post.authorId] = (questCounts[post.authorId] ?? 0) + 1;
      }
    }

    const activityCounts: Record<string, number> = {};
    for (const _event of calendarEvents) {
      activityCounts[profile.id] = (activityCounts[profile.id] ?? 0) + 1;
    }

    return allUsers
      .filter((u) => { if (seen.has(u.id)) return false; seen.add(u.id); return true; })
      .map((u) => ({ ...u, questsCompleted: questCounts[u.id] ?? 0, activitiesCount: activityCounts[u.id] ?? 0 }))
      .sort((a, b) => b.questsCompleted - a.questsCompleted || b.activitiesCount - a.activitiesCount)
      .slice(0, 3);
  }, [profile, connections.friendSuggestions, connections.friendList, posts, calendarEvents]);

  const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
  const rankIcons = [Crown, Trophy, Star];

  return (
    <div className="space-y-3">
      {top3.map((entry, index) => {
        const RankIcon = rankIcons[index];
        return (
          <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-border bg-panel px-4 py-3">
            <RankIcon className={`h-5 w-5 shrink-0 ${rankColors[index]}`} />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-foreground">{entry.name}</p>
              <p className="text-xs text-muted">@{entry.username}</p>
            </div>
            <span className="text-xs text-muted">{entry.questsCompleted} {t(language, "bestOfMonth.quests")} · {entry.activitiesCount} {t(language, "bestOfMonth.activities")}</span>
          </div>
        );
      })}
      <button
        className="mt-1 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
        onClick={onViewAll}
        type="button"
      >
        {t(language, "bestOfMonth.viewAll")}
      </button>
    </div>
  );
}
