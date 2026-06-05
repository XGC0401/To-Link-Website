"use client";

import { Languages, Search, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { chatRooms, currentUser, friendList } from "@/lib/demo-data";
import { autoTranslateText } from "@/lib/translation";
import { t } from "@/lib/translations";
import { truncate } from "@/lib/utils";

export function MessagesScreen() {
  const { language } = useToLink();
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState(chatRooms);
  const [activeRoomId, setActiveRoomId] = useState(chatRooms[0]?.id);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [shownTranslations, setShownTranslations] = useState<Record<string, boolean>>({});
  const [translatingMessages, setTranslatingMessages] = useState<Record<string, boolean>>({});

  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.title.toLowerCase().includes(query.toLowerCase())),
    [query, rooms],
  );
  const activeRoom = filteredRooms.find((room) => room.id === activeRoomId) ?? filteredRooms[0];

  function getMessageKey(roomId: string, messageId: string) {
    return `${roomId}:${messageId}`;
  }

  async function handleToggleTranslation(roomId: string, messageId: string, content: string) {
    const key = getMessageKey(roomId, messageId);

    if (translatingMessages[key]) {
      return;
    }

    if (translatedMessages[key]) {
      setShownTranslations((current) => ({ ...current, [key]: !current[key] }));
      return;
    }

    setTranslatingMessages((current) => ({ ...current, [key]: true }));

    try {
      const result = await autoTranslateText(content);
      setTranslatedMessages((current) => ({ ...current, [key]: result.translatedText }));
      setShownTranslations((current) => ({ ...current, [key]: true }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to translate this message.",
      );
    } finally {
      setTranslatingMessages((current) => ({ ...current, [key]: false }));
    }
  }

  async function handleSendMessage() {
    if (!activeRoom || !draft.trim()) {
      return;
    }

    setSending(true);

    try {
      const content = draft.trim();
      const sentAt = new Date().toLocaleTimeString("en-HK", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setRooms((current) =>
        current.map((room) => {
          if (room.id !== activeRoom.id) {
            return room;
          }

          return {
            ...room,
            preview: truncate(content.replace(/\s+/g, " "), 80),
            messages: [
              ...room.messages,
              {
                id: `msg-local-${Date.now()}`,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar,
                kind: "text",
                content,
                sentAt,
                inbound: false,
              },
            ],
          };
        }),
      );

      setDraft("");
      toast.success(t(language, "toast.messageSent"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "messages.pageDesc")}
        title="Messages"
        toolbar={
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
            <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t(language, "messages.search")}
                value={query}
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              onClick={() => setComposerOpen(true)}
              type="button"
            >
              <Users className="h-4 w-4" />
              {t(language, "messages.createGroup")}
            </button>
          </div>
        }
      >
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="space-y-3">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  className={room.id === activeRoom?.id ? "flex w-full items-center gap-3 rounded-[24px] border border-accent bg-accent-soft p-4 text-left" : "flex w-full items-center gap-3 rounded-[24px] border border-border bg-panel-strong p-4 text-left"}
                  onClick={() => setActiveRoomId(room.id)}
                  type="button"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {room.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-foreground">{room.title}</p>
                      {room.unreadCount > 0 ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                          {room.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">{room.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-border bg-panel-strong p-4">
            <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{activeRoom?.title}</h3>
                <p className="text-sm text-muted">{activeRoom?.group ? t(language, "messages.groupChat") : t(language, "messages.directMessage")}</p>
              </div>
            </div>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {activeRoom?.messages.map((message) => (
                <div key={message.id} className={message.inbound ? "flex justify-start" : "flex justify-end"}>
                  {(() => {
                    const translationKey = getMessageKey(activeRoom.id, message.id);
                    const translated = translatedMessages[translationKey];
                    const showTranslated = shownTranslations[translationKey] && Boolean(translated);
                    const isTranslating = Boolean(translatingMessages[translationKey]);

                    return (
                  <div className={message.accentLabel ? "max-w-[80%] rounded-[24px] border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground" : message.inbound ? "max-w-[80%] rounded-[24px] border border-border bg-panel px-4 py-3 text-sm text-foreground" : "max-w-[80%] rounded-[24px] bg-accent px-4 py-3 text-sm text-white"}>
                    {message.accentLabel ? <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-strong">{message.accentLabel}</p> : null}
                    <p className="leading-7">{showTranslated ? translated : message.content}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        className={message.inbound ? "inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-accent/40 hover:text-accent" : "inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 transition hover:bg-white/20"}
                        disabled={isTranslating}
                        onClick={() => handleToggleTranslation(activeRoom.id, message.id, message.content)}
                        type="button"
                      >
                        <Languages className="h-3 w-3" />
                        {isTranslating ? t(language, "messages.translating") : showTranslated ? t(language, "messages.original") : t(language, "messages.translate")}
                      </button>
                      <p className={message.inbound ? "text-xs text-muted" : "text-xs text-white/80"}>{message.sentAt}</p>
                    </div>
                  </div>
                    );
                  })()}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <textarea
                className="app-input min-h-16 flex-1 rounded-[24px] px-4 py-3 text-sm"
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t(language, "messages.write")}
                value={draft}
              />
              <button
                className="self-end rounded-full bg-accent p-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={sending || !draft.trim()}
                onClick={handleSendMessage}
                type="button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </FeatureShell>

      <Modal onClose={() => setComposerOpen(false)} open={composerOpen} title={t(language, "messages.createGroup")}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            Add at least 3 people including the current user. Suggestions are pulled from the friends list for now.
          </p>
          <div className="space-y-3">
            {friendList.map((friend) => (
              <label key={friend.id} className="flex items-center gap-3 rounded-[22px] border border-border bg-panel px-4 py-3">
                <input type="checkbox" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {friend.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{friend.name}</p>
                  <p className="text-sm text-muted">@{friend.username}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setComposerOpen(false)}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              onClick={() => {
                toast.success("Group chat draft created.");
                setComposerOpen(false);
              }}
              type="button"
            >
              {t(language, "messages.createGroup")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}