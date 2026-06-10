"use client";

import { Edit3, Plus, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import {
  savePersistedAiConversations,
  usePersistedAiConversations,
  usePersistedCurrentUserProfile,
} from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";
import type { ChatMessage, Language } from "@/lib/types";

const DAILY_QUESTION_LIMIT = 20;

function createChatMessage(
  content: string,
  inbound: boolean,
  language: Language,
  senderName?: string,
  senderAvatar?: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    senderName: inbound ? t(language, "ai.senderName") : senderName ?? "User",
    senderAvatar: inbound ? "AI" : senderAvatar ?? "U",
    kind: "text",
    content,
    sentAt: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    inbound,
  };
}

export function AIChatScreen() {
  const { language } = useToLink();
  const aiData = usePersistedAiConversations();
  const { profile } = usePersistedCurrentUserProfile();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const conversations = aiData.conversations;
  const remainingQuestions = aiData.remainingQuestions ?? DAILY_QUESTION_LIMIT;

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? conversations[0],
    [activeId, conversations],
  );

  async function handleSendMessage() {
    const message = draft.trim();

    if (!message || !activeConversation || isSending) {
      return;
    }

    if (remainingQuestions <= 0) {
      toast.error(t(language, "toast.dailyLimitReached"));
      return;
    }

    const conversationId = activeConversation.id;
    const userMessage = createChatMessage(message, false, language, profile.name, profile.avatar);

    setDraft("");
    setIsSending(true);

    const nextConversations = conversations.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      const nextMessages = [...conversation.messages, userMessage];

      return {
        ...conversation,
        title:
          conversation.messages.length === 0
            ? message.slice(0, 36) || conversation.title
            : conversation.title,
        messages: nextMessages,
      };
    });

    await savePersistedAiConversations({
      conversations: nextConversations,
      remainingQuestions,
    });

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          history: activeConversation.messages.map((conversationMessage) => ({
            content: conversationMessage.content,
            role: conversationMessage.inbound ? "assistant" : "user",
          })),
          message,
        }),
      });

      const payload = (await response.json()) as { error?: string; reply?: string };

      if (!response.ok || !payload.reply) {
        throw new Error(payload.error ?? "The AI assistant did not return a response.");
      }

      const assistantMessage = createChatMessage(payload.reply, true, language);
      const finalConversations = nextConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, assistantMessage],
            }
          : conversation,
      );

      await savePersistedAiConversations({
        conversations: finalConversations,
        remainingQuestions: Math.max(remainingQuestions - 1, 0),
      });
    } catch (error) {
      setDraft(message);
      toast.error(error instanceof Error ? error.message : "The AI assistant request failed.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <FeatureShell
      description={t(language, "ai.pageDesc")}
      title="AI Chat"
    >
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="flex min-h-0 flex-col rounded-[28px] border border-border bg-panel-strong p-4">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
            disabled={conversations.length >= 10}
            onClick={async () => {
              if (conversations.length >= 10) {
                toast.error(t(language, "toast.chatHistoryLimit"));
                return;
              }

              const nextId = `ai-${conversations.length + 1}`;
              await savePersistedAiConversations({
                conversations: [
                  {
                    id: nextId,
                    title: `New chat ${conversations.length + 1}`,
                    createdAt: new Date().toISOString(),
                    messages: [],
                  },
                  ...conversations,
                ],
                remainingQuestions,
              });
              setActiveId(nextId);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            {t(language, "ai.createNewChat")} ({conversations.length}/10)
          </button>

          <div className="mt-4 min-h-0 space-y-3 overflow-y-auto pr-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={conversation.id === activeConversation?.id ? "rounded-[24px] border border-accent bg-accent-soft p-4" : "rounded-[24px] border border-border bg-panel p-4"}
              >
                <button className="w-full text-left" onClick={() => setActiveId(conversation.id)} type="button">
                  <p className="font-semibold text-foreground">{conversation.title}</p>
                  <p className="mt-1 text-sm text-muted">{new Date(conversation.createdAt).toLocaleString()}</p>
                </button>
                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded-full border border-border bg-white/60 px-3 py-2 text-xs font-semibold text-foreground"
                    onClick={() => toast.success(t(language, "toast.aiRenameFlow"))}
                    type="button"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="rounded-full border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                    onClick={async () => {
                      const next = conversations.filter((conversationItem) => conversationItem.id !== conversation.id);
                      await savePersistedAiConversations({
                        conversations: next.length ? next : [{ id: "ai-reset", title: "New chat 1", createdAt: new Date().toISOString(), messages: [] }],
                        remainingQuestions,
                      });
                      setActiveId(next[0]?.id ?? "ai-reset");
                    }}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-[28px] border border-border bg-panel-strong p-4">
          <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{activeConversation?.title}</h3>
              <p className="text-sm text-muted">{t(language, "ai.remainingQuestions")} {remainingQuestions}</p>
            </div>
            <span className="rounded-full bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong">
              {t(language, "ai.liveWebhook")}
            </span>
          </div>

          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {activeConversation?.messages.length ? (
              activeConversation.messages.map((message) => (
                <div key={message.id} className={message.inbound ? "flex justify-start" : "flex justify-end"}>
                  <div className={message.inbound ? "max-w-[80%] rounded-[24px] border border-border bg-panel px-4 py-3 text-sm text-foreground" : "max-w-[80%] rounded-[24px] bg-accent px-4 py-3 text-sm text-white"}>
                    <p className="leading-7">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-panel px-6 py-8 text-sm leading-7 text-muted">
                {t(language, "ai.startConversation")}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <textarea
              className="app-input min-h-16 flex-1 rounded-[24px] px-4 py-3 text-sm"
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t(language, "ai.inputPlaceholder")}
              value={draft}
            />
            <button
              className="self-end rounded-full bg-accent p-3 text-white disabled:cursor-not-allowed disabled:bg-accent/55"
              disabled={!draft.trim() || isSending || remainingQuestions <= 0}
              onClick={handleSendMessage}
              type="button"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </FeatureShell>
  );
}