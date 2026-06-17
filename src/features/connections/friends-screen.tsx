"use client";

import { RefreshCw, Search, UserRoundMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { useAdminUsersList } from "@/hooks/use-admin-users-list";
import { Modal } from "@/components/ui/modal";
import {
  addPersistedFriend,
  getAvatarLabel,
  openPersistedDirectChat,
  removePersistedFriend,
  useDeletedUserIds,
  usePersistedConnections,
  usePersistedCurrentUserProfile,
} from "@/hooks/use-persisted-app-data";
import { getFirebaseServices } from "@/lib/firebase";
import { t } from "@/lib/translations";
import type { FriendCard } from "@/lib/types";

export function FriendsScreen() {
  const { language } = useToLink();
  const router = useRouter();
  const connections = usePersistedConnections();
  const { users } = useAdminUsersList();
  const { profile } = usePersistedCurrentUserProfile();
  const deletedUserIds = useDeletedUserIds();
  const [query, setQuery] = useState("");
  const [candidate, setCandidate] = useState<FriendCard | null>(null);
  const services = getFirebaseServices();
  const currentUserId = services?.auth.currentUser?.uid ?? profile.id;

  const realAccounts = useMemo(
    () =>
      users
        .map((user) => {
          const displayName = user.name || `${user.firstName} ${user.lastName}`.trim();
          return {
            avatar: getAvatarLabel(displayName),
            bio: user.bio || user.jobTitle || "",
            id: user.id,
            name: displayName,
            status: (user.status === "online" || user.status === "offline" || user.status === "busy" ? user.status : "offline") as "online" | "offline" | "busy",
            username: user.username || user.email.split("@")[0] || user.id,
          };
        })
        .filter((user) => Boolean(user.name || user.username))
        .filter((user) => !deletedUserIds.has(user.id)),
    [users, deletedUserIds],
  );

  const friendIds = useMemo(() => new Set(connections.friendList.map((friend) => friend.id)), [connections.friendList]);
  
  // Get admin IDs
  const adminIds = useMemo(() => new Set(realAccounts.filter((user) => {
    const userFromList = users.find(u => u.id === user.id);
    return userFromList?.role === "admin";
  }).map((admin) => admin.id)), [realAccounts, users]);

  const suggestions = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    let combined = [...connections.friendSuggestions, ...realAccounts];

    // If current user is admin, show all non-friend users
    // If current user is not admin, show admins and regular suggestions
    if (profile.role === "admin") {
      // Show all non-friend users for admin
      return [...new Map(combined.map((friend) => [friend.id, friend])).values()]
        .filter((friend) => !friendIds.has(friend.id))
        .filter((friend) => (currentUserId ? friend.id !== currentUserId : true)) // Exclude current user when known
        .filter((friend) => {
          if (!searchTerm) {
            return true;
          }

          return `${friend.name} ${friend.username}`.toLowerCase().includes(searchTerm);
        });
    } else {
      // For non-admin users, add admins to suggestions automatically
      const adminFriends = realAccounts.filter(user => adminIds.has(user.id));
      combined = [...combined, ...adminFriends];
      
      return [...new Map(combined.map((friend) => [friend.id, friend])).values()]
        .filter((friend) => !friendIds.has(friend.id))
        .filter((friend) => (currentUserId ? friend.id !== currentUserId : true)) // Exclude current user when known
        .filter((friend) => {
          if (!searchTerm) {
            return true;
          }

          return `${friend.name} ${friend.username}`.toLowerCase().includes(searchTerm);
        });
    }
  }, [connections.friendSuggestions, friendIds, query, realAccounts, currentUserId, profile.role, adminIds, users]);

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
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition hover:border-accent/40 hover:text-accent"
                onClick={() => connections.refresh()}
                title={language === "zh-HK" ? "重新整理" : "Refresh"}
                type="button"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
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
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition hover:border-accent/40 hover:text-accent"
                onClick={() => connections.refresh()}
                title={language === "zh-HK" ? "重新整理" : "Refresh"}
                type="button"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-3">
                {connections.friendList.map((friend) => {
                  const isDeleted = deletedUserIds.has(friend.id);
                  return (
                <article key={friend.id} className="rounded-[26px] border border-border bg-panel-strong p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {friend.avatar}
                      <span className={friend.status === "online" ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" : friend.status === "busy" ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" : "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-zinc-400"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{friend.name}</p>
                        {isDeleted ? (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                            {language === "zh-HK" ? "已刪除帳號" : "Deleted User"}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted">@{friend.username}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{friend.bio}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => { void handleOpenChat(friend); }}
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
                  );
              })}
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