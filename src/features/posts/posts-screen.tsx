"use client";

import { Ban, Flag, Heart, MessageCircle, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import {
  addPersistedBlockedUser,
  addPersistedLostFoundLead,
  addPersistedPostComment,
  appendPersistedProfileHistory,
  confirmPersistedQuestCompletion,
  createPersistedPost,
  deletePersistedPost,
  likePersistedPost,
  openPersistedDirectChat,
  reviewPersistedLostFoundLead,
  reviewPersistedQuestApplication,
  submitPersistedModerationReport,
  submitPersistedQuestApplication,
  updatePersistedPost,
  usePersistedBlockedUsers,
  usePersistedCurrentUserProfile,
  usePersistedPosts,
} from "@/hooks/use-persisted-app-data";
import { useToLink } from "@/lib/app-state";
import { formatAppDateTime } from "@/lib/date";
import {
  cloudinarySetupHint,
  uploadFilesToCloudinary,
  validateMediaSelection,
} from "@/lib/media-upload";
import { formatPostCategory, formatQuestState } from "@/lib/seeded-content-localization";
import { autoTranslateText, formatDualLanguageText } from "@/lib/translation";
import { t } from "@/lib/translations";
import type { FeedItem, LostFoundLead, PostCategory, QuestApplication } from "@/lib/types";
import { cn, formatCurrency, truncate } from "@/lib/utils";

type PostsMode = "all" | PostCategory;
type SortOptionLabel =
  | "deadline"
  | "highestPrice"
  | "highestReward"
  | "latest"
  | "lowestPrice"
  | "lowestReward"
  | "oldest";

type PostActor = {
  avatar: string;
  id: string;
  name: string;
};

type BlockContext = {
  post: FeedItem;
  user: PostActor;
};

type LeadReviewContext = {
  lead: LostFoundLead;
  post: FeedItem;
};

type ReportContext = {
  post: FeedItem;
  user: PostActor;
};

const sortOptions: Record<PostsMode, Array<{ label: SortOptionLabel; value: string }>> = {
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posts = usePersistedPosts();
  const blockedUsers = usePersistedBlockedUsers();
  const { profile } = usePersistedCurrentUserProfile();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[mode][0]?.value ?? "latest");
  const [includeOwnPosts, setIncludeOwnPosts] = useState(false);
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const justClosedItemIdRef = useRef<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
  const [composerPreviews, setComposerPreviews] = useState<Array<{ url: string; isImage: boolean; name: string }>>([]);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerDescription, setComposerDescription] = useState("");
  const [composerTags, setComposerTags] = useState<string[]>([]);
  const [composerTagInput, setComposerTagInput] = useState("");
  const [composerTimeRange, setComposerTimeRange] = useState("");
  const [composerPriceReward, setComposerPriceReward] = useState("");
  const [composerSubmitting, setComposerSubmitting] = useState(false);
  const [editCandidate, setEditCandidate] = useState<FeedItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [editTimeRange, setEditTimeRange] = useState("");
  const [editPriceReward, setEditPriceReward] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [questReasonDraft, setQuestReasonDraft] = useState("");
  const [questDecisionDrafts, setQuestDecisionDrafts] = useState<Record<string, string>>({});
  const [questSubmitting, setQuestSubmitting] = useState(false);
  const [questDecisionSubmittingId, setQuestDecisionSubmittingId] = useState<string | null>(null);
  const [questFinishSubmittingId, setQuestFinishSubmittingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<FeedItem | null>(null);
  const [leadCandidate, setLeadCandidate] = useState<FeedItem | null>(null);
  const [leadKind, setLeadKind] = useState<"clue" | "found">("clue");
  const [leadWhereSeen, setLeadWhereSeen] = useState("");
  const [leadWhenSeen, setLeadWhenSeen] = useState("");
  const [leadDetails, setLeadDetails] = useState("");
  const [leadPhotoNames, setLeadPhotoNames] = useState<string[]>([]);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadReviewContext, setLeadReviewContext] = useState<LeadReviewContext | null>(null);
  const [leadReviewSubmitting, setLeadReviewSubmitting] = useState(false);
  const [blockContext, setBlockContext] = useState<BlockContext | null>(null);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [reportContext, setReportContext] = useState<ReportContext | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const blockedUserIds = useMemo(
    () => new Set(blockedUsers.items.map((item) => item.id)),
    [blockedUsers.items],
  );

  const selectedComments = selected ? getDisplayedCommentEntries(selected, language) : [];
  const selectedAcceptedQuestApplication = selected ? getAcceptedQuestApplication(selected) : undefined;
  const selectedViewerQuestApplication = selected ? getViewerQuestApplication(selected, profile.id) : undefined;
  const selectedQuestApplications = selected ? getSortedQuestApplications(selected) : [];
  const selectedLostFoundLeads = selected ? getSortedLostFoundLeads(selected) : [];

  useEffect(() => {
    const highlightedItemId = searchParams.get("item");

    if (!highlightedItemId) {
      return;
    }

    // If the user just closed this item, don't reopen it immediately.
    if (justClosedItemIdRef.current && justClosedItemIdRef.current === highlightedItemId) {
      justClosedItemIdRef.current = null;
      return;
    }

    const highlightedItem = posts.items.find(
      (item) => item.id === highlightedItemId && (mode === "all" ? true : item.category === mode),
    );

    if (!highlightedItem || selected?.id === highlightedItem.id) {
      return;
    }

    queueMicrotask(() => {
      setSelected(highlightedItem);
      setPostMenuId(null);

      if (!searchParams.has("item")) {
        const nextSearchParams = new URLSearchParams(searchParams.toString());
        nextSearchParams.set("item", highlightedItem.id);
        router.replace(`${pathname}?${nextSearchParams.toString()}`);
      }
    });
  }, [mode, posts.items, searchParams, selected?.id, pathname, router]);

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
      .filter((item) => !blockedUserIds.has(getPostAuthor(item).id))
      .filter((item) => (includeOwnPosts ? true : item.authorId !== profile.id))
      .filter((item) => {
        const haystack = [item.title, item.description, item.tags.join(" "), item.createdAt]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((left, right) => sortItems(left, right, sort));
  }, [blockedUserIds, includeOwnPosts, mode, posts.items, profile.id, query, sort]);

  const pageTitle = {
    all: t(language, "posts.pageTitle.all"),
    sharing: t(language, "posts.pageTitle.sharing"),
    secondHand: t(language, "posts.pageTitle.secondHand"),
    lostFound: t(language, "posts.pageTitle.lostFound"),
    quest: t(language, "posts.pageTitle.quest"),
  }[mode];

  const sortLabelMap: Record<SortOptionLabel, string> = {
    deadline: t(language, "posts.timeLimited"),
    highestPrice: t(language, "posts.mostExpensive"),
    highestReward: t(language, "posts.highestReward"),
    latest: t(language, "common.latest"),
    lowestPrice: t(language, "posts.cheapest"),
    lowestReward: t(language, "posts.lowestReward"),
    oldest: t(language, "common.oldest"),
  };

  function openDeleteDialog(item: FeedItem) {
    setCountdown(3);
    setDeleteCandidate(item);
    setPostMenuId(null);
  }

  function closeComposer() {
    for (const preview of composerPreviews) {
      URL.revokeObjectURL(preview.url);
    }
    setComposerPreviews([]);
    setComposerFiles([]);
    setComposerTitle("");
    setComposerDescription("");
    setComposerTags([]);
    setComposerTagInput("");
    setComposerTimeRange("");
    setComposerPriceReward("");
    setComposerOpen(false);
  }

  function openEditDialog(item: FeedItem) {
    setPostMenuId(null);
    setEditCandidate(item);
    setEditTitle(getEditablePostText(item.title));
    setEditDescription(getEditablePostText(item.description));
    setEditTags(item.tags);
    setEditTagInput("");
    setEditTimeRange(isoToDatetimeLocal(item.expiresAt ?? ""));
    setEditPriceReward(getEditablePostAmount(item));
  }

  function closeEditDialog() {
    setEditCandidate(null);
    setEditTitle("");
    setEditDescription("");
    setEditTags([]);
    setEditTagInput("");
    setEditTimeRange("");
    setEditPriceReward("");
  }

  function openSelectedDialog(item: FeedItem) {
    setSelected(item);
    setPostMenuId(null);

    if (!searchParams.has("item")) {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set("item", item.id);
      router.replace(`${pathname}?${nextSearchParams.toString()}`);
    }
  }

  const closeSelectedDialog = useCallback(() => {
    if (searchParams.has("item")) {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.delete("item");
      router.replace(nextSearchParams.size ? `${pathname}?${nextSearchParams.toString()}` : pathname);
    }

    setSelected(null);
    setCommentDraft("");
    setQuestReasonDraft("");
    setQuestDecisionDrafts({});
  }, [pathname, router, searchParams]);

  function closeDeleteDialog() {
    setDeleteCandidate(null);
    setCountdown(3);
  }

  function openLeadDialog(item: FeedItem, kind: "clue" | "found") {
    setLeadCandidate(item);
    setLeadKind(kind);
    setLeadWhereSeen("");
    setLeadWhenSeen("");
    setLeadDetails("");
    setLeadPhotoNames([]);
    setPostMenuId(null);
  }

  function closeLeadDialog() {
    setLeadCandidate(null);
    setLeadKind("clue");
    setLeadWhereSeen("");
    setLeadWhenSeen("");
    setLeadDetails("");
    setLeadPhotoNames([]);
  }

  function openReportDialog(item: FeedItem, user: PostActor) {
    setReportContext({ post: item, user });
    setReportReason("spam");
    setReportDetails("");
    setPostMenuId(null);
  }

  function closeReportDialog() {
    setReportContext(null);
    setReportReason("spam");
    setReportDetails("");
  }

  function openBlockDialog(item: FeedItem, user: PostActor) {
    setBlockContext({ post: item, user });
    setPostMenuId(null);
  }

  function closeBlockDialog() {
    setBlockContext(null);
  }

  function closeLeadReviewDialog() {
    setLeadReviewContext(null);
  }

  function handleComposerFileSelection(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);

    if (files.length > 5) {
      toast.error(language === "zh-HK" ? "最多只可選擇 5 個媒體檔案。" : "You can select up to 5 media files.");
      return;
    }

    const validation = validateMediaSelection(fileList);

    if (!validation.valid) {
      toast.error(validation.errors[0] ?? (language === "zh-HK" ? "所選媒體檔案無效。" : "Invalid media selection."));
      return;
    }

    // Revoke old preview URLs before creating new ones
    for (const preview of composerPreviews) {
      URL.revokeObjectURL(preview.url);
    }

    setComposerFiles(validation.files);
    setComposerPreviews(
      validation.files.map((file) => ({
        isImage: file.type.startsWith("image/"),
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    );
  }

  function handleLeadFileSelection(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);

    if (files.length > 3) {
      toast.error(language === "zh-HK" ? "最多只可附上 3 張照片。" : "You can attach up to 3 photos only.");
      return;
    }

    if (files.some((file) => !file.type.startsWith("image/"))) {
      toast.error(language === "zh-HK" ? "這裡目前只支援圖片。" : "Only image files are supported here.");
      return;
    }

    setLeadPhotoNames(files.map((file) => file.name));
  }

  async function handleComposerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!composerTitle.trim() || !composerDescription.trim()) {
      toast.error(language === "zh-HK" ? "請填妥標題及描述。" : "Please complete both title and description.");
      return;
    }

    setComposerSubmitting(true);

    try {
      const [translatedTitle, translatedDescription] = await Promise.all([
        autoTranslateText(composerTitle),
        autoTranslateText(composerDescription),
      ]);

      const uploads = composerFiles.length ? await uploadFilesToCloudinary(composerFiles) : [];
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

      await createPersistedPost({
        id: `${category}-${Date.now()}`,
        category,
        title: translatedTitleText,
        description: translatedDescriptionText,
        tags: composerTags.length ? composerTags : ["translated"],
        authorId: profile.id,
        authorName: profile.name,
        authorAvatar: profile.avatar,
        createdAt: new Date().toISOString(),
        edited: false,
        likes: 0,
        comments: 0,
        owner: true,
        mediaUrls: uploads.length > 0 ? uploads.map((u) => u.secureUrl) : undefined,
        expiresAt: composerTimeRange ? new Date(composerTimeRange).toISOString() : undefined,
        price:
          (category === "secondHand" || category === "lostFound") && Number.isFinite(parsedPriceReward)
            ? parsedPriceReward
            : undefined,
        reward: category === "quest" && Number.isFinite(parsedPriceReward) ? parsedPriceReward : undefined,
      });

      toast.success(
        uploads.length
          ? language === "zh-HK"
            ? `帖子已建立，已自動翻譯並上傳 ${uploads.length} 個 Cloudinary 檔案。`
            : `Post created with automatic translation and ${uploads.length} Cloudinary upload(s).`
          : language === "zh-HK"
            ? "帖子已建立並完成自動翻譯。"
            : "Post created with automatic translation.",
      );
      setIncludeOwnPosts(true);
      closeComposer();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : cloudinarySetupHint);
    } finally {
      setComposerSubmitting(false);
    }
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editCandidate) {
      return;
    }

    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error(language === "zh-HK" ? "請填妥標題及描述。" : "Please complete both title and description.");
      return;
    }

    setEditSubmitting(true);

    try {
      const [translatedTitle, translatedDescription] = await Promise.all([
        autoTranslateText(editTitle),
        autoTranslateText(editDescription),
      ]);
      const parsedPriceReward = Number.parseFloat(editPriceReward);
      const updated = await updatePersistedPost(editCandidate.id, {
        description: formatDualLanguageText(
          translatedDescription.originalText,
          translatedDescription.translatedText,
          translatedDescription.sourceLanguage,
        ),
        expiresAt: editTimeRange ? new Date(editTimeRange).toISOString() : undefined,
        price:
          editCandidate.category === "secondHand" || editCandidate.category === "lostFound"
            ? parsedPriceReward
            : Number.NaN,
        reward: editCandidate.category === "quest" ? parsedPriceReward : Number.NaN,
        tags: editTags,
        title: formatDualLanguageText(
          translatedTitle.originalText,
          translatedTitle.translatedText,
          translatedTitle.sourceLanguage,
        ),
      });

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法更新帖子。" : "Unable to update the post right now.");
        return;
      }

      setSelected((current) => (current?.id === updated.id ? updated : current));
      toast.success(t(language, "toast.itemUpdated"));
      closeEditDialog();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法更新帖子。"
            : "Unable to update the post right now.",
      );
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    const content = commentDraft.trim();

    if (!content) {
      toast.error(language === "zh-HK" ? "請先輸入留言內容。" : "Enter a comment first.");
      return;
    }

    setCommentSubmitting(true);

    try {
      const updated = await addPersistedPostComment(selected.id, {
        authorAvatar: profile.avatar,
        authorName: profile.name,
        content,
        createdAt: new Date().toISOString(),
        id: `comment-${selected.id}-${Date.now()}`,
      });

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法提交留言。" : "Unable to submit the comment right now.");
        return;
      }

      setSelected(updated);
      setCommentDraft("");
      toast.success(language === "zh-HK" ? "留言已提交。" : "Comment posted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法提交留言。"
            : "Unable to submit the comment right now.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  function createSentAtLabel() {
    return new Date().toLocaleTimeString("en-HK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  async function openPostConversation(item: FeedItem, message?: {
    accentLabel?: string;
    content: string;
    kind: "clue" | "questRequest" | "system" | "tradeIntent";
  }) {
    const roomId = await openPersistedDirectChat({
      members: [profile.name, item.authorName],
      message: message
        ? {
            id: `msg-action-${Date.now()}`,
            senderAvatar: profile.avatar,
            senderName: profile.name,
            inbound: false,
            sentAt: createSentAtLabel(),
            ...message,
          }
        : undefined,
      title: item.authorName,
    });

    if (!roomId) {
      toast.error(language === "zh-HK" ? "暫時無法開啟對話。" : "Unable to open the conversation right now.");
      return;
    }

    router.push(`/connections/messages?room=${encodeURIComponent(roomId)}`);
  }

  async function handleTradeAction(item: FeedItem) {
    await openPostConversation(item, {
      accentLabel: language === "zh-HK" ? "交易" : "Trade",
      content:
        language === "zh-HK"
          ? `我對這個項目有興趣：「${item.title}」。`
          : `I'm interested in this item: "${item.title}".`,
      kind: "tradeIntent",
    });
  }

  async function handleContactOwner(item: FeedItem) {
    await openPostConversation(item, {
      accentLabel: language === "zh-HK" ? "失物尋回" : "Lost & Found",
      content:
        language === "zh-HK"
          ? `我想聯絡你了解這則失物尋回帖文：「${item.title}」。`
          : `I'd like to follow up on this lost-and-found post: "${item.title}".`,
      kind: "system",
    });
  }

  async function handleQuestApplicationSubmit(item: FeedItem) {
    const capabilityReason = questReasonDraft.trim();

    if (!capabilityReason) {
      toast.error(
        language === "zh-HK"
          ? "請先簡單說明你為何適合接這個任務。"
          : "Explain briefly why you are capable of taking this quest.",
      );
      return;
    }

    if (item.questState === "completed") {
      toast.error(language === "zh-HK" ? "此任務已完成。" : "This quest is already completed.");
      return;
    }

    const acceptedApplication = getAcceptedQuestApplication(item);
    const viewerApplication = getViewerQuestApplication(item, profile.id);

    if (acceptedApplication && acceptedApplication.applicantId !== profile.id) {
      toast.error(language === "zh-HK" ? "此任務已有人接手。" : "This quest has already been assigned.");
      return;
    }

    if (viewerApplication?.status === "pending") {
      toast.error(language === "zh-HK" ? "你已提交申請，請等待審核。" : "You already applied. Please wait for review.");
      return;
    }

    if (isQuestApplicationInCooldown(viewerApplication)) {
      const cooldownLabel = viewerApplication?.cooldownUntil
        ? formatAppDateTime(viewerApplication.cooldownUntil, language, { joiner: " " })
        : null;

      toast.error(
        cooldownLabel
          ? language === "zh-HK"
            ? `請稍後再申請，冷卻至 ${cooldownLabel}。`
            : `Please wait before applying again. Cooldown until ${cooldownLabel}.`
          : language === "zh-HK"
            ? "請稍後再申請。"
            : "Please wait before applying again.",
      );
      return;
    }

    setQuestSubmitting(true);

    try {
      const updated = await submitPersistedQuestApplication(item.id, {
        applicantAvatar: profile.avatar,
        applicantId: profile.id,
        applicantName: profile.name,
        appliedAt: new Date().toISOString(),
        capabilityReason,
        id: `quest-application-${item.id}-${Date.now()}`,
        status: "pending",
      });

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法提交申請。" : "Unable to submit the application right now.");
        return;
      }

      setSelected(updated);
      setQuestReasonDraft("");
      toast.success(language === "zh-HK" ? "申請已送出，等待發帖人審核。" : "Application submitted and waiting for review.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法提交申請。"
            : "Unable to submit the application right now.",
      );
    } finally {
      setQuestSubmitting(false);
    }
  }

  async function handleQuestDecision(item: FeedItem, application: QuestApplication, decision: "accepted" | "denied") {
    if (decision === "accepted") {
      const acceptedApplication = getAcceptedQuestApplication(item);

      if (acceptedApplication && acceptedApplication.id !== application.id) {
        toast.error(language === "zh-HK" ? "此任務已有已接受的申請。" : "This quest already has an accepted application.");
        return;
      }
    }

    setQuestDecisionSubmittingId(application.id);

    try {
      const updated = await reviewPersistedQuestApplication(
        item.id,
        application.id,
        decision,
        questDecisionDrafts[application.id],
      );

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法更新任務申請。" : "Unable to update the quest application right now.");
        return;
      }

      setSelected(updated);
      setQuestDecisionDrafts((current) => {
        const next = { ...current };
        delete next[application.id];
        return next;
      });
      toast.success(
        decision === "accepted"
          ? language === "zh-HK"
            ? `已接受 ${application.applicantName} 的申請。`
            : `${application.applicantName}'s application was accepted.`
          : language === "zh-HK"
            ? `已拒絕 ${application.applicantName} 的申請。`
            : `${application.applicantName}'s application was declined.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法更新任務申請。"
            : "Unable to update the quest application right now.",
      );
    } finally {
      setQuestDecisionSubmittingId(null);
    }
  }

  async function handleQuestFinish(item: FeedItem, application: QuestApplication, actor: "owner" | "worker") {
    setQuestFinishSubmittingId(application.id);

    try {
      const updated = await confirmPersistedQuestCompletion(item.id, application.id, actor);

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法更新完成進度。" : "Unable to update the completion progress right now.");
        return;
      }

      const updatedAcceptedApplication = getAcceptedQuestApplication(updated);
      setSelected(updated);
      toast.success(
        updatedAcceptedApplication?.ownerFinished && updatedAcceptedApplication?.workerFinished
          ? language === "zh-HK"
            ? "任務已完成。"
            : "Quest completed."
          : language === "zh-HK"
            ? "已記錄你的完成確認。"
            : "Your completion confirmation has been recorded.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法更新完成進度。"
            : "Unable to update the completion progress right now.",
      );
    } finally {
      setQuestFinishSubmittingId(null);
    }
  }

  async function handleLeadSubmit() {
    if (!leadCandidate || !leadWhereSeen.trim() || !leadWhenSeen.trim()) {
      toast.error(
        language === "zh-HK"
          ? "請先填寫在哪裡看到及何時看到。"
          : "Please fill in where you saw the item and when you saw it.",
      );
      return;
    }

    setLeadSubmitting(true);

    try {
      const updated = await addPersistedLostFoundLead(leadCandidate.id, {
        authorAvatar: profile.avatar,
        authorId: profile.id,
        authorName: profile.name,
        details: leadDetails.trim() || undefined,
        id: `lost-found-lead-${leadCandidate.id}-${Date.now()}`,
        kind: leadKind,
        photoNames: leadPhotoNames,
        status: "pending",
        submittedAt: new Date().toISOString(),
        whenSeen: leadWhenSeen.trim(),
        whereSeen: leadWhereSeen.trim(),
      });

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法提交線索。" : "Unable to submit this update right now.");
        return;
      }

      setSelected((current) => (current?.id === updated.id ? updated : current));
      closeLeadDialog();
      toast.success(
        leadKind === "found"
          ? language === "zh-HK"
            ? `已送出${t(language, "posts.foundIt")}通知，等待物主確認。`
            : "Found-it notice sent and waiting for the owner to confirm."
          : language === "zh-HK"
            ? "線索已送出，等待物主回覆是否有幫助。"
            : "Clue submitted and waiting for the owner to mark whether it helped.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法提交線索。"
            : "Unable to submit this update right now.",
      );
    } finally {
      setLeadSubmitting(false);
    }
  }

  async function handleLeadHelpful(item: FeedItem, lead: LostFoundLead) {
    setLeadReviewSubmitting(true);

    try {
      const updated = await reviewPersistedLostFoundLead(item.id, lead.id, "helpful");

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法更新此線索。" : "Unable to update this lead right now.");
        return;
      }

      setSelected(updated);
      toast.success(
        lead.kind === "found"
          ? language === "zh-HK"
            ? "已標記為已找回。"
            : "Marked as recovered."
          : language === "zh-HK"
            ? "已標記為有幫助。"
            : "Marked as helpful.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法更新此線索。"
            : "Unable to update this lead right now.",
      );
    } finally {
      setLeadReviewSubmitting(false);
    }
  }

  async function persistBlockedUser(context: BlockContext, options?: { skipToast?: boolean }) {
    const blocked = await addPersistedBlockedUser({
      avatar: context.user.avatar,
      blockedAt: new Date().toISOString(),
      id: context.user.id,
      name: context.user.name,
    });

    if (!blocked) {
      toast.error(language === "zh-HK" ? "暫時無法封鎖此用戶。" : "Unable to block this user right now.");
      return false;
    }

    setSelected((current) => (current && getPostAuthor(current).id === context.user.id ? null : current));

    if (!options?.skipToast) {
      toast.success(
        language === "zh-HK"
          ? `已封鎖 ${context.user.name}，其帖子會從動態中隱藏。`
          : `${context.user.name} is now blocked and their posts will be hidden from your feed.`,
      );
    }

    return true;
  }

  async function handleConfirmBlock() {
    if (!blockContext) {
      return;
    }

    setBlockSubmitting(true);

    try {
      const blocked = await persistBlockedUser(blockContext);

      if (blocked) {
        closeBlockDialog();
      }
    } finally {
      setBlockSubmitting(false);
    }
  }

  async function handleLeadReviewDecision(action: "dismiss" | "report" | "reportBlock") {
    if (!leadReviewContext) {
      return;
    }

    setLeadReviewSubmitting(true);

    try {
      const updated = await reviewPersistedLostFoundLead(leadReviewContext.post.id, leadReviewContext.lead.id, "notHelpful");

      if (!updated) {
        toast.error(language === "zh-HK" ? "暫時無法更新此線索。" : "Unable to update this lead right now.");
        return;
      }

      setSelected(updated);

      if (action !== "dismiss") {
        await submitPersistedModerationReport({
          category: leadReviewContext.post.category,
          details: [
            language === "zh-HK"
              ? `線索提交者: ${leadReviewContext.lead.authorName}`
              : `Lead sender: ${leadReviewContext.lead.authorName}`,
            leadReviewContext.lead.details,
          ]
            .filter(Boolean)
            .join("\n\n"),
          postId: leadReviewContext.post.id,
          postTitle: leadReviewContext.post.title,
          reason: "lead-review",
          reporterName: profile.name,
        });
      }

      if (action === "reportBlock") {
        await persistBlockedUser(
          {
            post: leadReviewContext.post,
            user: {
              avatar: leadReviewContext.lead.authorAvatar,
              id: leadReviewContext.lead.authorId,
              name: leadReviewContext.lead.authorName,
            },
          },
          { skipToast: true },
        );
      }

      closeLeadReviewDialog();
      toast.success(
        action === "dismiss"
          ? language === "zh-HK"
            ? "已標記為無幫助。"
            : "Marked as not helpful."
          : action === "report"
            ? language === "zh-HK"
              ? "已標記為無幫助並提交檢舉。"
              : "Marked as not helpful and reported for review."
            : language === "zh-HK"
              ? "已標記為無幫助，並已檢舉及封鎖該用戶。"
              : "Marked as not helpful, reported, and the user was blocked.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法完成此操作。"
            : "Unable to complete this action right now.",
      );
    } finally {
      setLeadReviewSubmitting(false);
    }
  }

  async function handleSubmitReport(blockToo = false) {
    if (!reportContext) {
      return;
    }

    setReportSubmitting(true);

    try {
      await submitPersistedModerationReport({
        category: reportContext.post.category,
        details: [
          language === "zh-HK"
            ? `檢舉用戶: ${reportContext.user.name}`
            : `Reported user: ${reportContext.user.name}`,
          reportDetails.trim(),
        ]
          .filter(Boolean)
          .join("\n\n"),
        postId: reportContext.post.id,
        postTitle: reportContext.post.title,
        reason: reportReason,
        reporterName: profile.name,
      });

      if (blockToo) {
        await persistBlockedUser({ post: reportContext.post, user: reportContext.user }, { skipToast: true });
      }

      closeReportDialog();
      toast.success(
        blockToo
          ? language === "zh-HK"
            ? "檢舉已提交，並已封鎖該用戶。"
            : "Report submitted and the user has been blocked."
          : language === "zh-HK"
            ? "檢舉已提交，管理員將跟進。"
            : "Report submitted for moderator review.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "暫時無法提交檢舉。"
            : "Unable to submit the report right now.",
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "posts.pageDesc")}
        title={pageTitle}
        toolbar={
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:flex-wrap">
            <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm xl:min-w-[200px]">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t(language, "posts.search")}
                value={query}
              />
            </label>
            <select
              className="app-input rounded-full px-4 py-3 text-sm xl:min-w-[220px]"
              onChange={(event) => setSort(event.target.value)}
              value={sort}
            >
              {sortOptions[mode].map((option) => (
                <option key={option.value} value={option.value}>
                  {sortLabelMap[option.label]}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button
                className={cn(
                  "rounded-full border px-4 py-3 text-sm font-medium transition whitespace-normal",
                  includeOwnPosts
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-panel-strong text-foreground",
                )}
                onClick={() => setIncludeOwnPosts((current) => !current)}
                type="button"
              >
                {includeOwnPosts ? t(language, "posts.hideYourPosts") : t(language, "posts.showYourPosts")}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-strong whitespace-normal"
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
          </div>
        }
      >
        <div className="h-full overflow-y-auto pr-1 pb-2 space-y-6 xl:space-y-7">
          {filteredItems.map((item) => {
            const author = getPostAuthor(item);
            const likedByCurrentUser = Boolean(item.likedByUserIds?.includes(profile.id));
            const viewerQuestApplication = getViewerQuestApplication(item, profile.id);
            const acceptedQuestApplication = getAcceptedQuestApplication(item);
            const viewerAcceptedQuest = acceptedQuestApplication?.applicantId === profile.id || viewerQuestApplication?.status === "accepted";
            const questButtonLabel =
              item.questState === "completed"
                ? language === "zh-HK"
                  ? "已完成"
                  : "Completed"
                : viewerAcceptedQuest
                  ? language === "zh-HK"
                    ? "查看進度"
                    : "View progress"
                  : viewerQuestApplication?.status === "pending"
                    ? language === "zh-HK"
                      ? "申請已送出"
                      : "Pending"
                    : acceptedQuestApplication
                      ? language === "zh-HK"
                        ? "已有人接手"
                        : "Taken"
                      : t(language, "posts.acceptQuest");

            return (
              <article
                key={item.id}
                className="relative flex min-h-0 flex-col rounded-[28px] border border-border bg-panel-strong p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {mode === "all" ? (
                        <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                          {formatPostCategory(language, item.category)}
                        </span>
                      ) : null}
                      {item.edited ? (
                        <span className="rounded-full bg-panel px-3 py-1 text-[11px] text-muted">{t(language, "common.edited")}</span>
                      ) : null}
                      {item.category === "lostFound" && item.foundResolvedAt ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                          {language === "zh-HK" ? "已找回" : "Recovered"}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                  {item.authorId !== profile.id ? (
                    <div className="relative">
                      <button
                        className="rounded-full p-2 text-muted transition hover:bg-panel hover:text-foreground"
                        onClick={() => setPostMenuId((current) => (current === item.id ? null : item.id))}
                        type="button"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {postMenuId === item.id ? (
                        <div className="absolute right-0 top-10 z-10 flex w-44 flex-col rounded-[20px] border border-border bg-panel-strong p-2 shadow-xl">
                          <button
                            className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-panel"
                            onClick={() => openReportDialog(item, author)}
                            type="button"
                          >
                            <Flag className="h-4 w-4" />
                            {language === "zh-HK" ? "檢舉用戶" : "Report User"}
                          </button>
                          <button
                            className="flex items-center gap-2 rounded-[14px] px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                            onClick={() => openBlockDialog(item, author)}
                            type="button"
                          >
                            <Ban className="h-4 w-4" />
                            {language === "zh-HK" ? "封鎖用戶" : "Block User"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <button className="mt-3 text-left" onClick={() => openSelectedDialog(item)} type="button">
                  <p className="text-sm leading-7 text-muted">{truncate(item.description, 145)}</p>
                </button>

                {item.mediaUrls && item.mediaUrls.length > 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {item.mediaUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <img
                          alt=""
                          className="h-24 w-full rounded-[14px] object-cover"
                          src={url}
                        />
                      </a>
                    ))}
                  </div>
                ) : null}

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
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition hover:border-rose-300 hover:text-rose-600",
                        likedByCurrentUser
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-border bg-panel text-foreground",
                      )}
                      onClick={async () => {
                        const updated = await likePersistedPost(item.id);

                        if (updated && selected?.id === item.id) {
                          setSelected(updated);
                        }
                      }}
                      type="button"
                    >
                      <Heart className={cn("h-3.5 w-3.5", likedByCurrentUser && "fill-current")} /> {item.likes}
                    </button>
                  ) : null}

                  {(item.category === "sharing" || item.category === "quest") ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                      onClick={() => openSelectedDialog(item)}
                      type="button"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> {item.comments}
                    </button>
                  ) : null}

                  {item.authorId === profile.id ? (
                    <div className="ml-auto flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                        onClick={() => openEditDialog(item)}
                        type="button"
                      >
                        <Pencil className="h-3.5 w-3.5" /> {t(language, "common.edit")}
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                        onClick={() => openDeleteDialog(item)}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> {t(language, "common.delete")}
                      </button>
                    </div>
                  ) : null}

                  {item.authorId !== profile.id && item.category === "quest" ? (
                    <button
                      className="ml-auto rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                      onClick={() => openSelectedDialog(item)}
                      type="button"
                    >
                      {questButtonLabel}
                    </button>
                  ) : null}

                  {item.authorId !== profile.id && item.category === "secondHand" ? (
                    <button
                      className="ml-auto rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                      onClick={() => {
                        void handleTradeAction(item);
                      }}
                      type="button"
                    >
                      {item.price === 0 ? t(language, "posts.get") : t(language, "posts.trade")}
                    </button>
                  ) : null}

                  {item.authorId !== profile.id && item.category === "lostFound" ? (
                    <div className="ml-auto flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                        onClick={() => {
                          void handleContactOwner(item);
                        }}
                        type="button"
                      >
                        {t(language, "posts.contactOwner")}
                      </button>
                      <button
                        className="rounded-full bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong"
                        onClick={() => openLeadDialog(item, "clue")}
                        type="button"
                      >
                        {t(language, "posts.clues")}
                      </button>
                      <button
                        className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white whitespace-nowrap"
                        onClick={() => openLeadDialog(item, "found")}
                        type="button"
                      >
                        {t(language, "posts.foundIt")}
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
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
            <TagInput
              inputValue={composerTagInput}
              onChangeInput={setComposerTagInput}
              onChangeTags={setComposerTags}
              placeholder={t(language, "posts.tagsPlaceholder")}
              tags={composerTags}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "posts.timeRange")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              type="datetime-local"
              onChange={(event) => setComposerTimeRange(event.target.value)}
              value={composerTimeRange}
            />
          </label>
          {mode === "secondHand" || mode === "lostFound" || mode === "quest" ? (
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
          {composerPreviews.length > 0 ? (
            <div className="md:col-span-2 grid grid-cols-5 gap-2">
              {composerPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-[14px] border border-border bg-panel"
                >
                  {preview.isImage ? (
                    <img alt={preview.name} className="h-full w-full object-cover" src={preview.url} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-1">
                      <span className="break-all text-center text-[10px] text-muted">{preview.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
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

      <Modal
        onClose={closeEditDialog}
        open={Boolean(editCandidate)}
        title={editCandidate?.category === "quest" ? t(language, "posts.editQuest") : t(language, "posts.editPost")}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.title")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              maxLength={100}
              onChange={(event) => setEditTitle(event.target.value)}
              value={editTitle}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.description")}</span>
            <textarea
              className="app-input min-h-36 w-full rounded-[24px] px-4 py-3"
              maxLength={2000}
              onChange={(event) => setEditDescription(event.target.value)}
              value={editDescription}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "posts.tags")}</span>
            <TagInput
              inputValue={editTagInput}
              onChangeInput={setEditTagInput}
              onChangeTags={setEditTags}
              placeholder={t(language, "posts.tagsPlaceholder")}
              tags={editTags}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "posts.timeRange")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              type="datetime-local"
              onChange={(event) => setEditTimeRange(event.target.value)}
              value={editTimeRange}
            />
          </label>
          {editCandidate?.category === "secondHand" || editCandidate?.category === "lostFound" || editCandidate?.category === "quest" ? (
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">{t(language, "posts.priceReward")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) => setEditPriceReward(event.target.value)}
                placeholder="0"
                value={editPriceReward}
              />
            </label>
          ) : null}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeEditDialog}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              disabled={editSubmitting}
              type="submit"
            >
              {editSubmitting ? t(language, "common.working") : t(language, "common.save")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal onClose={closeSelectedDialog} open={Boolean(selected)} title={selected?.title ?? t(language, "common.view")}>
        {selected ? (
          <div className="space-y-4 text-sm leading-7 text-muted">
            <p>{selected.description}</p>
            {selected.mediaUrls && selected.mediaUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {selected.mediaUrls.map((url, index) => (
                  <a key={index} href={url} rel="noopener noreferrer" target="_blank">
                    <img alt="" className="h-32 w-full rounded-[14px] object-cover" src={url} />
                  </a>
                ))}
              </div>
            ) : null}
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
            {selected.questState ? <p>{t(language, "posts.questState")} {formatQuestState(language, selected.questState)}</p> : null}

            {selected.category === "quest" ? (
              <div className="space-y-3 rounded-[24px] border border-border bg-panel/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {selected.owner
                      ? language === "zh-HK"
                        ? "任務申請"
                        : "Quest applications"
                      : language === "zh-HK"
                        ? "任務進度"
                        : "Quest progress"}
                  </h4>
                  {selectedAcceptedQuestApplication ? (
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
                      {language === "zh-HK"
                        ? `已接受：${selectedAcceptedQuestApplication.applicantName}`
                        : `Accepted: ${selectedAcceptedQuestApplication.applicantName}`}
                    </span>
                  ) : null}
                </div>

                {selected.owner ? (
                  selectedQuestApplications.length ? (
                    <div className="space-y-3">
                      {selectedQuestApplications.map((application) => {
                        const finishCount = getQuestFinishCount(application);

                        return (
                          <div key={application.id} className="rounded-[20px] border border-border bg-panel-strong px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <AvatarBadge
                                    alt={application.applicantName}
                                    className="h-8 w-8 bg-accent-soft text-xs font-semibold text-accent-strong"
                                    value={application.applicantAvatar}
                                  />
                                  <span className="text-sm font-semibold text-foreground">{application.applicantName}</span>
                                </div>
                                <p className="mt-2 text-xs text-muted">
                                  {formatAppDateTime(application.appliedAt, language, { joiner: " ", weekday: undefined })}
                                </p>
                              </div>
                              <span className={getStatusPillClass(application.status)}>
                                {formatQuestApplicationStatus(language, application.status)}
                              </span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{application.capabilityReason}</p>
                            {application.denialReason ? (
                              <p className="mt-2 text-xs text-rose-500">{application.denialReason}</p>
                            ) : null}
                            {application.status === "accepted" ? (
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs text-muted">
                                  {language === "zh-HK" ? `完成進度 ${finishCount}/2` : `Finish progress ${finishCount}/2`}
                                </span>
                                {!application.ownerFinished && selected.questState !== "completed" ? (
                                  <button
                                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white"
                                    disabled={questFinishSubmittingId === application.id}
                                    onClick={() => {
                                      void handleQuestFinish(selected, application, "owner");
                                    }}
                                    type="button"
                                  >
                                    {questFinishSubmittingId === application.id
                                      ? t(language, "common.working")
                                      : `${language === "zh-HK" ? "完成" : "Finish"} (${finishCount}/2)`}
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                            {application.status === "pending" && !selectedAcceptedQuestApplication ? (
                              <div className="mt-3 space-y-3">
                                <textarea
                                  className="app-input min-h-24 w-full rounded-[20px] px-4 py-3"
                                  onChange={(event) =>
                                    setQuestDecisionDrafts((current) => ({
                                      ...current,
                                      [application.id]: event.target.value,
                                    }))
                                  }
                                  placeholder={
                                    language === "zh-HK"
                                      ? "可選填拒絕原因，方便對方稍後再申請。"
                                      : "Optional denial reason to help the resident re-apply later."
                                  }
                                  value={questDecisionDrafts[application.id] ?? ""}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600"
                                    disabled={questDecisionSubmittingId === application.id}
                                    onClick={() => {
                                      void handleQuestDecision(selected, application, "denied");
                                    }}
                                    type="button"
                                  >
                                    {language === "zh-HK" ? "拒絕" : "Deny"}
                                  </button>
                                  <button
                                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white"
                                    disabled={questDecisionSubmittingId === application.id}
                                    onClick={() => {
                                      void handleQuestDecision(selected, application, "accepted");
                                    }}
                                    type="button"
                                  >
                                    {language === "zh-HK" ? "接受" : "Accept"}
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-[20px] border border-dashed border-border px-4 py-3 text-sm text-muted">
                      {language === "zh-HK" ? "暫時未有居民申請這個任務。" : "No residents have applied to this quest yet."}
                    </p>
                  )
                ) : (
                  <div className="space-y-3">
                    {selectedAcceptedQuestApplication && selectedAcceptedQuestApplication.applicantId !== profile.id ? (
                      <p className="rounded-[20px] border border-dashed border-border px-4 py-3 text-sm text-muted">
                        {language === "zh-HK"
                          ? `此任務已由 ${selectedAcceptedQuestApplication.applicantName} 接手。`
                          : `This quest has already been assigned to ${selectedAcceptedQuestApplication.applicantName}.`}
                      </p>
                    ) : null}
                    {selectedViewerQuestApplication?.status === "pending" ? (
                      <div className="rounded-[20px] border border-border bg-panel-strong px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">
                          {language === "zh-HK" ? "你的申請正在等待審核。" : "Your application is waiting for review."}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                          {selectedViewerQuestApplication.capabilityReason}
                        </p>
                      </div>
                    ) : null}
                    {selectedViewerQuestApplication?.status === "denied" && isQuestApplicationInCooldown(selectedViewerQuestApplication) ? (
                      <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <p>
                          {selectedViewerQuestApplication.denialReason ||
                            (language === "zh-HK" ? "這次申請未被接受。" : "This application was not accepted.")}
                        </p>
                        {selectedViewerQuestApplication.cooldownUntil ? (
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? `可再次申請時間：${formatAppDateTime(selectedViewerQuestApplication.cooldownUntil, language, { joiner: " " })}`
                              : `You can apply again after ${formatAppDateTime(selectedViewerQuestApplication.cooldownUntil, language, { joiner: " " })}.`}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {selectedViewerQuestApplication?.status === "accepted" ? (
                      <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-semibold text-emerald-700">
                          {language === "zh-HK" ? "你的申請已被接受。" : "Your application has been accepted."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-emerald-700/80">
                            {language === "zh-HK"
                              ? `完成進度 ${getQuestFinishCount(selectedViewerQuestApplication)}/2`
                              : `Finish progress ${getQuestFinishCount(selectedViewerQuestApplication)}/2`}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700"
                              onClick={() => {
                                void openPostConversation(selected);
                              }}
                              type="button"
                            >
                              {language === "zh-HK" ? "聯絡發帖人" : "Contact requester"}
                            </button>
                            {!selectedViewerQuestApplication.workerFinished && selected.questState !== "completed" ? (
                              <button
                                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                                disabled={questFinishSubmittingId === selectedViewerQuestApplication.id}
                                onClick={() => {
                                  void handleQuestFinish(selected, selectedViewerQuestApplication, "worker");
                                }}
                                type="button"
                              >
                                {questFinishSubmittingId === selectedViewerQuestApplication.id
                                  ? t(language, "common.working")
                                  : `${language === "zh-HK" ? "完成" : "Finish"} (${getQuestFinishCount(selectedViewerQuestApplication)}/2)`}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {!selectedAcceptedQuestApplication || selectedAcceptedQuestApplication.applicantId === profile.id ? (
                      selectedViewerQuestApplication?.status === "pending" ||
                      selectedViewerQuestApplication?.status === "accepted" ||
                      isQuestApplicationInCooldown(selectedViewerQuestApplication) ? null : (
                        <div className="space-y-3 rounded-[20px] border border-border bg-panel-strong px-4 py-3">
                          <h4 className="text-sm font-semibold text-foreground">
                            {language === "zh-HK" ? "接受這個任務" : "Apply to this quest"}
                          </h4>
                          {selectedViewerQuestApplication?.status === "denied" ? (
                            <p className="text-xs text-muted">
                              {language === "zh-HK"
                                ? "你可再次申請，並補充更多能力或可交付時間。"
                                : "You can apply again and include more detail about your ability or availability."}
                            </p>
                          ) : null}
                          <textarea
                            className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
                            maxLength={500}
                            onChange={(event) => setQuestReasonDraft(event.target.value)}
                            placeholder={
                              language === "zh-HK"
                                ? "請簡單說明你為何適合接這個任務。"
                                : "Briefly explain why you are capable of taking this quest."
                            }
                            value={questReasonDraft}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
                              onClick={() => {
                                void openPostConversation(selected);
                              }}
                              type="button"
                            >
                              {language === "zh-HK" ? "聯絡發帖人" : "Contact requester"}
                            </button>
                            <button
                              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                              disabled={questSubmitting}
                              onClick={() => {
                                void handleQuestApplicationSubmit(selected);
                              }}
                              type="button"
                            >
                              {questSubmitting ? t(language, "common.working") : language === "zh-HK" ? "提交申請" : "Apply to quest"}
                            </button>
                          </div>
                        </div>
                      )
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {selected.category === "lostFound" ? (
              <div className="space-y-3 rounded-[24px] border border-border bg-panel/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {language === "zh-HK" ? "線索與找到回報" : "Clues and found notices"}
                  </h4>
                  {selected.foundResolvedAt ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {language === "zh-HK"
                        ? `已由 ${selected.foundResolvedByName ?? "居民"} 協助找回`
                        : `Recovered thanks to ${selected.foundResolvedByName ?? "a resident"}`}
                    </span>
                  ) : null}
                </div>

                {selected.owner ? (
                  selectedLostFoundLeads.length ? (
                    <div className="space-y-3">
                      {selectedLostFoundLeads.map((lead) => (
                        <div key={lead.id} className="rounded-[20px] border border-border bg-panel-strong px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <AvatarBadge
                                  alt={lead.authorName}
                                  className="h-8 w-8 bg-accent-soft text-xs font-semibold text-accent-strong"
                                  value={lead.authorAvatar}
                                />
                                <span className="text-sm font-semibold text-foreground">{lead.authorName}</span>
                                <span className="rounded-full bg-panel px-3 py-1 text-[11px] text-muted">
                                  {lead.kind === "found"
                                    ? t(language, "posts.foundIt")
                                    : language === "zh-HK"
                                      ? "線索"
                                      : "Clue"}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-muted">
                                {formatAppDateTime(lead.submittedAt, language, { joiner: " ", weekday: undefined })}
                              </p>
                            </div>
                            <span className={getStatusPillClass(lead.status)}>{formatLostFoundLeadStatus(language, lead.status)}</span>
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-muted">
                            <p>
                              <span className="font-semibold text-foreground">{language === "zh-HK" ? "地點" : "Where"}</span> {lead.whereSeen}
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">{language === "zh-HK" ? "時間" : "When"}</span> {lead.whenSeen}
                            </p>
                            {lead.details ? <p className="whitespace-pre-wrap leading-6">{lead.details}</p> : null}
                            {lead.photoNames.length ? (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {lead.photoNames.map((photoName) => (
                                  <span key={photoName} className="rounded-full bg-panel px-3 py-1 text-xs text-muted">
                                    {photoName}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {lead.status === "pending" && !selected.foundResolvedAt ? (
                            <div className="mt-3 flex justify-end gap-2">
                              <button
                                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600"
                                disabled={leadReviewSubmitting}
                                onClick={() => setLeadReviewContext({ lead, post: selected })}
                                type="button"
                              >
                                {language === "zh-HK" ? "無幫助" : "Not Helpful"}
                              </button>
                              <button
                                className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white"
                                disabled={leadReviewSubmitting}
                                onClick={() => {
                                  void handleLeadHelpful(selected, lead);
                                }}
                                type="button"
                              >
                                {lead.kind === "found"
                                  ? language === "zh-HK"
                                    ? "確認找回"
                                    : "Mark Recovered"
                                  : language === "zh-HK"
                                    ? "有幫助"
                                    : "Helpful"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-[20px] border border-dashed border-border px-4 py-3 text-sm text-muted">
                      {language === "zh-HK" ? `暫時未收到任何線索或${t(language, "posts.foundIt")}回報。` : "No clues or found-it notices have been submitted yet."}
                    </p>
                  )
                ) : (
                  <p className="rounded-[20px] border border-dashed border-border px-4 py-3 text-sm text-muted">
                    {selected.foundResolvedAt
                      ? language === "zh-HK"
                        ? `此失物已由 ${selected.foundResolvedByName ?? "居民"} 協助找回。`
                        : `This lost item was recovered with help from ${selected.foundResolvedByName ?? "a resident"}.`
                      : language === "zh-HK"
                        ? `可在卡片底部使用「${t(language, "posts.clues")}」或「${t(language, "posts.foundIt")}」提交更多資訊。`
                        : `Use the ${t(language, "posts.clues")} or ${t(language, "posts.foundIt")} actions on the card to submit more information.`}
                  </p>
                )}
              </div>
            ) : null}

            {selected.category === "sharing" || selected.category === "quest" ? (
              <div className="space-y-3 rounded-[24px] border border-border bg-panel/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {selected.comments} {t(language, "home.comments")}
                  </h4>
                  <span className="text-xs text-muted">
                    {language === "zh-HK" ? "每則留言最多 500 字。" : "Up to 500 characters per comment."}
                  </span>
                </div>
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {selectedComments.length ? (
                    selectedComments.map((comment) => (
                      <div key={comment.id} className="rounded-[20px] border border-border bg-panel-strong px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AvatarBadge
                              alt={comment.authorName}
                              className="h-8 w-8 bg-accent-soft text-xs font-semibold text-accent-strong"
                              value={comment.authorAvatar}
                            />
                            <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
                          </div>
                          <span className="text-xs text-muted">
                            {formatAppDateTime(comment.createdAt, language, { joiner: " ", weekday: undefined })}
                          </span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-[20px] border border-dashed border-border px-4 py-3 text-sm text-muted">
                      {language === "zh-HK" ? "暫時未有留言。" : "No comments yet."}
                    </p>
                  )}
                  {!selected.commentEntries?.length && selected.comments > selectedComments.length ? (
                    <p className="text-xs text-muted">
                      {language === "zh-HK"
                        ? `此處展示 ${selectedComments.length} 則示範留言，其餘舊留言仍只保留數量。`
                        : `Showing ${selectedComments.length} demo comments here. The remaining older comments are still count-only data.`}
                    </p>
                  ) : null}
                </div>
                <form className="space-y-3" onSubmit={handleCommentSubmit}>
                  <textarea
                    className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
                    maxLength={500}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder={language === "zh-HK" ? "輸入你的留言" : "Write your comment"}
                    value={commentDraft}
                  />
                  <div className="flex justify-end">
                    <button
                      className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                      disabled={commentSubmitting}
                      type="submit"
                    >
                      {commentSubmitting ? t(language, "common.working") : t(language, "common.submit")}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
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

      <Modal
        onClose={closeLeadDialog}
        open={Boolean(leadCandidate)}
        title={leadCandidate ? `${leadKind === "found" ? t(language, "posts.foundIt") : t(language, "posts.clues")}: ${leadCandidate.title}` : t(language, "posts.clues")}
      >
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {leadKind === "found"
              ? language === "zh-HK"
                ? "請填寫在哪裡及何時找到這件物品，物主之後可將你的回報標記為有幫助或無幫助。"
                : "Tell the owner where and when you found the item. They can later mark your notice as helpful or not helpful."
              : language === "zh-HK"
                ? "請填寫你看到物品的位置和時間，可附上最多 3 張圖片。"
                : "Share where and when you saw the item, and optionally attach up to 3 photos."}
          </p>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{language === "zh-HK" ? "在哪裡看到" : "Where did you see it?"}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setLeadWhereSeen(event.target.value)}
              placeholder={language === "zh-HK" ? "例如：A 座大堂、停車場、電梯旁" : "For example: Tower A lobby, car park, beside the lift"}
              value={leadWhereSeen}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{language === "zh-HK" ? "何時看到" : "When did you see it?"}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setLeadWhenSeen(event.target.value)}
              placeholder={language === "zh-HK" ? "例如：今天 18:30、昨晚 9 點左右" : "For example: Today 18:30, around 9pm last night"}
              value={leadWhenSeen}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{language === "zh-HK" ? "補充資料" : "Extra details"}</span>
            <textarea
              className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
              onChange={(event) => setLeadDetails(event.target.value)}
              placeholder={
                leadKind === "found"
                  ? language === "zh-HK"
                    ? "可補充物品狀態、你如何保管等。"
                    : "Optional details such as the item's condition or how you kept it safe."
                  : language === "zh-HK"
                    ? "可補充物品外觀、附近的人或其他線索。"
                    : "Optional details such as item appearance, nearby people, or anything else useful."
              }
              value={leadDetails}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              {language === "zh-HK" ? "圖片（最多 3 張，可選）" : "Photos (up to 3, optional)"}
            </span>
            <input
              accept="image/*"
              className="app-input w-full rounded-[20px] px-4 py-3"
              multiple
              onChange={(event) => handleLeadFileSelection(event.target.files)}
              type="file"
            />
          </label>
          {leadPhotoNames.length ? (
            <div className="flex flex-wrap gap-2">
              {leadPhotoNames.map((photoName) => (
                <span key={photoName} className="rounded-full bg-panel px-3 py-1 text-xs text-muted">
                  {photoName}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeLeadDialog}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              disabled={leadSubmitting}
              onClick={() => {
                void handleLeadSubmit();
              }}
              type="button"
            >
              {leadSubmitting ? t(language, "common.working") : t(language, "common.submit")}
            </button>
          </div>
        </div>
      </Modal>

      <Modal onClose={closeLeadReviewDialog} open={Boolean(leadReviewContext)} title={language === "zh-HK" ? "這則訊息沒有幫助？" : "Was this message not helpful?"}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {language === "zh-HK"
              ? "你想同時檢舉這則線索／回報訊息嗎？"
              : "Do you also want to report this clue or found-it message?"}
          </p>
          {leadReviewContext ? (
            <div className="rounded-[20px] border border-border bg-panel-strong px-4 py-3 text-sm text-muted">
              <p className="font-semibold text-foreground">{leadReviewContext.lead.authorName}</p>
              {leadReviewContext.lead.details ? <p className="mt-2 whitespace-pre-wrap leading-6">{leadReviewContext.lead.details}</p> : null}
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              disabled={leadReviewSubmitting}
              onClick={() => {
                void handleLeadReviewDecision("dismiss");
              }}
              type="button"
            >
              {language === "zh-HK" ? "否" : "No"}
            </button>
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              disabled={leadReviewSubmitting}
              onClick={() => {
                void handleLeadReviewDecision("report");
              }}
              type="button"
            >
              {language === "zh-HK" ? "檢舉" : "Report"}
            </button>
            <button
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
              disabled={leadReviewSubmitting}
              onClick={() => {
                void handleLeadReviewDecision("reportBlock");
              }}
              type="button"
            >
              {language === "zh-HK" ? "檢舉並封鎖" : "Report and Block"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal onClose={closeBlockDialog} open={Boolean(blockContext)} title={language === "zh-HK" ? "封鎖用戶" : "Block user"}>
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {blockContext
              ? language === "zh-HK"
                ? `封鎖 ${blockContext.user.name} 後，對方的帖子會從動態中隱藏。你之後可在 Website Settings 的 Block List 解除封鎖。`
                : `After blocking ${blockContext.user.name}, their posts will disappear from your feed. You can unblock them later from the Website Settings block list.`
              : null}
          </p>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeBlockDialog}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
              disabled={blockSubmitting}
              onClick={() => {
                void handleConfirmBlock();
              }}
              type="button"
            >
              {blockSubmitting ? t(language, "common.working") : language === "zh-HK" ? "封鎖" : "Block"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal onClose={closeReportDialog} open={Boolean(reportContext)} title={language === "zh-HK" ? "檢舉用戶" : "Report user"}>
        <div className="space-y-4">
          {reportContext ? (
            <p className="text-sm leading-7 text-muted">
              {language === "zh-HK"
                ? `這會檢舉 ${reportContext.user.name} 及其帖文「${reportContext.post.title}」。`
                : `This will report ${reportContext.user.name} and their post "${reportContext.post.title}".`}
            </p>
          ) : null}
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{language === "zh-HK" ? "原因" : "Reason"}</span>
            <select
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setReportReason(event.target.value)}
              value={reportReason}
            >
              <option value="spam">{language === "zh-HK" ? "垃圾內容" : "Spam"}</option>
              <option value="scam">{language === "zh-HK" ? "可疑詐騙" : "Scam or fraud"}</option>
              <option value="abuse">{language === "zh-HK" ? "不當內容" : "Abusive content"}</option>
              <option value="other">{language === "zh-HK" ? "其他" : "Other"}</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{language === "zh-HK" ? "補充資料" : "Details"}</span>
            <textarea
              className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
              onChange={(event) => setReportDetails(event.target.value)}
              placeholder={language === "zh-HK" ? "可選填更多內容供管理員審核。" : "Optional details for the moderation review."}
              value={reportDetails}
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeReportDialog}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full border border-border bg-panel px-5 py-3 text-sm font-semibold text-foreground"
              disabled={reportSubmitting}
              onClick={() => {
                void handleSubmitReport();
              }}
              type="button"
            >
              {reportSubmitting ? t(language, "common.working") : language === "zh-HK" ? "檢舉" : "Report"}
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              disabled={reportSubmitting}
              onClick={() => {
                void handleSubmitReport(true);
              }}
              type="button"
            >
              {reportSubmitting ? t(language, "common.working") : language === "zh-HK" ? "檢舉並封鎖" : "Report and Block"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function isoToDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return "";
  }
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

function getEditablePostAmount(item: FeedItem) {
  if (item.category === "quest") {
    return typeof item.reward === "number" ? String(item.reward) : "";
  }

  if (item.category === "secondHand" || item.category === "lostFound") {
    return typeof item.price === "number" ? String(item.price) : "";
  }

  return "";
}

function getEditablePostText(value: string) {
  const trimmed = value.trim();
  const englishMatch = trimmed.match(/^English:\s*([\s\S]*?)(?:\n中文:\s*[\s\S]*)?$/);

  if (englishMatch) {
    return englishMatch[1]?.trim() ?? "";
  }

  const chineseMatch = trimmed.match(/^中文:\s*([\s\S]*?)(?:\nEnglish:\s*[\s\S]*)?$/);

  if (chineseMatch) {
    return chineseMatch[1]?.trim() ?? "";
  }

  return trimmed;
}

function getPostAuthor(item: FeedItem): PostActor {
  const name = item.authorName.trim() || "Resident";

  return {
    avatar: item.authorAvatar,
    id: item.authorId,
    name,
  };
}

function getAcceptedQuestApplication(item: FeedItem) {
  return [...(item.questApplications ?? [])]
    .sort((left, right) => right.appliedAt.localeCompare(left.appliedAt))
    .find((application) => application.status === "accepted");
}

function getViewerQuestApplication(item: FeedItem, viewerId: string) {
  return [...(item.questApplications ?? [])]
    .filter((application) => application.applicantId === viewerId)
    .sort((left, right) => right.appliedAt.localeCompare(left.appliedAt))[0];
}

function getSortedQuestApplications(item: FeedItem) {
  return [...(item.questApplications ?? [])].sort((left, right) => right.appliedAt.localeCompare(left.appliedAt));
}

function getSortedLostFoundLeads(item: FeedItem) {
  return [...(item.lostFoundLeads ?? [])].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
}

function getQuestFinishCount(application: QuestApplication) {
  return Number(Boolean(application.ownerFinished)) + Number(Boolean(application.workerFinished));
}

function isQuestApplicationInCooldown(application?: QuestApplication) {
  if (!application?.cooldownUntil || application.status !== "denied") {
    return false;
  }

  return new Date(application.cooldownUntil).getTime() > Date.now();
}

function formatQuestApplicationStatus(language: "en" | "zh-HK", status: QuestApplication["status"]) {
  if (status === "accepted") {
    return language === "zh-HK" ? "已接受" : "Accepted";
  }
  if (status === "denied") {
    return language === "zh-HK" ? "已拒絕" : "Denied";
  }
  if (status === "autoDeclined") {
    return language === "zh-HK" ? "已自動關閉" : "Closed";
  }
  return language === "zh-HK" ? "待審核" : "Pending";
}

function formatLostFoundLeadStatus(language: "en" | "zh-HK", status: LostFoundLead["status"]) {
  if (status === "helpful") {
    return language === "zh-HK" ? "有幫助" : "Helpful";
  }
  if (status === "notHelpful") {
    return language === "zh-HK" ? "無幫助" : "Not Helpful";
  }
  return language === "zh-HK" ? "待回覆" : "Pending";
}

function getStatusPillClass(status: string) {
  if (status === "accepted" || status === "helpful") {
    return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (status === "denied" || status === "notHelpful") {
    return "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600";
  }

  if (status === "autoDeclined") {
    return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700";
  }

  return "rounded-full bg-panel px-3 py-1 text-xs font-semibold text-muted";
}

function getDisplayedCommentEntries(item: FeedItem, language: "en" | "zh-HK") {
  if (item.commentEntries?.length) {
    return item.commentEntries;
  }

  if (item.comments <= 0) {
    return [];
  }

  const templates = getDemoCommentTemplates(language, item.category);

  return Array.from({ length: Math.min(item.comments, templates.length) }, (_, index) => {
    const template = templates[index];
    const createdAt = new Date(Date.now() - (index + 1) * 43 * 60 * 1000).toISOString();

    return {
      authorAvatar: template.authorAvatar,
      authorName: template.authorName,
      content: template.content,
      createdAt,
      id: `demo-comment-${item.id}-${index}`,
    };
  });
}

function getDemoCommentTemplates(language: "en" | "zh-HK", category: FeedItem["category"]) {
  if (language === "zh-HK") {
    if (category === "quest") {
      return [
        { authorAvatar: "MK", authorName: "Man Kit", content: "我做過類似任務，如果仍然需要幫忙可以再通知我。" },
        { authorAvatar: "CW", authorName: "Chloe Wong", content: "如果今晚前要完成，我可以六點後處理。" },
        { authorAvatar: "KY", authorName: "Kai Yan", content: "這個需求很清楚，回報進度時請同步上傳照片。" },
      ];
    }

    return [
      { authorAvatar: "SL", authorName: "Suki Lam", content: "已收到，謝謝分享。" },
      { authorAvatar: "JT", authorName: "Jason To", content: "如果還有的話我想預留一份。" },
      { authorAvatar: "HY", authorName: "Hoi Ying", content: "這個資訊很有用，多謝你補充。" },
    ];
  }

  if (category === "quest") {
    return [
      { authorAvatar: "MK", authorName: "Man Kit", content: "I've handled similar tasks before. Happy to help if this is still open." },
      { authorAvatar: "CW", authorName: "Chloe Wong", content: "If this needs to be finished tonight, I can take it after 6pm." },
      { authorAvatar: "KY", authorName: "Kai Yan", content: "Clear request. Please share photo updates once progress starts." },
    ];
  }

  return [
    { authorAvatar: "SL", authorName: "Suki Lam", content: "Thanks for posting this update." },
    { authorAvatar: "JT", authorName: "Jason To", content: "If it's still available, I'd like to reserve it." },
    { authorAvatar: "HY", authorName: "Hoi Ying", content: "Useful context, thanks for adding the details." },
  ];
}

function TagInput({
  inputValue,
  onChangeInput,
  onChangeTags,
  placeholder,
  tags,
}: {
  inputValue: string;
  onChangeInput: (value: string) => void;
  onChangeTags: (value: string[]) => void;
  placeholder: string;
  tags: string[];
}) {
  function commitTag(raw: string) {
    const nextTag = normalizePostTag(raw);

    if (!nextTag || tags.includes(nextTag) || tags.length >= 10) {
      return;
    }

    onChangeTags([...tags, nextTag]);
    onChangeInput("");
  }

  return (
    <div className="space-y-2">
      <div className="app-input flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-[20px] px-4 py-3">
        {tags.map((tag) => (
          <button
            className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong"
            key={tag}
            onClick={() => onChangeTags(tags.filter((entry) => entry !== tag))}
            type="button"
          >
            #{tag}
            <span className="text-[10px] text-accent">x</span>
          </button>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
          onBlur={() => commitTag(inputValue)}
          onChange={(event) => onChangeInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              commitTag(inputValue);
            }
          }}
          placeholder={tags.length >= 10 ? "10 / 10" : placeholder}
          value={inputValue}
        />
      </div>
      <p className="text-xs text-muted">{tags.length}/10</p>
    </div>
  );
}

function normalizePostTag(value: string) {
  return value.trim().replace(/^#+/, "").toLowerCase();
}
