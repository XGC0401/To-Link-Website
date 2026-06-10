"use client";

import { Search, UserRoundMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import {
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
  const [query, setQuery] = useState("");
  const [candidate, setCandidate] = useState<FriendCard | null>(null);

  const suggestions = useMemo(() => {
    if (!query) {
      return connections.friendSuggestions;
    }

    return [...connections.friendSuggestions, ...connections.friendList].filter((friend) =>
      `${friend.name} ${friend.username}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [connections.friendList, connections.friendSuggestions, query]);

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
              className="w-full bg-transparent outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(language, "friends.search")}
              value={query}
            />
          </label>
        }
      >
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
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
                </article>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
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
          </div>
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