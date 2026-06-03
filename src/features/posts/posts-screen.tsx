"use client";

import { Heart, MessageCircle, Plus, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { postFeed } from "@/lib/demo-data";
import { formatAppDateTime } from "@/lib/date";
import {
  cloudinarySetupHint,
  uploadFilesToCloudinary,
  validateMediaSelection,
} from "@/lib/media-upload";
import { useToLink } from "@/lib/app-state";
import type { FeedItem, PostCategory } from "@/lib/types";
import { cn, formatCurrency, truncate } from "@/lib/utils";

type PostsMode = "all" | PostCategory;

const sortOptions: Record<PostsMode, Array<{ label: string; value: string }>> = {
  all: [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
  ],
  sharing: [
    { label: "Time Limited", value: "deadline" },
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
  ],
  secondHand: [
    { label: "Cheapest", value: "lowestPrice" },
    { label: "Time Limited", value: "deadline" },
    { label: "Latest", value: "latest" },
    { label: "Most Expensive", value: "highestPrice" },
    { label: "Oldest", value: "oldest" },
  ],
  lostFound: [
    { label: "Highest Reward", value: "highestReward" },
    { label: "Time Limited", value: "deadline" },
    { label: "Latest", value: "latest" },
    { label: "Least Reward", value: "lowestReward" },
    { label: "Oldest", value: "oldest" },
  ],
  quest: [
    { label: "Highest Reward", value: "highestReward" },
    { label: "Time Limited", value: "deadline" },
    { label: "Latest", value: "latest" },
    { label: "Least Reward", value: "lowestReward" },
    { label: "Oldest", value: "oldest" },
  ],
};

export function PostsScreen({ mode }: { mode: PostsMode }) {
  const { language } = useToLink();
  const [items, setItems] = useState(postFeed);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[mode][0]?.value ?? "latest");
  const [showOthersOnly, setShowOthersOnly] = useState(true);
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
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
    return items
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
  }, [items, mode, query, showOthersOnly, sort]);

  const pageTitle = {
    all: "Posts",
    sharing: "Sharing",
    secondHand: "2nd Hand",
    lostFound: "Lost & Find",
    quest: "Quest Board",
  }[mode];

  function openDeleteDialog(item: FeedItem) {
    setCountdown(3);
    setDeleteCandidate(item);
  }

  function closeComposer() {
    setComposerFiles([]);
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
    setComposerSubmitting(true);

    try {
      const uploads = composerFiles.length
        ? await uploadFilesToCloudinary(composerFiles)
        : [];

      toast.success(
        uploads.length
          ? `Post draft prepared with ${uploads.length} Cloudinary upload(s).`
          : "Post draft prepared without media uploads.",
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
        description="Search, sort, and manage community content with route-specific actions and moderation controls."
        title={pageTitle}
        toolbar={
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
            <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, description, tags, or time"
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
              {showOthersOnly ? "Hide Your Posts" : "Show Your Posts"}
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-strong"
              onClick={() => setComposerOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              {mode === "all"
                ? "Create Post"
                : mode === "quest"
                  ? "Create Quest"
                  : mode === "sharing"
                    ? "Create Sharing Post"
                    : mode === "secondHand"
                      ? "Create 2nd Hand Post"
                      : "Create Lost & Find Post"}
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
                      <span className="rounded-full bg-panel px-3 py-1 text-[11px] text-muted">edited</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
                </div>
                <button
                  className="rounded-full p-2 text-muted transition hover:bg-panel hover:text-foreground"
                  onClick={() => toast("Report and block actions are ready for admin wiring.")}
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
                {item.reward ? <p className="mt-1">Reward: {formatCurrency(item.reward)}</p> : null}
                {typeof item.price === "number" ? <p className="mt-1">Price: {formatCurrency(item.price)}</p> : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(item.category === "sharing" || mode === "all") && item.category === "sharing" ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                    onClick={() => {
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === item.id ? { ...entry, likes: entry.likes + 1 } : entry,
                        ),
                      );
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
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                ) : null}

                {!item.owner && item.category === "quest" ? (
                  <button
                    className="ml-auto rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                    onClick={() => toast.success("Quest application special message sent to requester chat.")}
                    type="button"
                  >
                    Accept Quest
                  </button>
                ) : null}

                {!item.owner && item.category === "secondHand" ? (
                  <button
                    className="ml-auto rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                    onClick={() => toast.success("Trade intent message sent to the seller.")}
                    type="button"
                  >
                    {item.price === 0 ? "Get" : "Trade"}
                  </button>
                ) : null}

                {!item.owner && item.category === "lostFound" ? (
                  <div className="ml-auto flex flex-wrap gap-2">
                    <button
                      className="rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                      onClick={() => toast.success("Owner chat opened in the Connections area.")}
                      type="button"
                    >
                      Contact Owner
                    </button>
                    <button
                      className="rounded-full bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong"
                      onClick={() => toast.success("Clue form prepared in the detail view.")}
                      type="button"
                    >
                      Clues
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </FeatureShell>

      <Modal onClose={closeComposer} open={composerOpen} title="Create post">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleComposerSubmit}>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" maxLength={100} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Description</span>
            <textarea className="app-input min-h-36 w-full rounded-[24px] px-4 py-3" maxLength={2000} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Tags</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="Type tag + Enter" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Time range</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="Today 13:00 to 20:00" />
          </label>
          {mode === "secondHand" || mode === "lostFound" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Price / Reward</span>
              <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="0" />
            </label>
          ) : null}
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Media</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              multiple
              onChange={(event) => handleComposerFileSelection(event.target.files)}
              type="file"
            />
          </label>
          {composerFiles.length ? (
            <p className="md:col-span-2 text-xs text-muted">
              Selected {composerFiles.length} media file(s) for Cloudinary upload.
            </p>
          ) : null}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeComposer}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              disabled={composerSubmitting}
              type="submit"
            >
              {composerSubmitting ? "Uploading..." : "Submit"}
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
              Created: {formatAppDateTime(selected.createdAt, language, { joiner: " ", weekday: "long" })}
            </p>
            {selected.expiresAt ? (
              <p>Time limit: {formatAppDateTime(selected.expiresAt, language, { joiner: " " })}</p>
            ) : null}
            {selected.questState ? <p>Quest state: {selected.questState}</p> : null}
          </div>
        ) : null}
      </Modal>

      <Modal onClose={closeDeleteDialog} open={Boolean(deleteCandidate)} title={deleteCandidate?.category === "quest" ? "Delete quest" : "Delete post"}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {deleteCandidate?.category === "quest"
              ? "Are you sure you want to delete this quest?"
              : "Are you sure you want to delete this post?"}
          </p>
          <div className="flex justify-between gap-3">
            <button
              className={cn(
                "rounded-full px-5 py-3 text-sm font-semibold text-white transition",
                countdown > 0 ? "cursor-not-allowed bg-rose-900/70" : "bg-rose-600 hover:bg-rose-700",
              )}
              disabled={countdown > 0}
              onClick={() => {
                if (!deleteCandidate) {
                  return;
                }
                setItems((current) => current.filter((entry) => entry.id !== deleteCandidate.id));
                toast.success("Item moved to history in Profile Settings.");
                closeDeleteDialog();
              }}
              type="button"
            >
              {countdown > 0 ? `Delete (${countdown})` : "Delete"}
            </button>
            <button
              className="rounded-full bg-panel px-5 py-3 text-sm font-semibold text-muted"
              onClick={closeDeleteDialog}
              type="button"
            >
              No
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