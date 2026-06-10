"use client";

import { Heart, MessageCircle, Plus, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import {
  appendPersistedProfileHistory,
  createPersistedPost,
  deletePersistedPost,
  likePersistedPost,
  usePersistedCurrentUserProfile,
  usePersistedPosts,
} from "@/hooks/use-persisted-app-data";
import { formatAppDateTime } from "@/lib/date";
import {
  cloudinarySetupHint,
  uploadFilesToCloudinary,
  validateMediaSelection,
} from "@/lib/media-upload";
import { autoTranslateText, formatDualLanguageText } from "@/lib/translation";
import { t } from "@/lib/translations";
import { useToLink } from "@/lib/app-state";
import type { FeedItem, PostCategory } from "@/lib/types";
import { cn, formatCurrency, truncate } from "@/lib/utils";

type PostsMode = "all" | PostCategory;

const sortOptions: Record<PostsMode, Array<{ label: string; value: string }>> = {
  all: [
    { label: "latest", value: "latest" },
    { label: "oldest", value: "oldest" },
  ],
  sharing: [
    { label: "deadline", value: "deadline" },
    { label: "latest", value: "latest" },
    { label: "oldest", value: "oldest" },
  ],
  secondHand: [
    { label: "lowestPrice", value: "lowestPrice" },
    { label: "deadline", value: "deadline" },
    { label: "latest", value: "latest" },
    { label: "highestPrice", value: "highestPrice" },
    { label: "oldest", value: "oldest" },
  ],
  lostFound: [
    { label: "highestReward", value: "highestReward" },
    { label: "deadline", value: "deadline" },
    { label: "latest", value: "latest" },
    { label: "lowestReward", value: "lowestReward" },
    { label: "oldest", value: "oldest" },
  ],
  quest: [
    { label: "highestReward", value: "highestReward" },
    { label: "deadline", value: "deadline" },
    { label: "latest", value: "latest" },
    { label: "lowestReward", value: "lowestReward" },
    { label: "oldest", value: "oldest" },
  ],
};

export function PostsScreen({ mode }: { mode: PostsMode }) {
  const { language } = useToLink();
  const posts = usePersistedPosts();
  const { profile } = usePersistedCurrentUserProfile();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[mode][0]?.value ?? "latest");
  const [showOthersOnly, setShowOthersOnly] = useState(true);
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerDescription, setComposerDescription] = useState("");
  const [composerTags, setComposerTags] = useState("");
  const [composerTimeRange, setComposerTimeRange] = useState("");
  const [composerPriceReward, setComposerPriceReward] = useState("");
  const [composerSubmitting, setComposerSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<FeedItem | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!deleteCandidate) {
      return;
    }

    if (countdown === 0) {
      return;
    }

    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, deleteCandidate]);

  const filteredItems = useMemo(() => {
    return posts.items
      .filter((item) => (mode === "all" ? true : item.category === mode))
      .filter((item) => {
        if (!showOthersOnly) {
          return item.owner;
        }

        return !item.owner;
      })
      .filter((item) => {
        const haystack = [item.title, item.description, item.tags.join(" "), item.createdAt]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((left, right) => sortItems(left, right, sort));
  }, [mode, posts.items, query, showOthersOnly, sort]);

  const pageTitle = {
    all: t(language, "posts.pageTitle.all"),
    sharing: t(language, "posts.pageTitle.sharing"),
    secondHand: t(language, "posts.pageTitle.secondHand"),
    lostFound: t(language, "posts.pageTitle.lostFound"),
    quest: t(language, "posts.pageTitle.quest"),
  }[mode];

  function openDeleteDialog(item: FeedItem) {
    setCountdown(3);
    setDeleteCandidate(item);
  }

  function closeComposer() {
    setComposerFiles([]);
    setComposerTitle("");
    setComposerDescription("");
    setComposerTags("");
    setComposerTimeRange("");
    setComposerPriceReward("");
    setComposerOpen(false);
  }

  function closeDeleteDialog() {
    setCountdown(3);
    setDeleteCandidate(null);
  }

  function handleComposerFileSelection(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const validation = validateMediaSelection(fileList);

    if (!validation.valid) {
      toast.error(validation.errors[0] ?? "Invalid media selection.");
      return;
    }

    setComposerFiles(validation.files);
    toast.success(`${validation.files.length} media file(s) selected.`);
  }

  async function handleComposerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!composerTitle.trim() || !composerDescription.trim()) {
      toast.error("Please complete both title and description.");
      return;
    }

    setComposerSubmitting(true);

    try {
      const [translatedTitle, translatedDescription] = await Promise.all([
        autoTranslateText(composerTitle),
        autoTranslateText(composerDescription),
      ]);

      const uploads = composerFiles.length
        ? await uploadFilesToCloudinary(composerFiles)
        : [];

      const translatedTitleText = formatDualLanguageText(
        translatedTitle.originalText,
        translatedTitle.translatedText,
        translatedTitle.sourceLanguage,
      );
      const translatedDescriptionText = formatDualLanguageText(
        translatedDescription.originalText,
        translatedDescription.translatedText,
        translatedDescription.sourceLanguage,
      );
      const category: PostCategory = mode === "all" ? "sharing" : mode;
      const parsedPriceReward = Number.parseFloat(composerPriceReward);
      const parsedTags = composerTags
        .split(/[\s,]+/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      await createPersistedPost({
        id: `${category}-${Date.now()}`,
        category,
        title: translatedTitleText,
        description: translatedDescriptionText,
        tags: parsedTags.length ? parsedTags : ["translated"],
        authorName: profile.name,
        authorAvatar: profile.avatar,
        createdAt: new Date().toISOString(),
        edited: false,
        likes: 0,
        comments: 0,
        owner: true,
        expiresAt: composerTimeRange.trim() || undefined,
        price:
          (category === "secondHand" || category === "lostFound") && Number.isFinite(parsedPriceReward)
            ? parsedPriceReward
            : undefined,
        reward: category === "quest" && Number.isFinite(parsedPriceReward) ? parsedPriceReward : undefined,
      });

      toast.success(
        uploads.length
          ? `Post created with automatic translation and ${uploads.length} Cloudinary upload(s).`
          : "Post created with automatic translation.",
      );
      closeComposer();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : cloudinarySetupHint);
    } finally {
      setComposerSubmitting(false);
    }
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "posts.pageDesc")}
        title={pageTitle}
        toolbar={
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
            <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t(language, "posts.search")}
                value={query}
              />
            </label>
            <select
              className="app-input rounded-full px-4 py-3 text-sm"
              onChange={(event) => setSort(event.target.value)}
              value={sort}
            >
              {sortOptions[mode].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className={cn(
                "rounded-full border px-4 py-3 text-sm font-medium transition",
                showOthersOnly
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-panel-strong text-foreground",
              )}
              onClick={() => setShowOthersOnly((current) => !current)}
              type="button"
            >
              {showOthersOnly ? t(language, "posts.hideYourPosts") : t(language, "posts.showYourPosts")}
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-strong"
              onClick={() => setComposerOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              {mode === "all"
                ? t(language, "posts.createPost")
                : mode === "quest"
                  ? t(language, "posts.createQuest")
                  : mode === "sharing"
                    ? t(language, "posts.createSharing")
                    : mode === "secondHand"
                      ? t(language, "posts.create2ndHand")
                      : t(language, "posts.createLostFound")}
            </button>
          </div>
        }
      >
        <div className="grid h-full grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="flex min-h-72 flex-col rounded-[28px] border border-border bg-panel-strong p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {mode === "all" ? (
                      <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                        {item.category}
                      </span>
                    ) : null}
                    {item.edited ? (
                      <span className="rounded-full bg-panel px-3 py-1 text-[11px] text-muted">{t(language, "common.edited")}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
                </div>
                <button
                  className="rounded-full p-2 text-muted transition hover:bg-panel hover:text-foreground"
                  onClick={() => toast(t(language, "toast.reportBlock"))}
                  type="button"
                >
                  <ShieldAlert className="h-4 w-4" />
                </button>
              </div>

              <button className="mt-3 text-left" onClick={() => setSelected(item)} type="button">
                <p className="text-sm leading-7 text-muted">{truncate(item.description, 145)}</p>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent-strong">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-5 text-xs text-muted">
                <p>{formatAppDateTime(item.createdAt, language)}</p>
                {item.reward ? <p className="mt-1">{t(language, "posts.reward")} {formatCurrency(item.reward)}</p> : null}
                {typeof item.price === "number" ? <p className="mt-1">{t(language, "posts.price")} {formatCurrency(item.price)}</p> : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(item.category === "sharing" || mode === "all") && item.category === "sharing" ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                    onClick={() => {
                      void likePersistedPost(item.id);
                    }}
                    type="button"
                  >
                    <Heart className="h-3.5 w-3.5" /> {item.likes}
                  </button>
                ) : null}

                {(item.category === "sharing" || item.category === "quest") ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                    onClick={() => setSelected(item)}
                    type="button"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {item.comments}
                  </button>
                ) : null}

                {item.owner ? (
                  <button
                    className="ml-auto inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                    onClick={() => openDeleteDialog(item)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t(language, "common.delete")}
                  </button>
                ) : null}

                {!item.owner && item.category === "quest" ? (
                  <button
                    className="ml-auto rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                    onClick={() => toast.success(t(language, "toast.questApplied"))}
                    type="button"
                  >
                    {t(language, "posts.acceptQuest")}
                  </button>
                ) : null}

                {!item.owner && item.category === "secondHand" ? (
                  <button
                    className="ml-auto rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                    onClick={() => toast.success(t(language, "toast.tradeIntent"))}
                    type="button"
                  >
                    {item.price === 0 ? t(language, "posts.get") : t(language, "posts.trade")}
                  </button>
                ) : null}

                {!item.owner && item.category === "lostFound" ? (
                  <div className="ml-auto flex flex-wrap gap-2">
                    <button
                      className="rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                      onClick={() => toast.success(t(language, "toast.ownerChat"))}
                      type="button"
                    >
                      {t(language, "posts.contactOwner")}
                    </button>
                    <button
                      className="rounded-full bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong"
                      onClick={() => toast.success(t(language, "toast.clueForm"))}
                      type="button"
                    >
                      {t(language, "posts.clues")}
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </FeatureShell>

      <Modal onClose={closeComposer} open={composerOpen} title={t(language, "posts.createPost")}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleComposerSubmit}>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.title")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              maxLength={100}
              onChange={(event) => setComposerTitle(event.target.value)}
              value={composerTitle}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.description")}</span>
            <textarea
              className="app-input min-h-36 w-full rounded-[24px] px-4 py-3"
              maxLength={2000}
              onChange={(event) => setComposerDescription(event.target.value)}
              value={composerDescription}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "posts.tags")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setComposerTags(event.target.value)}
              placeholder={t(language, "posts.tagsPlaceholder")}
              value={composerTags}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "posts.timeRange")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setComposerTimeRange(event.target.value)}
              placeholder={t(language, "posts.timeRangePlaceholder")}
              value={composerTimeRange}
            />
          </label>
          {mode === "secondHand" || mode === "lostFound" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "posts.priceReward")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) => setComposerPriceReward(event.target.value)}
                placeholder="0"
                value={composerPriceReward}
              />
            </label>
          ) : null}
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "posts.media")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              multiple
              onChange={(event) => handleComposerFileSelection(event.target.files)}
              type="file"
            />
          </label>
          {composerFiles.length ? (
            <p className="md:col-span-2 text-xs text-muted">
              {t(language, "posts.selectedFiles").replace("{n}", String(composerFiles.length))}
            </p>
          ) : null}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeComposer}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              disabled={composerSubmitting}
              type="submit"
            >
              {composerSubmitting ? t(language, "common.uploading") : t(language, "common.submit")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={selected?.title ?? "Detail"}>
        {selected ? (
          <div className="space-y-4 text-sm leading-7 text-muted">
            <p>{selected.description}</p>
            <div className="flex flex-wrap gap-2">
              {selected.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent-strong">
                  #{tag}
                </span>
              ))}
            </div>
            <p>
              {t(language, "posts.created")} {formatAppDateTime(selected.createdAt, language, { joiner: " ", weekday: "long" })}
            </p>
            {selected.expiresAt ? (
              <p>{t(language, "posts.timeLimit")} {formatAppDateTime(selected.expiresAt, language, { joiner: " " })}</p>
            ) : null}
            {selected.questState ? <p>{t(language, "posts.questState")} {selected.questState}</p> : null}
          </div>
        ) : null}
      </Modal>

      <Modal onClose={closeDeleteDialog} open={Boolean(deleteCandidate)} title={deleteCandidate?.category === "quest" ? t(language, "posts.deleteQuest") : t(language, "posts.deletePost")}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {deleteCandidate?.category === "quest"
              ? t(language, "posts.deleteQuestConfirm")
              : t(language, "posts.deleteConfirm")}
          </p>
          <div className="flex justify-between gap-3">
            <button
              className={cn(
                "rounded-full px-5 py-3 text-sm font-semibold text-white transition",
                countdown > 0 ? "cursor-not-allowed bg-rose-900/70" : "bg-rose-600 hover:bg-rose-700",
              )}
              disabled={countdown > 0}
              onClick={async () => {
                if (!deleteCandidate) {
                  return;
                }

                const removed = await deletePersistedPost(deleteCandidate.id);

                if (removed) {
                  await appendPersistedProfileHistory({
                    id: `history-${removed.id}`,
                    title: removed.title,
                    category: removed.category,
                    deletedAt: new Date().toISOString(),
                  });
                }

                toast.success(t(language, "toast.itemDeleted"));
                closeDeleteDialog();
              }}
              type="button"
            >
              {countdown > 0 ? `${t(language, "common.delete")} (${countdown})` : t(language, "common.delete")}
            </button>
            <button
              className="rounded-full bg-panel px-5 py-3 text-sm font-semibold text-muted"
              onClick={closeDeleteDialog}
              type="button"
            >
              {t(language, "common.no")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function sortItems(left: FeedItem, right: FeedItem, sort: string) {
  if (sort === "latest") {
    return right.createdAt.localeCompare(left.createdAt);
  }
  if (sort === "oldest") {
    return left.createdAt.localeCompare(right.createdAt);
  }
  if (sort === "deadline") {
    return (left.expiresAt ?? left.createdAt).localeCompare(right.expiresAt ?? right.createdAt);
  }
  if (sort === "highestReward") {
    return (right.reward ?? 0) - (left.reward ?? 0);
  }
  if (sort === "lowestReward") {
    return (left.reward ?? 0) - (right.reward ?? 0);
  }
  if (sort === "highestPrice") {
    return (right.price ?? 0) - (left.price ?? 0);
  }
  if (sort === "lowestPrice") {
    return (left.price ?? 0) - (right.price ?? 0);
  }
  return 0;
}