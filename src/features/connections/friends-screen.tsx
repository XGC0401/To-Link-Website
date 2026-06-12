"use client";

import { Search, UserRoundMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { useAdminUsersList } from "@/hooks/use-admin-users-list";
import { Modal } from "@/components/ui/modal";
import {
  addPersistedFriend,
  openPersistedDirectChat,
  removePersistedFriend,
  usePersistedConnections,
} from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";
import type { FriendCard } from "@/lib/types";

export function FriendsScreen() {
  const { language } = useToLink();
  const router = useRouter();
  const connections = usePersistedConnections();
  const { users } = useAdminUsersList();
  const [query, setQuery] = useState("");
  const [candidate, setCandidate] = useState<FriendCard | null>(null);

  const realAccounts = useMemo(
    () =>
      users
        .map((user) => ({
          avatar: user.avatar || "U",
          bio: user.bio || user.jobTitle || "",
          id: user.id,
          name: user.name || `${user.firstName} ${user.lastName}`.trim(),
          status: user.status,
          username: user.username,
        }))
        .filter((user) => Boolean(user.name || user.username)),
    [users],
  );

  const friendIds = useMemo(() => new Set(connections.friendList.map((friend) => friend.id)), [connections.friendList]);

  const suggestions = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    const combined = [...connections.friendSuggestions, ...realAccounts];

    return [...new Map(combined.map((friend) => [friend.id, friend])).values()]
      .filter((friend) => !friendIds.has(friend.id))
      .filter((friend) => {
        if (!searchTerm) {
          return true;
        }

        return `${friend.name} ${friend.username}`.toLowerCase().includes(searchTerm);
      });
  }, [connections.friendSuggestions, friendIds, query, realAccounts]);

  async function handleOpenChat(friend: FriendCard) {
    const roomId = await openPersistedDirectChat({
      memberProfiles: [
        {
          avatar: friend.avatar,
          id: friend.id,
          name: friend.name,
          status: friend.status,
          username: friend.username,
        },
      ],
      title: friend.name,
    });

    if (!roomId) {
      toast.error(language === "zh-HK" ? "暫時無法開啟私訊。" : "Unable to open the direct message right now.");
      return;
    }

    router.push(`/connections/messages?room=${encodeURIComponent(roomId)}`);
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "friends.pageDesc")}
        title={t(language, "nav.connections.friends")}
        toolbar={
          <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
            <Search className="h-4 w-4 text-muted" />
            <input
              autoComplete="username"
              className="w-full bg-transparent outline-none"
              id="friend-search-input"
              name="friend-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(language, "friends.search")}
              type="search"
              value={query}
            />
          </label>
        }
      >
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="min-h-0 overflow-y-auto pr-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                {language === "zh-HK" ? "好友建議" : "Friend suggestions"}
              </h3>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {language === "zh-HK" ? "左側" : "Left panel"}
              </span>
            </div>
            <div className="space-y-3">
              {suggestions.map((friend) => (
                <article key={friend.id} className="rounded-[26px] border border-border bg-panel-strong p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {friend.avatar}
                      <span className={friend.status === "online" ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" : friend.status === "busy" ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" : "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-zinc-400"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{friend.name}</p>
                      <p className="text-sm text-muted">@{friend.username}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{friend.bio}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        void handleOpenChat(friend);
                      }}
                      type="button"
                    >
                      {t(language, "common.message")}
                    </button>
                    <button
                      className="rounded-full border border-accent/30 bg-panel px-4 py-2 text-sm font-semibold text-accent"
                      onClick={async () => {
                        const saved = await addPersistedFriend(friend);

                        if (!saved) {
                          toast.error(language === "zh-HK" ? "無法加為好友。" : "Unable to add this person as a friend.");
                          return;
                        }

                        toast.success(language === "zh-HK" ? `${friend.name} 已加入好友名單。` : `${friend.name} added to your friends.`);
                      }}
                      type="button"
                    >
                      {language === "zh-HK" ? "加好友" : "Add friend"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto pr-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                {language === "zh-HK" ? "已是好友" : "Your friends"}
              </h3>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {language === "zh-HK" ? "右側" : "Right panel"}
              </span>
            </div>
            <div className="space-y-3">
                {connections.friendList.map((friend) => (
                <article key={friend.id} className="rounded-[26px] border border-border bg-panel-strong p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {friend.avatar}
                      <span className={friend.status === "online" ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" : friend.status === "busy" ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" : "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-zinc-400"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{friend.name}</p>
                      <p className="text-sm text-muted">@{friend.username}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{friend.bio}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        void handleOpenChat(friend);
                      }}
                      type="button"
                    >
                      {t(language, "common.message")}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                      onClick={() => setCandidate(friend)}
                      type="button"
                    >
                      <UserRoundMinus className="h-4 w-4" />
                      {t(language, "friends.unfriend")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </FeatureShell>

      <Modal onClose={() => setCandidate(null)} open={Boolean(candidate)} title={t(language, "friends.unfriendTitle")}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">{t(language, "friends.unfriendConfirm")}</p>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setCandidate(null)}
              type="button"
            >
              {t(language, "common.no")}
            </button>
            <button
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
              onClick={async () => {
                if (!candidate) {
                  return;
                }

                await removePersistedFriend(candidate.id);
                toast.success(
                  language === "zh-HK"
                    ? `${candidate.name} 已從好友名單移除。`
                    : `${candidate.name} removed from the friend list.`,
                );
                setCandidate(null);
              }}
              type="button"
            >
              {t(language, "common.yes")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}