"use client";

import { Languages, MoreHorizontal, Pencil, Search, Send, Trash2, Users, Paperclip, Settings2, X } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import {
  createPersistedGroupChat,
  deletePersistedChatRoom,
  deletePersistedMessage,
  editPersistedMessage,
  renamePersistedChatRoom,
  sendPersistedMessage,
  usePersistedConnections,
  usePersistedCurrentUserProfile,
} from "@/hooks/use-persisted-app-data";
import { getFirebaseServices } from "@/lib/firebase";
import { autoTranslateText } from "@/lib/translation";
import { t } from "@/lib/translations";
import { validateMediaSelection, uploadFilesToCloudinary } from "@/lib/media-upload";
import type { MediaAttachment } from "@/lib/types";

export function MessagesScreen() {
  const { language } = useToLink();
  const searchParams = useSearchParams();
  const connections = usePersistedConnections();
  const { profile } = usePersistedCurrentUserProfile();
  const currentUserId = getFirebaseServices()?.auth.currentUser?.uid ?? profile.id;
  const [query, setQuery] = useState("");
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [shownTranslations, setShownTranslations] = useState<Record<string, boolean>>({});
  const [translatingMessages, setTranslatingMessages] = useState<Record<string, boolean>>({});
  const [roomMenuId, setRoomMenuId] = useState<string | null>(null);
  const [renamingRoom, setRenamingRoom] = useState<{ id: string; title: string } | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [messageMenuId, setMessageMenuId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return connections.chatRooms
      .filter((room) => room.title.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => getRoomActivityTimestamp(right) - getRoomActivityTimestamp(left));
  }, [connections.chatRooms, query]);
  const requestedRoomId = searchParams.get("room");
  const resolvedRoomId =
    activeRoomId ??
    (requestedRoomId && connections.chatRooms.some((room) => room.id === requestedRoomId)
      ? requestedRoomId
      : undefined);
  const activeRoom =
    filteredRooms.find((room) => room.id === resolvedRoomId) ??
    connections.chatRooms.find((room) => room.id === resolvedRoomId) ??
    filteredRooms[0];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoom?.messages]);

  function getMessageKey(roomId: string, messageId: string) {
    return `${roomId}:${messageId}`;
  }

  function getRoomPreview(room: (typeof connections.chatRooms)[number]) {
    const latestMessage = room.messages[room.messages.length - 1];
    const previewText = latestMessage?.content?.trim() || room.preview;

    return previewText.replace(/\s+/g, " ");
  }

  function getRoomActivityTimestamp(room: (typeof connections.chatRooms)[number]) {
    const updatedAtTimestamp = room.updatedAt ? Date.parse(room.updatedAt) : Number.NaN;

    if (Number.isFinite(updatedAtTimestamp)) {
      return updatedAtTimestamp;
    }

    const latestMessage = room.messages[room.messages.length - 1];

    if (!latestMessage) {
      return 0;
    }

    const messageIdTimestampMatch = latestMessage.id.match(/(\d{10,})/);

    if (messageIdTimestampMatch) {
      const idTimestamp = Number(messageIdTimestampMatch[1]);

      if (Number.isFinite(idTimestamp)) {
        return idTimestamp;
      }
    }

    const clockMatch = latestMessage.sentAt.match(/^(\d{1,2}):(\d{2})$/);

    if (clockMatch) {
      const now = new Date();
      const local = new Date(now);
      local.setHours(Number(clockMatch[1]), Number(clockMatch[2]), 0, 0);
      return local.getTime();
    }

    return 0;
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

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;
    if (!files) return;

    const validation = validateMediaSelection(files);
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setUploadingMedia(true);
    try {
      const uploadedAssets = await uploadFilesToCloudinary(Array.from(files));
      const newAttachments: MediaAttachment[] = uploadedAssets.map((asset) => ({
        url: asset.secureUrl,
        type: asset.resourceType === "video" ? "video" : asset.resourceType === "image" ? "image" : "file",
        filename: asset.originalFilename,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload media");
    } finally {
      setUploadingMedia(false);
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSendMessage() {
    if (!activeRoom || (!draft.trim() && attachments.length === 0)) {
      return;
    }

    setSending(true);

    try {
      const normalizedDraft = draft.replace(/\r\n?/g, "\n");
      const content = normalizedDraft.trim();
      const sentAt = new Date().toLocaleTimeString("en-HK", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const sent = await sendPersistedMessage(activeRoom.id, {
        id: `msg-local-${Date.now()}`,
        senderName: profile.name,
        senderAvatar: profile.avatar,
        senderId: currentUserId,
        kind: "text",
        content: content || "(Sent media)",
        sentAt,
        inbound: false,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (!sent) {
        throw new Error(
          language === "zh-HK"
            ? "暫時無法發送訊息。"
            : "Unable to send the message right now.",
        );
      }

      setDraft("");
      setAttachments([]);
      toast.success(t(language, "toast.messageSent"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description=""
        title=""
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
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="space-y-3">
              {filteredRooms.map((room) => (
                <div key={room.id} className="relative">
                  <button
                    className={room.id === activeRoom?.id ? "flex w-full items-center gap-3 rounded-[24px] border border-accent bg-accent-soft p-4 pr-12 text-left" : "flex w-full items-center gap-3 rounded-[24px] border border-border bg-panel-strong p-4 pr-12 text-left"}
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
                      <p className="mt-1 truncate text-sm text-muted">{getRoomPreview(room)}</p>
                    </div>
                  </button>
                  <div className="absolute right-3 top-3">
                    <button
                      aria-label={t(language, "messages.roomOptions")}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-panel/90 text-muted transition hover:border-accent/40 hover:bg-panel hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); setRoomMenuId(roomMenuId === room.id ? null : room.id); }}
                      type="button"
                    >
                      <Settings2 className="h-4 w-4" />
                    </button>
                    {roomMenuId === room.id && (
                      <div className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-2xl border border-border bg-panel shadow-lg">
                        <button
                          className="flex w-full items-center gap-2 rounded-t-2xl px-4 py-3 text-sm text-foreground hover:bg-accent-soft"
                          onClick={() => { setRenamingRoom({ id: room.id, title: room.title }); setRenameDraft(room.title); setRoomMenuId(null); }}
                          type="button"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t(language, "messages.renameRoom")}
                        </button>
                        <button
                          className="flex w-full items-center gap-2 rounded-b-2xl px-4 py-3 text-sm text-red-500 hover:bg-red-500/10"
                          onClick={async () => { setRoomMenuId(null); await deletePersistedChatRoom(room.id); if (activeRoom?.id === room.id) setActiveRoomId(undefined); }}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t(language, "messages.deleteRoom")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
                <div
                  key={message.id}
                  className={
                    (message.senderId ? message.senderId !== currentUserId : message.inbound)
                      ? "flex justify-start"
                      : "flex justify-end"
                  }
                >
                  {(() => {
                    const translationKey = getMessageKey(activeRoom.id, message.id);
                    const translated = translatedMessages[translationKey];
                    const showTranslated = shownTranslations[translationKey] && Boolean(translated);
                    const isTranslating = Boolean(translatingMessages[translationKey]);
                    const isInbound = message.senderId ? message.senderId !== currentUserId : message.inbound;

                    return (
                  <div className={message.accentLabel ? "max-w-[80%] rounded-[24px] border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground" : isInbound ? "max-w-[80%] rounded-[24px] border border-border bg-panel px-4 py-3 text-sm text-foreground" : "max-w-[80%] rounded-[24px] bg-accent px-4 py-3 text-sm text-white"}>
                    {message.accentLabel ? <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-strong">{message.accentLabel}</p> : null}
                    {message.deleted ? (
                      <p className="italic opacity-60">{t(language, "messages.messageDeleted")}</p>
                    ) : editingMessageId === message.id ? (
                      <div className="space-y-2">
                        <textarea
                          autoFocus
                          className="w-full rounded-xl border border-border bg-panel px-3 py-2 text-sm text-foreground outline-none"
                          onChange={(e) => setEditDraft(e.target.value)}
                          rows={3}
                          value={editDraft}
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white"
                            onClick={async () => { if (editDraft.trim()) { await editPersistedMessage(activeRoom.id, message.id, editDraft); } setEditingMessageId(null); setEditDraft(""); }}
                            type="button"
                          >
                            {t(language, "common.save")}
                          </button>
                          <button
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                            onClick={() => { setEditingMessageId(null); setEditDraft(""); }}
                            type="button"
                          >
                            {t(language, "common.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap break-words leading-7">{showTranslated ? translated : message.content}</p>
                        {message.editedAt ? (
                          <span className={isInbound ? "text-[11px] text-muted/70" : "text-[11px] text-white/50"}>{t(language, "messages.edited")}</span>
                        ) : null}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx}>
                                {attachment.type === "image" ? (
                                  <img
                                    alt={attachment.filename}
                                    className="max-w-full rounded-lg"
                                    src={attachment.url}
                                  />
                                ) : attachment.type === "video" ? (
                                  <video
                                    className="max-w-full rounded-lg"
                                    controls
                                    src={attachment.url}
                                  />
                                ) : (
                                  <a
                                    className="flex items-center gap-3 rounded-xl border border-border bg-panel-soft px-3 py-2 text-sm text-foreground hover:border-accent/40 hover:bg-accent-soft"
                                    href={attachment.url}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">FILE</span>
                                    <span className="truncate">{attachment.filename}</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {!message.deleted && editingMessageId !== message.id && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        className={isInbound ? "inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-accent/40 hover:text-accent" : "inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 transition hover:bg-white/20"}
                        disabled={isTranslating}
                        onClick={() => handleToggleTranslation(activeRoom.id, message.id, message.content)}
                        type="button"
                      >
                        <Languages className="h-3 w-3" />
                        {isTranslating ? t(language, "messages.translating") : showTranslated ? t(language, "messages.original") : t(language, "messages.translate")}
                      </button>
                      <div className="flex items-center gap-1">
                        <p className={isInbound ? "text-xs text-muted" : "text-xs text-white/80"}>{message.sentAt}</p>
                        {!isInbound && (
                          <div className="relative">
                            <button
                              className="rounded-full p-1 text-white/60 transition hover:text-white"
                              onClick={() => setMessageMenuId(messageMenuId === message.id ? null : message.id)}
                              type="button"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                            {messageMenuId === message.id && (
                              <div className="absolute bottom-full right-0 z-20 mb-1 min-w-32 rounded-2xl border border-border bg-panel shadow-lg">
                                <button
                                  className="flex w-full items-center gap-2 rounded-t-2xl px-4 py-3 text-sm text-foreground hover:bg-accent-soft"
                                  onClick={() => { setEditingMessageId(message.id); setEditDraft(message.content); setMessageMenuId(null); }}
                                  type="button"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  {t(language, "messages.editMessage")}
                                </button>
                                <button
                                  className="flex w-full items-center gap-2 rounded-b-2xl px-4 py-3 text-sm text-red-500 hover:bg-red-500/10"
                                  onClick={async () => { setMessageMenuId(null); await deletePersistedMessage(activeRoom.id, message.id); }}
                                  type="button"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {t(language, "messages.deleteMessage")}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                    );
                  })()}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 space-y-3">
              {attachments.length > 0 && (
                <div className="space-y-2 rounded-lg border border-border bg-panel-soft p-3">
                  <p className="text-xs font-semibold text-muted">
                    {t(language, "messages.attachments").replace("{n}", String(attachments.length))}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment, idx) => (
                      <div key={idx} className="relative inline-block">
                        {attachment.type === "image" ? (
                          <img
                            alt={attachment.filename}
                            className="h-16 w-16 rounded object-cover"
                            src={attachment.url}
                          />
                        ) : attachment.type === "video" ? (
                          <div className="flex h-16 w-16 items-center justify-center rounded bg-muted/30">
                            <span className="text-xs font-semibold text-muted">Video</span>
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded bg-accent/10">
                            <span className="text-[10px] font-semibold text-accent">DOC</span>
                          </div>
                        )}
                        <button
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                          onClick={() => removeAttachment(idx)}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <input
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                  hidden
                  id="message-file-upload"
                  name="message-media"
                  multiple
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  type="file"
                />
                <textarea
                  className="app-input min-h-16 flex-1 rounded-[24px] px-4 py-3 text-sm"
                  id="message-input"
                  name="message-content"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={t(language, "messages.write")}
                  value={draft}
                />
                <div className="flex flex-col gap-2 self-end">
                  <button
                    className="rounded-full border border-border bg-panel p-3 text-muted transition hover:border-accent/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={uploadingMedia}
                    onClick={() => fileInputRef.current?.click()}
                    title={t(language, "messages.attachMedia")}
                    type="button"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-full bg-accent p-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={sending || (!draft.trim() && attachments.length === 0)}
                    onClick={handleSendMessage}
                    type="button"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FeatureShell>

      <Modal onClose={() => { setRenamingRoom(null); setRenameDraft(""); }} open={renamingRoom !== null} title={t(language, "messages.renameRoom")}>
        <div className="space-y-4">
          <input
            className="app-input w-full rounded-[20px] px-4 py-3"
            onChange={(e) => setRenameDraft(e.target.value)}
            placeholder={renamingRoom?.title ?? ""}
            value={renameDraft}
          />
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => { setRenamingRoom(null); setRenameDraft(""); }}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              onClick={async () => { if (renamingRoom && renameDraft.trim()) { await renamePersistedChatRoom(renamingRoom.id, renameDraft); } setRenamingRoom(null); setRenameDraft(""); }}
              type="button"
            >
              {t(language, "common.save")}
            </button>
          </div>
        </div>
      </Modal>

      <Modal onClose={() => setComposerOpen(false)} open={composerOpen} title={t(language, "messages.createGroup")}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {language === "zh-HK"
              ? "請至少加入 3 人（包括自己）。目前成員名單會先從好友列表提供。"
              : "Add at least 3 people including the current user. Suggestions are pulled from the friends list for now."}
          </p>
          <input
            className="app-input w-full rounded-[20px] px-4 py-3"
            onChange={(event) => setGroupName(event.target.value)}
            placeholder={language === "zh-HK" ? "群組名稱" : "Group name"}
            value={groupName}
          />
          <div className="space-y-3">
            {connections.friendList.map((friend) => (
              <label key={friend.id} className="flex items-center gap-3 rounded-[22px] border border-border bg-panel px-4 py-3">
                <input
                  checked={selectedFriendIds.includes(friend.id)}
                  onChange={() =>
                    setSelectedFriendIds((current) =>
                      current.includes(friend.id)
                        ? current.filter((id) => id !== friend.id)
                        : [...current, friend.id],
                    )
                  }
                  type="checkbox"
                />
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
              onClick={async () => {
                if (selectedFriendIds.length < 2) {
                  toast.error(language === "zh-HK" ? "請至少選擇兩位好友。" : "Select at least two friends.");
                  return;
                }

                const selectedFriends = connections.friendList.filter((friend) =>
                  selectedFriendIds.includes(friend.id),
                );
                const roomId = await createPersistedGroupChat({
                  groupName: groupName.trim(),
                  members: selectedFriends.map((friend) => ({
                      avatar: friend.avatar,
                      id: friend.id,
                      name: friend.name,
                      status: friend.status,
                      username: friend.username,
                    })),
                });

                if (!roomId) {
                  toast.error(language === "zh-HK" ? "暫時無法建立群組對話。" : "Unable to create the group chat right now.");
                  return;
                }

                setActiveRoomId(roomId);
                setGroupName("");
                setSelectedFriendIds([]);
                toast.success(language === "zh-HK" ? "群組對話已建立。" : "Group chat created.");
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