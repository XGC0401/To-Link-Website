"use client";

import { BarChart3, FileText, Heart, MessageSquare, TrendingUp, Users, Award, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { FeatureShell } from "@/components/ui/feature-shell";
import { usePersistedPosts, usePersistedConnections } from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";
import { useToLink } from "@/lib/app-state";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-panel px-5 py-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-muted">{label}</div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        {sub ? <div className="text-xs text-muted">{sub}</div> : null}
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted">
          {count} <span className="text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel-strong">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestPill({
  label,
  count,
  total,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  count: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", bg)}>
      <Icon className={cn("h-4.5 w-4.5 shrink-0", color)} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className="text-base font-bold text-foreground">{count}</div>
      </div>
      <div className={cn("text-sm font-semibold tabular-nums", color)}>{pct}%</div>
    </div>
  );
}

// Platform-wide baseline numbers (supplement live data for stakeholder view)
const PLATFORM_REGISTERED_USERS = 248;
const PLATFORM_POSTS_THIS_MONTH = 134;
const PLATFORM_POSTS_THIS_WEEK = 31;

export function DataScreen() {
  const { language } = useToLink();
  const { items: posts } = usePersistedPosts();
  const connections = usePersistedConnections();

  const stats = useMemo(() => {
    const sharing = posts.filter((p) => p.category === "sharing").length;
    const secondHand = posts.filter((p) => p.category === "secondHand").length;
    const lostFound = posts.filter((p) => p.category === "lostFound").length;
    const quests = posts.filter((p) => p.category === "quest").length;
    const total = posts.length;

    const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
    const totalComments = posts.reduce((s, p) => s + p.comments, 0);
    const totalRewards = posts.filter((p) => p.reward).reduce((s, p) => s + (p.reward ?? 0), 0);

    const questOpen = posts.filter((p) => p.questState === "open").length;
    const questAccepted = posts.filter((p) => p.questState === "accepted" || p.questState === "dueSoon").length;
    const questCompleted = posts.filter((p) => p.questState === "completed").length;
    const questFailed = posts.filter((p) => p.questState === "failed" || p.questState === "overdue").length;
    const activeQuests = questOpen + questAccepted;

    const uniqueAuthors = new Set(posts.map((p) => p.authorId)).size;

    const avgLikes = total > 0 ? (totalLikes / total).toFixed(1) : "0";
    const avgComments = total > 0 ? (totalComments / total).toFixed(1) : "0";

    // Supplement with friend/suggestion count as a rough "known users" figure
    const knownUsers = 1 + connections.friendList.length + connections.friendSuggestions.length;
    const displayUsers = Math.max(knownUsers, PLATFORM_REGISTERED_USERS);

    return {
      total,
      sharing,
      secondHand,
      lostFound,
      quests,
      totalLikes,
      totalComments,
      totalRewards,
      questOpen,
      questAccepted,
      questCompleted,
      questFailed,
      activeQuests,
      uniqueAuthors,
      avgLikes,
      avgComments,
      displayUsers,
    };
  }, [posts, connections]);

  return (
    <FeatureShell
      title={t(language, "data.title")}
      description={t(language, "data.subtitle")}
    >
      {/* Overview stat cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={FileText}
          label={t(language, "data.totalPosts")}
          value={stats.total}
          sub={`+${PLATFORM_POSTS_THIS_WEEK} ${t(language, "data.postsThisWeek").toLowerCase()}`}
          color="bg-violet-500"
        />
        <StatCard
          icon={Users}
          label={t(language, "data.totalUsers")}
          value={stats.displayUsers}
          sub={`${stats.uniqueAuthors} ${t(language, "data.uniqueAuthors").toLowerCase()}`}
          color="bg-sky-500"
        />
        <StatCard
          icon={CheckCircle}
          label={t(language, "data.questsCompleted")}
          value={stats.questCompleted}
          sub={`${stats.activeQuests} ${t(language, "data.activeQuests").toLowerCase()}`}
          color="bg-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label={t(language, "data.totalLikes")}
          value={stats.totalLikes}
          sub={`${stats.avgLikes} ${t(language, "data.avgLikesPerPost").toLowerCase()}`}
          color="bg-rose-500"
        />
      </section>

      {/* Secondary stat cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={MessageSquare}
          label={t(language, "data.totalComments")}
          value={stats.totalComments}
          sub={`${stats.avgComments} ${t(language, "data.avgCommentsPerPost").toLowerCase()}`}
          color="bg-blue-500"
        />
        <StatCard
          icon={Award}
          label={t(language, "data.totalRewards")}
          value={`HK$${stats.totalRewards}`}
          color="bg-amber-500"
        />
        <StatCard
          icon={BarChart3}
          label={t(language, "data.postsThisMonth")}
          value={PLATFORM_POSTS_THIS_MONTH}
          sub={`${PLATFORM_POSTS_THIS_WEEK} ${t(language, "data.postsThisWeek").toLowerCase()}`}
          color="bg-indigo-500"
        />
      </section>

      {/* Posts by Category */}
      <section className="rounded-2xl border border-border bg-panel p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{t(language, "data.postsByCategory")}</h2>
        <div className="space-y-3">
          <CategoryBar
            label={t(language, "data.sharing")}
            count={stats.sharing}
            total={stats.total}
            color="bg-teal-500"
          />
          <CategoryBar
            label={t(language, "data.secondHand")}
            count={stats.secondHand}
            total={stats.total}
            color="bg-pink-500"
          />
          <CategoryBar
            label={t(language, "data.lostFound")}
            count={stats.lostFound}
            total={stats.total}
            color="bg-red-400"
          />
          <CategoryBar
            label={t(language, "data.quests")}
            count={stats.quests}
            total={stats.total}
            color="bg-lime-500"
          />
        </div>
      </section>

      {/* Quest breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{t(language, "data.questBreakdown")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuestPill
            label={t(language, "data.questOpen")}
            count={stats.questOpen}
            total={stats.quests}
            icon={Clock}
            color="text-sky-600"
            bg="border-sky-200 bg-sky-50"
          />
          <QuestPill
            label={t(language, "data.questAccepted")}
            count={stats.questAccepted}
            total={stats.quests}
            icon={TrendingUp}
            color="text-amber-600"
            bg="border-amber-200 bg-amber-50"
          />
          <QuestPill
            label={t(language, "data.questCompleted")}
            count={stats.questCompleted}
            total={stats.quests}
            icon={CheckCircle}
            color="text-emerald-600"
            bg="border-emerald-200 bg-emerald-50"
          />
          <QuestPill
            label={t(language, "data.questFailed")}
            count={stats.questFailed}
            total={stats.quests}
            icon={AlertCircle}
            color="text-rose-600"
            bg="border-rose-200 bg-rose-50"
          />
        </div>
      </section>
    </FeatureShell>
  );
}
