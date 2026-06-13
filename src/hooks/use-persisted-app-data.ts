"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  adminMessage,
  aiConversations as seededAiConversations,
  bookings as seededBookings,
  chatRooms as seededChatRooms,
  currentUser,
  documents as seededDocuments,
  facilities as seededFacilities,
  friendList as seededFriendList,
  friendSuggestions as seededFriendSuggestions,
  getAdvertisements,
  getFaqItems,
  getNotifications,
  nearbyCommunities as seededCommunityEvents,
  postFeed as seededPostFeed,
  profileHistory as seededProfileHistory,
} from "@/lib/demo-data";
import { useToLink } from "@/lib/app-state";
import { getFirebaseServices } from "@/lib/firebase";
import {
  localizeAdminMessage,
  localizeAiConversations,
  localizeAvailableSlots,
  localizeBookings,
  localizeChatRooms,
  localizeCommunityItems,
  localizeDocuments,
  localizeFacilities,
  localizeFeedItems,
  localizeFriendCards,
  localizeProfileHistory,
  localizeSeededUserProfile,
} from "@/lib/seeded-content-localization";
import type {
  Advertisement,
  AIConversation,
  BlockedUserItem,
  BookingItem,
  ChatMessage,
  ChatRoom,
  CommunityItem,
  DocumentItem,
  FAQItem,
  FacilityItem,
  FeedItem,
  FriendCard,
  Language,
  LostFoundLead,
  NotificationItem,
  PostComment,
  PostCategory,
  ProfileHistoryItem,
  QuestApplication,
  UserProfile,
} from "@/lib/types";
import { useSeededFirestoreDocument, useSeededUserDocument } from "@/hooks/use-seeded-firestore-document";

interface SharedContentDocument {
  adminMessage: string;
  advertisementsByLanguage: Record<Language, Advertisement[]>;
  communityEvents: CommunityItem[];
  documents: DocumentItem[];
  facilities: FacilityItem[];
  faqItemsByLanguage: Record<Language, FAQItem[]>;
}

interface DashboardDocument {
  availableSlots: string[];
  notificationsByLanguage: Record<Language, NotificationItem[]>;
  profileHistory: ProfileHistoryItem[];
}

interface PostsDocument {
  items: FeedItem[];
}

interface BookingsDocument {
  items: BookingItem[];
}

interface ConnectionsDocument {
  chatRooms: ChatRoom[];
  friendList: FriendCard[];
}

interface ChatRoomOverridesDocument {
  rooms: ChatRoom[];
}

interface FriendSuggestionsDocument {
  items: FriendCard[];
}

interface AIConversationsDocument {
  conversations: AIConversation[];
  remainingQuestions: number;
}

interface ModerationReportItem {
  category: PostCategory;
  createdAt: string;
  details: string;
  id: string;
  postId: string;
  postTitle: string;
  reason: string;
  reporterName: string;
}

interface ModerationReportsDocument {
  items: ModerationReportItem[];
}

interface BlockedUsersDocument {
  items: BlockedUserItem[];
}

interface ChatRoomMemberProfile {
  avatar: string;
  id: string;
  name: string;
  status?: FriendCard["status"] | UserProfile["status"];
  username?: string;
}

interface SharedChatRoomDocument {
  createdAt: string;
  group: boolean;
  groupName?: string;
  id: string;
  memberIds: string[];
  memberProfiles: ChatRoomMemberProfile[];
  messages: ChatMessage[];
  updatedAt: string;
}

interface SharedChatRoomsDocument {
  rooms: SharedChatRoomDocument[];
}

interface SharedChatRoomsState {
  currentUserId: string | null;
  error: string | null;
  ready: boolean;
  rooms: SharedChatRoomDocument[];
  status: "error" | "loading" | "ready";
}

interface GroupChatRequest {
  groupName: string;
  members: ChatRoomMemberProfile[];
}

interface DirectChatRequest {
  memberIds?: string[];
  memberProfiles?: ChatRoomMemberProfile[];
  members?: string[];
  message?: ChatMessage;
  online?: boolean;
  preview?: string;
  title: string;
}

export const DEFAULT_AVAILABLE_SLOTS = [
  "Mon 19:00 - 21:00",
  "Tue 20:00 - 22:00",
  "Sat 10:00 - 13:00",
  "Sun 14:00 - 18:00",
];

const SHARED_CONTENT_SEED: SharedContentDocument = {
  adminMessage,
  advertisementsByLanguage: {
    en: getAdvertisements("en"),
    "zh-HK": getAdvertisements("zh-HK"),
  },
  communityEvents: seededCommunityEvents,
  documents: seededDocuments,
  facilities: seededFacilities,
  faqItemsByLanguage: {
    en: getFaqItems("en"),
    "zh-HK": getFaqItems("zh-HK"),
  },
};

const DASHBOARD_SEED: DashboardDocument = {
  availableSlots: DEFAULT_AVAILABLE_SLOTS,
  notificationsByLanguage: {
    en: getNotifications("en"),
    "zh-HK": getNotifications("zh-HK"),
  },
  profileHistory: seededProfileHistory,
};

const POSTS_SEED: PostsDocument = {
  items: seededPostFeed,
};

const POSTS_OVERRIDES_SEED: PostsDocument = {
  items: [],
};

const BOOKINGS_SEED: BookingsDocument = {
  items: seededBookings,
};

const CONNECTIONS_SEED: ConnectionsDocument = {
  chatRooms: seededChatRooms,
  friendList: seededFriendList,
};

const CHAT_ROOM_OVERRIDES_SEED: ChatRoomOverridesDocument = {
  rooms: [],
};

const FRIEND_SUGGESTIONS_SEED: FriendSuggestionsDocument = {
  items: seededFriendSuggestions,
};

const AI_CONVERSATIONS_SEED: AIConversationsDocument = {
  conversations: seededAiConversations,
  remainingQuestions: 20,
};

const MODERATION_REPORTS_SEED: ModerationReportsDocument = {
  items: [],
};

const BLOCKED_USERS_SEED: BlockedUsersDocument = {
  items: [],
};

export function usePersistedCurrentUserProfile() {
  const { language } = useToLink();
  const state = useSeededUserDocument<UserProfile>({
    pathFactory: (uid) => ["userProfiles", uid],
    parse: normalizeUserProfile,
    seedData: currentUser,
  });
  const profile = localizeSeededUserProfile(language, state.data);

  return {
    ...state,
    data: profile,
    profile,
  };
}

export function usePersistedDashboardData() {
  const { language } = useToLink();
  const state = useSeededUserDocument<DashboardDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "dashboard"],
    parse: normalizeDashboardDocument,
    seedData: DASHBOARD_SEED,
  });
  const localizedData = useMemo(
    () => ({
      ...state.data,
      availableSlots: localizeAvailableSlots(language, state.data.availableSlots),
      profileHistory: localizeProfileHistory(language, state.data.profileHistory),
    }),
    [language, state.data],
  );

  return {
    ...state,
    data: localizedData,
    availableSlots: localizedData.availableSlots,
    notificationsByLanguage: state.data.notificationsByLanguage,
    profileHistory: localizedData.profileHistory,
    rawAvailableSlots: state.data.availableSlots,
  };
}

export function usePersistedSharedContent() {
  const { language } = useToLink();
  const state = useSeededFirestoreDocument<SharedContentDocument>({
    parse: normalizeSharedContentDocument,
    path: ["appData", "sharedContent"],
    seedData: SHARED_CONTENT_SEED,
  });
  const localizedData = useMemo(
    () => ({
      ...state.data,
      adminMessage: localizeAdminMessage(language, state.data.adminMessage),
      communityEvents: localizeCommunityItems(language, state.data.communityEvents),
      documents: localizeDocuments(language, state.data.documents),
      facilities: localizeFacilities(language, state.data.facilities),
    }),
    [language, state.data],
  );

  return {
    ...state,
    data: localizedData,
    adminMessage: localizedData.adminMessage,
    advertisementsByLanguage: state.data.advertisementsByLanguage,
    communityEvents: localizedData.communityEvents,
    documents: localizedData.documents,
    facilities: localizedData.facilities,
    faqItemsByLanguage: state.data.faqItemsByLanguage,
  };
}

export function usePersistedPosts() {
  const { language } = useToLink();
  // SECURITY: Only load user-specific post overrides from the current user's profile.
  // The full feed is seeded globally and merged with any per-user overrides.
  const state = useSeededUserDocument<PostsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "postOverrides"],
    parse: normalizePostsDocument,
    seedData: POSTS_OVERRIDES_SEED,
  });
  const mergedPosts = useMemo(
    () => mergePersistedPosts(POSTS_SEED.items, state.data.items),
    [state.data.items],
  );
  const localizedData = useMemo(
    () => ({
      ...state.data,
      items: localizeFeedItems(language, mergedPosts),
    }),
    [language, mergedPosts],
  );

  return {
    ...state,
    data: localizedData,
    items: localizedData.items,
  };
}
export function usePersistedBlockedUsers() {
  const state = useSeededUserDocument<BlockedUsersDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "blockedUsers"],
    parse: normalizeBlockedUsersDocument,
    seedData: BLOCKED_USERS_SEED,
  });

  return {
    ...state,
    items: state.data.items,
  };
}

export function usePersistedBookings() {
  const { language } = useToLink();
  const state = useSeededUserDocument<BookingsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "bookings"],
    parse: normalizeBookingsDocument,
    seedData: BOOKINGS_SEED,
  });
  const localizedData = useMemo(
    () => ({
      ...state.data,
      items: localizeBookings(language, state.data.items),
    }),
    [language, state.data],
  );

  return {
    ...state,
    data: localizedData,
    items: localizedData.items,
  };
}

export function usePersistedConnections() {
  const { language } = useToLink();
  const connectionsState = useSeededUserDocument<ConnectionsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "connections"],
    parse: normalizeConnectionsDocument,
    seedData: CONNECTIONS_SEED,
  });
  const chatRoomOverridesState = useSeededUserDocument<ChatRoomOverridesDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "chatRoomOverrides"],
    parse: normalizeChatRoomOverridesDocument,
    seedData: CHAT_ROOM_OVERRIDES_SEED,
  });
  const suggestionsState = useSeededFirestoreDocument<FriendSuggestionsDocument>({
    parse: normalizeFriendSuggestionsDocument,
    path: ["appData", "friendSuggestions"],
    seedData: FRIEND_SUGGESTIONS_SEED,
  });
  const sharedChatRooms = usePersistedSharedChatRooms();
  const friendLookup = useMemo(
    () =>
      new Map(
        [...connectionsState.data.friendList, ...suggestionsState.data.items].map((friend) => [
          friend.id,
          friend,
        ]),
      ),
    [connectionsState.data.friendList, suggestionsState.data.items],
  );
  const chatRooms = useMemo(
    () =>
      localizeChatRooms(
        language,
        mergeChatRoomViews(
          sharedChatRooms.rooms.map((room) =>
            toChatRoomView(room, sharedChatRooms.currentUserId ?? currentUser.id, friendLookup),
          ),
          chatRoomOverridesState.data.rooms,
        ),
      ),
    [language, sharedChatRooms.rooms, sharedChatRooms.currentUserId, chatRoomOverridesState.data.rooms, friendLookup],
  );
  const fallbackChatRooms = useMemo(
    () =>
      localizeChatRooms(
        language,
        mergeChatRoomViews(connectionsState.data.chatRooms, chatRoomOverridesState.data.rooms),
      ),
    [language, connectionsState.data.chatRooms, chatRoomOverridesState.data.rooms],
  );
  const friendList = useMemo(
    () => localizeFriendCards(language, connectionsState.data.friendList),
    [language, connectionsState.data.friendList],
  );
  const friendSuggestions = useMemo(
    () => localizeFriendCards(language, suggestionsState.data.items),
    [language, suggestionsState.data.items],
  );

  return {
    chatRooms: sharedChatRooms.ready
      ? chatRooms
      : fallbackChatRooms,
    error:
      connectionsState.error ??
      chatRoomOverridesState.error ??
      suggestionsState.error ??
      sharedChatRooms.error,
    friendList,
    friendSuggestions,
    ready:
      connectionsState.ready &&
      chatRoomOverridesState.ready &&
      suggestionsState.ready &&
      sharedChatRooms.ready,
    status:
      connectionsState.status === "error" ||
      chatRoomOverridesState.status === "error" ||
      suggestionsState.status === "error" ||
      sharedChatRooms.status === "error"
        ? "error"
        : connectionsState.status === "loading" ||
            chatRoomOverridesState.status === "loading" ||
            suggestionsState.status === "loading" ||
            sharedChatRooms.status === "loading"
          ? "loading"
          : "ready",
  };
}

export function usePersistedAiConversations() {
  const { language } = useToLink();
  const state = useSeededUserDocument<AIConversationsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "aiConversations"],
    parse: normalizeAIConversationsDocument,
    seedData: AI_CONVERSATIONS_SEED,
  });
  const localizedData = useMemo(
    () => ({
      ...state.data,
      conversations: localizeAiConversations(language, state.data.conversations),
    }),
    [language, state.data],
  );

  return {
    ...state,
    data: localizedData,
    conversations: localizedData.conversations,
    remainingQuestions: localizedData.remainingQuestions,
  };
}

export async function savePersistedCurrentUserProfile(profilePatch: Partial<UserProfile>) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return false;
  }

  const currentProfile = await loadUserRootDocument(user.uid, currentUser, normalizeUserProfile);
  const nextFirstName = profilePatch.firstName ?? currentProfile.firstName;
  const nextLastName = profilePatch.lastName ?? currentProfile.lastName;
  const nextName =
    typeof profilePatch.name === "string"
      ? profilePatch.name
      : "firstName" in profilePatch || "lastName" in profilePatch
        ? [nextFirstName, nextLastName].filter(Boolean).join(" ") || currentProfile.name
        : currentProfile.name;
  const nextProfile = normalizeUserProfile({
    ...currentProfile,
    ...profilePatch,
    firstName: nextFirstName,
    lastName: nextLastName,
    name: nextName,
    uid: user.uid,
  });

  await setDoc(doc(services.db, "userProfiles", user.uid), nextProfile, { merge: true });
  return true;
}

function normalizeUserHandleLookup(value: string) {
  return value.trim().toLowerCase().replace(/[\s()-]/g, "");
}

export async function deletePersistedCurrentUserAccountData({
  phone,
  uid,
  username,
}: {
  phone: string;
  uid: string;
  username: string;
}) {
  const services = getFirebaseServices();

  if (!services) {
    return false;
  }

  const batch = writeBatch(services.db);
  const references = [
    doc(services.db, "userProfiles", uid),
    doc(services.db, "userProfiles", uid, "appData", "aiConversations"),
    doc(services.db, "userProfiles", uid, "appData", "blockedUsers"),
    doc(services.db, "userProfiles", uid, "appData", "bookings"),
    doc(services.db, "userProfiles", uid, "appData", "chatRoomOverrides"),
    doc(services.db, "userProfiles", uid, "appData", "connections"),
    doc(services.db, "userProfiles", uid, "appData", "dashboard"),
    doc(services.db, "userProfiles", uid, "appData", "postOverrides"),
  ];

  for (const reference of references) {
    batch.delete(reference);
  }

  const handleKeys = [normalizeUserHandleLookup(username), normalizeUserHandleLookup(phone)].filter(Boolean);

  for (const handleKey of handleKeys) {
    batch.delete(doc(services.db, "userHandles", handleKey));
  }

  const calendarEventsSnapshot = await getDocs(collection(services.db, "userProfiles", uid, "calendarEvents"));

  for (const calendarEvent of calendarEventsSnapshot.docs) {
    batch.delete(calendarEvent.ref);
  }

  await batch.commit();
  return true;
}

export async function appendPersistedProfileHistory(entry: ProfileHistoryItem) {
  const currentDashboard = await loadCurrentUserDocument(["appData", "dashboard"], DASHBOARD_SEED, normalizeDashboardDocument);

  if (!currentDashboard) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "dashboard"], {
    ...currentDashboard,
    profileHistory: [entry, ...currentDashboard.profileHistory.filter((item) => item.id !== entry.id)],
  });
}

export async function savePersistedDashboardData(dashboardPatch: Partial<DashboardDocument>) {
  const currentDashboard = await loadCurrentUserDocument(["appData", "dashboard"], DASHBOARD_SEED, normalizeDashboardDocument);

  if (!currentDashboard) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "dashboard"], {
    ...currentDashboard,
    ...dashboardPatch,
  });
}

export async function savePersistedAdminAnnouncement(announcement: string) {
  const services = getFirebaseServices();
  const firestore = services?.db;
  
  if (!firestore) {
    throw new Error("Firebase services not available");
  }

  const sharedContentRef = doc(firestore, "appData", "sharedContent");
  const current = await getDoc(sharedContentRef);
  const currentData = current.data() ?? {};

  await setDoc(sharedContentRef, {
    ...currentData,
    adminMessage: announcement,
  }, { merge: true });

  return true;
}

export async function savePersistedAdvertisements(advertisements: Advertisement[], language: string) {
  const services = getFirebaseServices();
  const firestore = services?.db;
  
  if (!firestore) {
    throw new Error("Firebase services not available");
  }

  const sharedContentRef = doc(firestore, "appData", "sharedContent");
  const current = await getDoc(sharedContentRef);
  const currentData = current.data() ?? {};
  
  const advertisementsByLanguage = currentData.advertisementsByLanguage || {};
  
  await setDoc(sharedContentRef, {
    ...currentData,
    advertisementsByLanguage: {
      ...advertisementsByLanguage,
      [language]: advertisements,
    },
  }, { merge: true });

  return true;
}

function preparePersistedPostItem(item: FeedItem): FeedItem {
  const authorName = item.authorName.trim() || "Resident";
  const nextItem: FeedItem = {
    authorAvatar: item.authorAvatar || getAvatarLabel(authorName),
    authorId: normalizePersistedActorId(item.authorId, authorName),
    authorName,
    category: item.category,
    comments: item.comments,
    createdAt: item.createdAt,
    description: item.description,
    edited: item.edited,
    id: item.id,
    likes: item.likes,
    owner: item.owner,
    tags: item.tags,
    title: item.title,
  };

  if (Array.isArray(item.likedByUserIds)) {
    nextItem.likedByUserIds = [...new Set(item.likedByUserIds.filter(Boolean))];
  }

  if (Array.isArray(item.commentEntries)) {
    nextItem.commentEntries = item.commentEntries
      .map((comment) => normalizePersistedPostComment(comment))
      .filter((comment) => Boolean(comment.content));
  }

  if (Array.isArray(item.questApplications)) {
    nextItem.questApplications = item.questApplications.map((application) =>
      normalizePersistedQuestApplication(application),
    );
  }

  if (Array.isArray(item.lostFoundLeads)) {
    nextItem.lostFoundLeads = item.lostFoundLeads.map((lead) => normalizePersistedLostFoundLead(lead));
  }

  if (typeof item.expiresAt === "string" && item.expiresAt.trim()) {
    nextItem.expiresAt = item.expiresAt.trim();
  }

  if (typeof item.price === "number" && Number.isFinite(item.price)) {
    nextItem.price = item.price;
  }

  if (typeof item.reward === "number" && Number.isFinite(item.reward)) {
    nextItem.reward = item.reward;
  }

  if (item.questState) {
    nextItem.questState = item.questState;
  }

  if (typeof item.acceptedByCurrentUser === "boolean") {
    nextItem.acceptedByCurrentUser = item.acceptedByCurrentUser;
  }

  if (typeof item.createdByCurrentUser === "boolean") {
    nextItem.createdByCurrentUser = item.createdByCurrentUser;
  }

  if (typeof item.foundResolvedAt === "string" && item.foundResolvedAt) {
    nextItem.foundResolvedAt = item.foundResolvedAt;
  }

  if (typeof item.foundResolvedByName === "string" && item.foundResolvedByName.trim()) {
    nextItem.foundResolvedByName = item.foundResolvedByName.trim();
  }

  return nextItem;
}

function normalizePersistedPostComment(comment: PostComment): PostComment {
  const authorName = comment.authorName.trim() || "Resident";

  return {
    authorAvatar: comment.authorAvatar || getAvatarLabel(authorName),
    authorName,
    content: comment.content.trim(),
    createdAt: typeof comment.createdAt === "string" && comment.createdAt ? comment.createdAt : new Date().toISOString(),
    id: typeof comment.id === "string" && comment.id ? comment.id : `comment-${Date.now()}`,
  };
}

function normalizePersistedActorId(actorId: string | undefined, name: string) {
  if (typeof actorId === "string" && actorId.trim()) {
    return actorId.trim();
  }

  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "resident";
}

function normalizePersistedQuestApplication(application: QuestApplication): QuestApplication {
  const applicantName = application.applicantName.trim() || "Resident";

  return {
    applicantAvatar: application.applicantAvatar || getAvatarLabel(applicantName),
    applicantId: application.applicantId,
    applicantName,
    appliedAt:
      typeof application.appliedAt === "string" && application.appliedAt
        ? application.appliedAt
        : new Date().toISOString(),
    capabilityReason: application.capabilityReason.trim(),
    cooldownUntil:
      typeof application.cooldownUntil === "string" && application.cooldownUntil
        ? application.cooldownUntil
        : undefined,
    denialReason:
      typeof application.denialReason === "string" && application.denialReason.trim()
        ? application.denialReason.trim()
        : undefined,
    id: typeof application.id === "string" && application.id ? application.id : `quest-application-${Date.now()}`,
    ownerFinished: Boolean(application.ownerFinished),
    status:
      application.status === "accepted" ||
      application.status === "denied" ||
      application.status === "autoDeclined"
        ? application.status
        : "pending",
    workerFinished: Boolean(application.workerFinished),
  };
}

function normalizePersistedLostFoundLead(lead: LostFoundLead): LostFoundLead {
  const authorName = lead.authorName.trim() || "Resident";

  return {
    authorAvatar: lead.authorAvatar || getAvatarLabel(authorName),
    authorId: lead.authorId,
    authorName,
    details: typeof lead.details === "string" && lead.details.trim() ? lead.details.trim() : undefined,
    id: typeof lead.id === "string" && lead.id ? lead.id : `lost-found-lead-${Date.now()}`,
    kind: lead.kind === "found" ? "found" : "clue",
    photoNames: Array.isArray(lead.photoNames) ? lead.photoNames.filter(Boolean).slice(0, 3) : [],
    status: lead.status === "helpful" || lead.status === "notHelpful" ? lead.status : "pending",
    submittedAt:
      typeof lead.submittedAt === "string" && lead.submittedAt
        ? lead.submittedAt
        : new Date().toISOString(),
    whenSeen: lead.whenSeen.trim(),
    whereSeen: lead.whereSeen.trim(),
  };
}

export async function createPersistedPost(item: FeedItem) {
  const currentPosts = await loadEditablePostsDocument();
  const nextItem = preparePersistedPostItem(item);

  await persistEditablePostsDocument({
    items: [nextItem, ...currentPosts.items.filter((entry) => entry.id !== nextItem.id)],
  });
}

export async function updatePersistedPost(postId: string, postPatch: Partial<FeedItem>): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      updatedPost = preparePersistedPostItem({
        ...item,
        ...postPatch,
        edited: true,
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function addPersistedPostComment(postId: string, comment: PostComment): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  const nextComment = normalizePersistedPostComment(comment);
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      updatedPost = preparePersistedPostItem({
        ...item,
        commentEntries: [...(item.commentEntries ?? []), nextComment],
        comments: item.comments + 1,
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function submitPersistedQuestApplication(
  postId: string,
  application: QuestApplication,
): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  const nextApplication = normalizePersistedQuestApplication(application);
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      updatedPost = preparePersistedPostItem({
        ...item,
        questApplications: [...(item.questApplications ?? []), nextApplication],
        questState: item.questState === "completed" ? item.questState : "open",
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function reviewPersistedQuestApplication(
  postId: string,
  applicationId: string,
  decision: "accepted" | "denied",
  denialReason?: string,
): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  let updatedPost: FeedItem | null = null;
  const normalizedDenialReason = denialReason?.trim();
  const cooldownUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      const updatedApplications = (item.questApplications ?? []).map((application) => {
        if (application.id === applicationId) {
          return normalizePersistedQuestApplication({
            ...application,
            cooldownUntil: decision === "denied" ? cooldownUntil : undefined,
            denialReason:
              decision === "denied"
                ? normalizedDenialReason || "Application declined by the requester."
                : undefined,
            ownerFinished: false,
            status: decision,
            workerFinished: false,
          });
        }

        if (decision === "accepted" && application.status === "pending") {
          return normalizePersistedQuestApplication({
            ...application,
            denialReason: "This quest is already accepted by others.",
            status: "autoDeclined",
          });
        }

        return normalizePersistedQuestApplication(application);
      });

      updatedPost = preparePersistedPostItem({
        ...item,
        questApplications: updatedApplications,
        questState: decision === "accepted" ? "accepted" : "open",
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function confirmPersistedQuestCompletion(
  postId: string,
  applicationId: string,
  actor: "owner" | "worker",
): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      const updatedApplications = (item.questApplications ?? []).map((application) => {
        if (application.id !== applicationId) {
          return normalizePersistedQuestApplication(application);
        }

        return normalizePersistedQuestApplication({
          ...application,
          ownerFinished: actor === "owner" ? true : application.ownerFinished,
          workerFinished: actor === "worker" ? true : application.workerFinished,
        });
      });
      const acceptedApplication = updatedApplications.find((application) => application.id === applicationId);
      const completed = Boolean(acceptedApplication?.ownerFinished && acceptedApplication.workerFinished);

      updatedPost = preparePersistedPostItem({
        ...item,
        questApplications: updatedApplications,
        questState: completed ? "completed" : item.questState,
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function addPersistedLostFoundLead(postId: string, lead: LostFoundLead): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  const nextLead = normalizePersistedLostFoundLead(lead);
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      updatedPost = preparePersistedPostItem({
        ...item,
        lostFoundLeads: [...(item.lostFoundLeads ?? []), nextLead],
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function reviewPersistedLostFoundLead(
  postId: string,
  leadId: string,
  status: "helpful" | "notHelpful",
): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      const updatedLeads = (item.lostFoundLeads ?? []).map((lead) =>
        lead.id === leadId ? normalizePersistedLostFoundLead({ ...lead, status }) : normalizePersistedLostFoundLead(lead),
      );
      const reviewedLead = updatedLeads.find((lead) => lead.id === leadId);

      updatedPost = preparePersistedPostItem({
        ...item,
        foundResolvedAt:
          reviewedLead?.kind === "found" && status === "helpful"
            ? new Date().toISOString()
            : item.foundResolvedAt,
        foundResolvedByName:
          reviewedLead?.kind === "found" && status === "helpful"
            ? reviewedLead.authorName
            : item.foundResolvedByName,
        lostFoundLeads: updatedLeads,
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function addPersistedBlockedUser(blockedUser: BlockedUserItem) {
  const currentBlockedUsers = await loadCurrentUserDocument(
    ["appData", "blockedUsers"],
    BLOCKED_USERS_SEED,
    normalizeBlockedUsersDocument,
  );

  if (!currentBlockedUsers) {
    return false;
  }

  const nextBlockedUser = normalizeBlockedUserItem(blockedUser);

  return saveCurrentUserDocument(["appData", "blockedUsers"], {
    items: [nextBlockedUser, ...currentBlockedUsers.items.filter((item) => item.id !== nextBlockedUser.id)],
  });
}

export async function removePersistedBlockedUser(blockedUserId: string) {
  const currentBlockedUsers = await loadCurrentUserDocument(
    ["appData", "blockedUsers"],
    BLOCKED_USERS_SEED,
    normalizeBlockedUsersDocument,
  );

  if (!currentBlockedUsers) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "blockedUsers"], {
    items: currentBlockedUsers.items.filter((item) => item.id !== blockedUserId),
  });
}

export async function likePersistedPost(postId: string): Promise<FeedItem | null> {
  const services = getFirebaseServices();
  const currentUserId = services?.auth.currentUser?.uid ?? currentUser.id;

  if (!currentUserId) {
    return null;
  }

  const currentPosts = await loadEditablePostsDocument();
  let updatedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      const likedByUserIds = item.likedByUserIds ?? [];
      const alreadyLiked = likedByUserIds.includes(currentUserId);
      const nextLikedByUserIds = alreadyLiked
        ? likedByUserIds.filter((userId) => userId !== currentUserId)
        : [...likedByUserIds, currentUserId];

      updatedPost = preparePersistedPostItem({
        ...item,
        likedByUserIds: nextLikedByUserIds,
        likes: Math.max(item.likes + (alreadyLiked ? -1 : 1), 0),
      });

      return updatedPost;
    }),
  });

  return saved ? updatedPost : null;
}

export async function acceptPersistedQuest(postId: string): Promise<FeedItem | null> {
  const currentPosts = await loadEditablePostsDocument();
  let acceptedPost: FeedItem | null = null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.map((item) => {
      if (item.id !== postId) {
        return item;
      }

      acceptedPost = {
        ...item,
        acceptedByCurrentUser: true,
        questState: "accepted",
      };

      return acceptedPost;
    }),
  });

  return saved ? acceptedPost : null;
}

export async function deletePersistedPost(postId: string) {
  const currentPosts = await loadEditablePostsDocument();
  const removed = currentPosts.items.find((item) => item.id === postId) ?? null;

  const saved = await persistEditablePostsDocument({
    items: currentPosts.items.filter((item) => item.id !== postId),
  });

  return saved ? removed : null;
}

export async function addPersistedBooking(item: BookingItem) {
  const currentBookings = await loadCurrentUserDocument(["appData", "bookings"], BOOKINGS_SEED, normalizeBookingsDocument);

  if (!currentBookings) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "bookings"], {
    items: [item, ...currentBookings.items.filter((entry) => entry.id !== item.id)],
  });
}

export async function updatePersistedBookingStatus(
  bookingId: string,
  status: BookingItem["status"],
  reason?: string,
) {
  const currentBookings = await loadCurrentUserDocument(["appData", "bookings"], BOOKINGS_SEED, normalizeBookingsDocument);

  if (!currentBookings) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "bookings"], {
    items: currentBookings.items.map((item) =>
      item.id === bookingId ? { ...item, reason, status } : item,
    ),
  });
}

export async function addPersistedFriend(friend: FriendCard) {
  const services = getFirebaseServices();
  const currentUserId = services?.auth.currentUser?.uid;

  // Prevent adding yourself as a friend
  if (currentUserId && friend.id === currentUserId) {
    return false;
  }

  const currentConnections = await loadCurrentUserDocument(["appData", "connections"], CONNECTIONS_SEED, normalizeConnectionsDocument);

  if (!currentConnections) {
    return false;
  }

  if (currentConnections.friendList.some((entry) => entry.id === friend.id)) {
    return true;
  }

  const sanitizedFriend: FriendCard = {
    id: friend.id || "",
    name: friend.name || "",
    username: friend.username || "",
    avatar: friend.avatar || "U",
    bio: friend.bio || "",
    status: (friend.status === "online" || friend.status === "offline" || friend.status === "busy" ? friend.status : "offline") as "online" | "offline" | "busy",
  };

  return saveCurrentUserDocument(["appData", "connections"], {
    ...currentConnections,
    friendList: [sanitizedFriend, ...currentConnections.friendList],
  });
}

export async function removePersistedFriend(friendId: string) {
  const currentConnections = await loadCurrentUserDocument(["appData", "connections"], CONNECTIONS_SEED, normalizeConnectionsDocument);

  if (!currentConnections) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "connections"], {
    ...currentConnections,
    friendList: currentConnections.friendList.filter((friend) => friend.id !== friendId),
  });
}

export async function sendPersistedMessage(roomId: string, message: ChatMessage) {
  const services = getFirebaseServices();
  const currentUserId = services?.auth.currentUser?.uid ?? currentUser.id;
  const currentRoom = await loadSharedChatRoom(roomId);
  const nextMessage = normalizeChatMessage({
    ...message,
    inbound: false,
    senderId: message.senderId || currentUserId,
  });

  if (!currentRoom) {
    return appendCurrentUserChatRoomMessage(roomId, nextMessage, currentUserId);
  }

  return persistSharedChatRoomWithFallback(
    {
      ...currentRoom,
      messages: [...currentRoom.messages, nextMessage],
      updatedAt: new Date().toISOString(),
    },
    currentUserId,
  );
}

export async function createPersistedGroupChat(request: GroupChatRequest) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return null;
  }

  const currentProfile = await loadUserRootDocument(user.uid, currentUser, normalizeUserProfile);
  const currentMember = toChatRoomMemberProfile({
    ...currentProfile,
    id: user.uid,
  });
  const members = normalizeChatRoomMembers([
    currentMember,
    ...request.members,
  ]);

  if (members.length < 3) {
    return null;
  }

  const roomId = `group-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const room = {
    createdAt: timestamp,
    group: true,
    groupName:
      request.groupName.trim() ||
      members
        .filter((member) => member.id !== currentMember.id)
        .map((member) => member.name)
        .join(", "),
    id: roomId,
    memberIds: members.map((member) => member.id),
    memberProfiles: members,
    messages: [],
    updatedAt: timestamp,
  } satisfies SharedChatRoomDocument;

  const saved = await persistSharedChatRoomWithFallback(room, user.uid);

  if (!saved) {
    return null;
  }

  return roomId;
}

export async function openPersistedDirectChat({
  memberIds,
  memberProfiles,
  members,
  message,
  title,
}: DirectChatRequest) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return null;
  }

  const currentProfile = await loadUserRootDocument(user.uid, currentUser, normalizeUserProfile);
  const currentMember = toChatRoomMemberProfile({
    ...currentProfile,
    id: user.uid,
  });
  const currentConnections = await loadCurrentUserDocument(
    ["appData", "connections"],
    CONNECTIONS_SEED,
    normalizeConnectionsDocument,
  );
  const resolvedMembers = normalizeChatRoomMembers([
    currentMember,
    ...resolveDirectChatMembers(
      {
        memberIds,
        memberProfiles,
        members,
        title,
      },
      currentProfile,
      currentConnections?.friendList ?? CONNECTIONS_SEED.friendList,
    ),
  ]);

  if (resolvedMembers.length < 2) {
    return null;
  }

  const roomId = createDirectChatRoomId(resolvedMembers.map((member) => member.id));
  const existingRoom = await loadSharedChatRoom(roomId);
  const nextMessage = message
    ? normalizeChatMessage({
        ...message,
        inbound: false,
        senderAvatar: message.senderAvatar || currentProfile.avatar,
        senderId: user.uid,
        senderName: message.senderName || currentProfile.name,
      })
    : null;
  const timestamp = new Date().toISOString();

  const room = {
    createdAt: existingRoom?.createdAt ?? timestamp,
    group: false,
    id: roomId,
    memberIds: resolvedMembers.map((member) => member.id),
    memberProfiles: resolvedMembers,
    messages: nextMessage ? [...(existingRoom?.messages ?? []), nextMessage] : existingRoom?.messages ?? [],
    updatedAt: nextMessage || !existingRoom ? timestamp : existingRoom.updatedAt,
  } satisfies SharedChatRoomDocument;

  const saved = await persistSharedChatRoomWithFallback(
    room,
    user.uid,
    currentConnections?.friendList ?? CONNECTIONS_SEED.friendList,
  );

  if (!saved) {
    return null;
  }

  return roomId;
}

export async function submitPersistedModerationReport(report: {
  category: PostCategory;
  details?: string;
  postId: string;
  postTitle: string;
  reason: string;
  reporterName: string;
}) {
  const currentReports = await loadSharedDocument(
    ["appData", "moderationReports"],
    MODERATION_REPORTS_SEED,
    normalizeModerationReportsDocument,
  );

  const nextReport: ModerationReportItem = {
    category: report.category,
    createdAt: new Date().toISOString(),
    details: report.details?.trim() ?? "",
    id: `report-${Date.now()}`,
    postId: report.postId,
    postTitle: report.postTitle,
    reason: report.reason,
    reporterName: report.reporterName,
  };

  await saveSharedDocument(["appData", "moderationReports"], {
    items: [nextReport, ...currentReports.items.filter((item) => item.id !== nextReport.id)],
  });

  return nextReport;
}

export async function savePersistedAiConversations(documentValue: AIConversationsDocument) {
  return saveCurrentUserDocument(["appData", "aiConversations"], documentValue);
}

function usePersistedSharedChatRooms(): SharedChatRoomsState {
  const services = useMemo(() => getFirebaseServices(), []);
  const fallbackRooms = useMemo(() => createSeedSharedChatRooms(currentUser.id), []);
  const [state, setState] = useState<SharedChatRoomsState>({
    currentUserId: services?.auth.currentUser?.uid ?? null,
    error: null,
    ready: !services,
    rooms: fallbackRooms,
    status: services ? "loading" : "ready",
  });

  useEffect(() => {
    if (!services) {
      return;
    }

    let unsubscribeRooms: (() => void) | undefined;
    let seededFallback = false;

    const unsubscribeAuth = onAuthStateChanged(services.auth, (user) => {
      unsubscribeRooms?.();
      unsubscribeRooms = undefined;

      if (!user) {
        setState({
          currentUserId: null,
          error: null,
          ready: true,
          rooms: fallbackRooms,
          status: "ready",
        });
        return;
      }

      setState((current) => ({
        ...current,
        currentUserId: user.uid,
        error: null,
        ready: false,
        status: "loading",
      }));

      const roomsReference = doc(services.db, "appData", "chatRooms");

      unsubscribeRooms = onSnapshot(
        roomsReference,
        async (snapshot) => {
          if (!snapshot.exists() && !seededFallback) {
            seededFallback = true;
            await seedSharedChatRoomsForUser(user.uid);
            return;
          }

          const rooms = normalizeSharedChatRoomsDocument(snapshot.data()).rooms
            .filter((room) => room.memberIds.includes(user.uid))
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

          if (!rooms.length && !seededFallback) {
            seededFallback = true;
            await seedSharedChatRoomsForUser(user.uid);
            return;
          }

          setState({
            currentUserId: user.uid,
            error: null,
            ready: true,
            rooms: rooms.length ? rooms : fallbackRooms,
            status: "ready",
          });
        },
        (error) => {
          setState({
            currentUserId: user.uid,
            error: error.message,
            ready: true,
            rooms: fallbackRooms,
            status: "error",
          });
        },
      );
    });

    return () => {
      unsubscribeRooms?.();
      unsubscribeAuth();
    };
  }, [fallbackRooms, services]);

  return services
    ? state
    : {
        currentUserId: null,
        error: null,
        ready: true,
        rooms: fallbackRooms,
        status: "ready",
      };
}

function createSeedSharedChatRooms(currentUserId: string) {
  return seededChatRooms.map((room, index) => {
    const createdAt = `2026-06-0${Math.min(index + 1, 9)}T09:00:00+08:00`;
    const updatedAt = `2026-06-0${Math.min(index + 1, 9)}T09:${String(10 + index).padStart(2, "0")}:00+08:00`;
    const memberProfiles = normalizeChatRoomMembers(
      room.members.map((memberName) => resolveSeedChatMember(memberName, currentUserId)),
    );

    return {
      createdAt,
      group: room.group,
      groupName: room.group ? room.title : undefined,
      id: `seed-${sanitizeChatKey(currentUserId)}-${room.id}`,
      memberIds: memberProfiles.map((member) => member.id),
      memberProfiles,
      messages: room.messages.map((message) =>
        normalizeChatMessage({
          ...message,
          senderId: resolveSeedChatMember(message.senderName, currentUserId).id,
        }),
      ),
      updatedAt,
    } satisfies SharedChatRoomDocument;
  });
}

function resolveSeedChatMember(name: string, currentUserId: string) {
  if (name === currentUser.name || name === currentUser.username) {
    return {
      avatar: currentUser.avatar,
      id: currentUserId,
      name: currentUser.name,
      status: currentUser.status,
      username: currentUser.username,
    } satisfies ChatRoomMemberProfile;
  }

  const knownFriend = [...seededFriendList, ...seededFriendSuggestions].find(
    (friend) => friend.name === name || friend.username === name,
  );

  return knownFriend ? toChatRoomMemberProfile(knownFriend) : createExternalChatMember(name);
}

function toChatRoomView(
  room: SharedChatRoomDocument,
  currentUserId: string,
  friendLookup: Map<string, FriendCard>,
) {
  return {
    group: room.group,
    id: room.id,
    members: room.memberProfiles.map((member) => member.name),
    messages: room.messages.map((message) => ({
      ...message,
      inbound:
        typeof message.senderId === "string"
          ? message.senderId !== currentUserId
          : message.inbound,
    })),
    online: resolveChatRoomOnline(room, currentUserId, friendLookup),
    preview: buildChatRoomPreview(room),
    title: resolveChatRoomTitle(room, currentUserId),
    unreadCount: 0,
  } satisfies ChatRoom;
}

function createChatRoomView(
  room: SharedChatRoomDocument,
  currentUserId: string,
  friendList: FriendCard[],
) {
  return toChatRoomView(
    room,
    currentUserId,
    new Map(friendList.map((friend) => [friend.id, friend])),
  );
}

function mergeChatRoomViews(primaryRooms: ChatRoom[], overrideRooms: ChatRoom[]) {
  const seen = new Set<string>();

  return [...overrideRooms, ...primaryRooms]
    .map((room) => normalizeChatRoomView(room))
    .filter((room) => {
      if (!room.id || seen.has(room.id)) {
        return false;
      }

      seen.add(room.id);
      return true;
    });
}

function mergePersistedPosts(primaryItems: FeedItem[], overrideItems: FeedItem[]) {
  const merged = primaryItems.map((item) => preparePersistedPostItem(item));
  const positions = new Map(merged.map((item, index) => [item.id, index]));

  for (const overrideItem of overrideItems) {
    const normalizedOverride = preparePersistedPostItem(overrideItem);
    const existingIndex = positions.get(normalizedOverride.id);

    if (typeof existingIndex === "number") {
      merged[existingIndex] = normalizedOverride;
      continue;
    }

    merged.unshift(normalizedOverride);
  }

  return merged;
}

function resolveChatRoomTitle(room: SharedChatRoomDocument, currentUserId: string) {
  if (room.group) {
    return (
      room.groupName?.trim() ||
      room.memberProfiles
        .filter((member) => member.id !== currentUserId)
        .map((member) => member.name)
        .join(", ") ||
      "Group chat"
    );
  }

  return (
    room.memberProfiles.find((member) => member.id !== currentUserId)?.name ||
    room.memberProfiles[0]?.name ||
    "Direct message"
  );
}

function buildChatRoomPreview(room: SharedChatRoomDocument) {
  return room.messages[room.messages.length - 1]?.content ?? "";
}

function resolveChatRoomOnline(
  room: SharedChatRoomDocument,
  currentUserId: string,
  friendLookup: Map<string, FriendCard>,
) {
  return room.memberProfiles
    .filter((member) => member.id !== currentUserId)
    .some((member) => {
      const status = friendLookup.get(member.id)?.status ?? member.status;
      return status === "online" || status === "busy";
    });
}

function resolveDirectChatMembers(
  request: Pick<DirectChatRequest, "memberIds" | "memberProfiles" | "members" | "title">,
  currentProfile: UserProfile,
  friendList: FriendCard[],
) {
  if (request.memberProfiles?.length) {
    return request.memberProfiles.map((member) => toChatRoomMemberProfile(member));
  }

  const knownFriends = [...friendList, ...seededFriendList, ...seededFriendSuggestions];
  const friendById = new Map(knownFriends.map((friend) => [friend.id, friend]));
  const friendByName = new Map(
    knownFriends.flatMap((friend) => [
      [friend.name.trim().toLowerCase(), friend] as const,
      [friend.username.trim().toLowerCase(), friend] as const,
    ]),
  );
  const resolvedById = (request.memberIds ?? []).map((memberId) => {
    if (memberId === currentProfile.id) {
      return toChatRoomMemberProfile(currentProfile);
    }

    const friend = friendById.get(memberId);
    return friend ? toChatRoomMemberProfile(friend) : null;
  });
  const requestedNames = request.members?.length ? request.members : [request.title];
  const resolvedByName = requestedNames.map((name) => {
    const normalizedName = name.trim().toLowerCase();

    if (!normalizedName) {
      return null;
    }

    if (
      normalizedName === currentProfile.name.trim().toLowerCase() ||
      normalizedName === currentProfile.username.trim().toLowerCase()
    ) {
      return toChatRoomMemberProfile(currentProfile);
    }

    const friend = friendByName.get(normalizedName);
    return friend ? toChatRoomMemberProfile(friend) : createExternalChatMember(name);
  });

  const resolvedMembers = [...resolvedById, ...resolvedByName].flatMap((member) =>
    member ? [member] : [],
  );

  return normalizeChatRoomMembers(resolvedMembers);
}

function toChatRoomMemberProfile(
  member: Pick<ChatRoomMemberProfile, "avatar" | "id" | "name"> & {
    status?: ChatRoomMemberProfile["status"];
    username?: string;
  },
) {
  return {
    avatar: member.avatar || getAvatarLabel(member.name),
    id: member.id,
    name: member.name,
    status: member.status,
    username: member.username,
  } satisfies ChatRoomMemberProfile;
}

function createExternalChatMember(name: string) {
  return {
    avatar: getAvatarLabel(name),
    id: createExternalChatMemberId(name),
    name,
    status: "offline",
  } satisfies ChatRoomMemberProfile;
}

function normalizeChatRoomMembers(members: ChatRoomMemberProfile[]) {
  const deduped = new Map<string, ChatRoomMemberProfile>();

  for (const member of members) {
    if (!member.id) {
      continue;
    }

    deduped.set(member.id, member);
  }

  return [...deduped.values()];
}

function normalizeSharedChatRoomDocument(id: string, value: unknown): SharedChatRoomDocument {
  const record = asRecord(value);
  const memberProfiles = Array.isArray(record.memberProfiles)
    ? (record.memberProfiles as ChatRoomMemberProfile[])
        .map((member) => toChatRoomMemberProfile(member))
        .filter((member) => Boolean(member.id))
    : [];
  const memberIds = Array.isArray(record.memberIds)
    ? (record.memberIds as string[]).filter(Boolean)
    : memberProfiles.map((member) => member.id);

  return {
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString(),
    group: Boolean(record.group),
    groupName: typeof record.groupName === "string" ? record.groupName : undefined,
    id,
    memberIds,
    memberProfiles,
    messages: Array.isArray(record.messages)
      ? (record.messages as ChatMessage[]).map((message) => normalizeChatMessage(message))
      : [],
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString(),
  };
}

function normalizeSharedChatRoomsDocument(value: unknown): SharedChatRoomsDocument {
  const record = asRecord(value);
  const rooms = Array.isArray(record.rooms) ? record.rooms : [];

  return {
    rooms: rooms
      .map((roomValue, index) => {
        const roomRecord = asRecord(roomValue);
        const roomId = typeof roomRecord.id === "string" ? roomRecord.id : `chat-room-${index}`;

        return normalizeSharedChatRoomDocument(roomId, roomValue);
      })
      .filter((room) => Boolean(room.id)),
  };
}

function normalizeChatMessage(message: ChatMessage) {
  return {
    ...message,
    accentLabel: message.accentLabel?.trim() || undefined,
    attachments: Array.isArray(message.attachments)
      ? message.attachments
          .map((attachment) => ({
            filename: typeof attachment.filename === "string" ? attachment.filename : "",
            type: attachment.type === "image" || attachment.type === "video" || attachment.type === "file"
              ? attachment.type
              : "file",
            url: typeof attachment.url === "string" ? attachment.url : "",
          }))
          .filter((attachment) => attachment.url || attachment.filename)
      : undefined,
    content: typeof message.content === "string" ? message.content : "",
    senderAvatar: typeof message.senderAvatar === "string" && message.senderAvatar.trim()
      ? message.senderAvatar
      : getAvatarLabel(typeof message.senderName === "string" ? message.senderName : "Resident"),
    senderId: typeof message.senderId === "string" ? message.senderId : undefined,
    senderName: typeof message.senderName === "string" ? message.senderName : "Resident",
  } satisfies ChatMessage;
}

function createDirectChatRoomId(memberIds: string[]) {
  return `dm-${memberIds
    .map((memberId) => sanitizeChatKey(memberId))
    .sort()
    .join("-")}`;
}

function createExternalChatMemberId(name: string) {
  return `external-${sanitizeChatKey(name)}`;
}

function sanitizeChatKey(value: string) {
  return value.trim().replace(/[^A-Za-z0-9_-]+/g, "_") || "member";
}

async function seedSharedChatRoomsForUser(currentUserId: string) {
  const currentDocument = await loadSharedChatRoomsDocument();

  if (!currentDocument) {
    return false;
  }

  const rooms = createSeedSharedChatRooms(currentUserId);
  const existingIds = new Set(currentDocument.rooms.map((room) => room.id));
  const nextRooms = [...currentDocument.rooms];

  for (const room of rooms) {
    if (!existingIds.has(room.id)) {
      nextRooms.push(room);
    }
  }

  return saveSharedChatRoomsDocument({ rooms: nextRooms });
}

async function loadSharedChatRoom(roomId: string) {
  const currentDocument = await loadSharedChatRoomsDocument();

  if (!currentDocument) {
    return null;
  }

  return currentDocument.rooms.find((room) => room.id === roomId) ?? null;
}

async function saveSharedChatRoom(room: SharedChatRoomDocument) {
  const currentDocument = await loadSharedChatRoomsDocument();

  if (!currentDocument) {
    return false;
  }

  const nextRooms = [room, ...currentDocument.rooms.filter((entry) => entry.id !== room.id)];

  return saveSharedChatRoomsDocument({ rooms: nextRooms });
}

async function loadSharedChatRoomsDocument() {
  const services = getFirebaseServices();

  if (!services) {
    return null;
  }

  const reference = doc(services.db, "appData", "chatRooms");
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    return { rooms: [] } satisfies SharedChatRoomsDocument;
  }

  return normalizeSharedChatRoomsDocument(snapshot.data());
}

async function saveSharedChatRoomsDocument(documentValue: SharedChatRoomsDocument) {
  const services = getFirebaseServices();

  if (!services) {
    return false;
  }

  const sanitizedDocument = stripUndefinedValues(documentValue) as unknown as Record<string, unknown>;
  await setDoc(doc(services.db, "appData", "chatRooms"), sanitizedDocument, { merge: true });
  return true;
}

async function loadEditablePostsDocument() {
  // SECURITY: Only load user-specific posts from their own profile
  // All posts are now stored per-user in userProfiles/{uid}/appData/postOverrides
  const overridePosts = await loadCurrentUserDocument(
    ["appData", "postOverrides"],
    POSTS_OVERRIDES_SEED,
    normalizePostsDocument
  );

  return {
    items: mergePersistedPosts(POSTS_SEED.items, overridePosts?.items ?? []),
  } satisfies PostsDocument;
}

async function persistEditablePostsDocument(documentValue: PostsDocument) {
  // SECURITY: Save only to user-specific posts location
  // This ensures posts are private and only accessible to the post owner
  const normalizedDocument = {
    items: documentValue.items.map((item) => preparePersistedPostItem(item)),
  } satisfies PostsDocument;

  return saveCurrentUserDocument(["appData", "postOverrides"], normalizedDocument);
}

async function loadCurrentUserChatRoomOverride(roomId: string) {
  const [overrides, connections] = await Promise.all([
    loadCurrentUserDocument(
      ["appData", "chatRoomOverrides"],
      CHAT_ROOM_OVERRIDES_SEED,
      normalizeChatRoomOverridesDocument,
    ),
    loadCurrentUserDocument(["appData", "connections"], CONNECTIONS_SEED, normalizeConnectionsDocument),
  ]);

  return (
    overrides?.rooms.find((room) => room.id === roomId) ??
    connections?.chatRooms.find((room) => room.id === roomId) ??
    CONNECTIONS_SEED.chatRooms.find((room) => room.id === roomId) ??
    null
  );
}

async function saveCurrentUserChatRoomOverride(room: ChatRoom) {
  const currentOverrides = await loadCurrentUserDocument(
    ["appData", "chatRoomOverrides"],
    CHAT_ROOM_OVERRIDES_SEED,
    normalizeChatRoomOverridesDocument,
  );

  if (!currentOverrides) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "chatRoomOverrides"], {
    rooms: [normalizeChatRoomView(room), ...currentOverrides.rooms.filter((entry) => entry.id !== room.id)],
  });
}

async function clearCurrentUserChatRoomOverride(roomId: string) {
  const currentOverrides = await loadCurrentUserDocument(
    ["appData", "chatRoomOverrides"],
    CHAT_ROOM_OVERRIDES_SEED,
    normalizeChatRoomOverridesDocument,
  );

  if (!currentOverrides) {
    return false;
  }

  if (!currentOverrides.rooms.some((room) => room.id === roomId)) {
    return true;
  }

  return saveCurrentUserDocument(["appData", "chatRoomOverrides"], {
    rooms: currentOverrides.rooms.filter((room) => room.id !== roomId),
  });
}

async function appendCurrentUserChatRoomMessage(
  roomId: string,
  message: ChatMessage,
  currentUserId: string,
) {
  const currentRoom = await loadCurrentUserChatRoomOverride(roomId);

  if (!currentRoom) {
    return false;
  }

  const nextMessages = [...currentRoom.messages, normalizeChatMessage({ ...message, senderId: currentUserId })];

  return saveCurrentUserChatRoomOverride({
    ...currentRoom,
    messages: nextMessages,
    preview: nextMessages[nextMessages.length - 1]?.content ?? currentRoom.preview,
    unreadCount: 0,
  });
}

async function persistSharedChatRoomWithFallback(
  room: SharedChatRoomDocument,
  currentUserId: string,
  friendList: FriendCard[] = [],
) {
  try {
    const saved = await saveSharedChatRoom(room);

    if (!saved) {
      return saveCurrentUserChatRoomOverride(createChatRoomView(room, currentUserId, friendList));
    }

    await clearCurrentUserChatRoomOverride(room.id);
    return true;
  } catch {
    return saveCurrentUserChatRoomOverride(createChatRoomView(room, currentUserId, friendList));
  }
}

function normalizeSharedContentDocument(value: unknown): SharedContentDocument {
  const record = asRecord(value);

  return {
    adminMessage: typeof record.adminMessage === "string" ? record.adminMessage : SHARED_CONTENT_SEED.adminMessage,
    advertisementsByLanguage: normalizeLocalizedArrayCollection(
      record.advertisementsByLanguage,
      SHARED_CONTENT_SEED.advertisementsByLanguage,
    ),
    communityEvents: Array.isArray(record.communityEvents)
      ? (record.communityEvents as CommunityItem[])
      : SHARED_CONTENT_SEED.communityEvents,
    documents: mergeSeededItemsById(
      Array.isArray(record.documents) ? (record.documents as DocumentItem[]) : [],
      SHARED_CONTENT_SEED.documents,
    ),
    facilities: Array.isArray(record.facilities)
      ? (record.facilities as FacilityItem[])
      : SHARED_CONTENT_SEED.facilities,
    faqItemsByLanguage: normalizeLocalizedArrayCollection(
      record.faqItemsByLanguage,
      SHARED_CONTENT_SEED.faqItemsByLanguage,
    ),
  };
}

function normalizeDashboardDocument(value: unknown): DashboardDocument {
  const record = asRecord(value);

  return {
    availableSlots: Array.isArray(record.availableSlots)
      ? (record.availableSlots as string[])
      : DASHBOARD_SEED.availableSlots,
    notificationsByLanguage: normalizeLocalizedArrayCollection(
      record.notificationsByLanguage,
      DASHBOARD_SEED.notificationsByLanguage,
    ),
    profileHistory: Array.isArray(record.profileHistory)
      ? (record.profileHistory as ProfileHistoryItem[])
      : DASHBOARD_SEED.profileHistory,
  };
}

function normalizePostsDocument(value: unknown): PostsDocument {
  const record = asRecord(value);

  return {
    items: Array.isArray(record.items)
      ? (record.items as FeedItem[]).map((item) => preparePersistedPostItem(item))
      : POSTS_SEED.items.map((item) => preparePersistedPostItem(item)),
  };
}

function normalizeBookingsDocument(value: unknown): BookingsDocument {
  const record = asRecord(value);

  return {
    items: Array.isArray(record.items) ? (record.items as BookingItem[]) : BOOKINGS_SEED.items,
  };
}

function normalizeConnectionsDocument(value: unknown): ConnectionsDocument {
  const record = asRecord(value);

  return {
    chatRooms: Array.isArray(record.chatRooms)
      ? (record.chatRooms as ChatRoom[]).map((room) => normalizeChatRoomView(room))
      : CONNECTIONS_SEED.chatRooms,
    friendList: Array.isArray(record.friendList)
      ? normalizeFriendCardList(record.friendList as FriendCard[])
      : CONNECTIONS_SEED.friendList,
  };
}

function normalizeChatRoomOverridesDocument(value: unknown): ChatRoomOverridesDocument {
  const record = asRecord(value);

  return {
    rooms: Array.isArray(record.rooms)
      ? (record.rooms as ChatRoom[]).map((room) => normalizeChatRoomView(room))
      : CHAT_ROOM_OVERRIDES_SEED.rooms,
  };
}

function normalizeChatRoomView(room: ChatRoom): ChatRoom {
  return {
    group: Boolean(room.group),
    id: typeof room.id === "string" ? room.id : `chat-room-${Date.now()}`,
    members: Array.isArray(room.members) ? room.members.filter(Boolean) : [],
    messages: Array.isArray(room.messages)
      ? room.messages.map((message) => normalizeChatMessage(message))
      : [],
    online: Boolean(room.online),
    preview: typeof room.preview === "string" ? room.preview : "",
    title: typeof room.title === "string" ? room.title : "Direct message",
    unreadCount: typeof room.unreadCount === "number" ? room.unreadCount : 0,
  } satisfies ChatRoom;
}

function normalizeFriendCardList(friendCards: FriendCard[]) {
  const uniqueFriends = new Map<string, FriendCard>();

  for (const friend of friendCards) {
    if (!friend?.id) {
      continue;
    }

    if (!uniqueFriends.has(friend.id)) {
      uniqueFriends.set(friend.id, {
        id: friend.id,
        name: friend.name || "",
        username: friend.username || "",
        avatar: friend.avatar || "U",
        bio: friend.bio || "",
        status: friend.status === "online" || friend.status === "offline" || friend.status === "busy" ? friend.status : "offline",
      });
    }
  }

  return [...uniqueFriends.values()];
}

function stripUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedValues(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entryValue]) => [key, stripUndefinedValues(entryValue)])
        .filter(([, entryValue]) => entryValue !== undefined),
    ) as T;
  }

  return value;
}

function normalizeFriendSuggestionsDocument(value: unknown): FriendSuggestionsDocument {
  const record = asRecord(value);

  return {
    items: Array.isArray(record.items) ? (record.items as FriendCard[]) : FRIEND_SUGGESTIONS_SEED.items,
  };
}

function normalizeAIConversationsDocument(value: unknown): AIConversationsDocument {
  const record = asRecord(value);

  return {
    conversations: Array.isArray(record.conversations)
      ? (record.conversations as AIConversation[])
      : AI_CONVERSATIONS_SEED.conversations,
    remainingQuestions:
      typeof record.remainingQuestions === "number"
        ? record.remainingQuestions
        : AI_CONVERSATIONS_SEED.remainingQuestions,
  };
}

function normalizeModerationReportsDocument(value: unknown): ModerationReportsDocument {
  const record = asRecord(value);

  return {
    items: Array.isArray(record.items)
      ? (record.items as ModerationReportItem[])
      : MODERATION_REPORTS_SEED.items,
  };
}

function normalizeBlockedUserItem(item: BlockedUserItem): BlockedUserItem {
  const name = item.name.trim() || "Resident";

  return {
    avatar: item.avatar || getAvatarLabel(name),
    blockedAt: typeof item.blockedAt === "string" && item.blockedAt ? item.blockedAt : new Date().toISOString(),
    id: item.id,
    name,
  };
}

function normalizeBlockedUsersDocument(value: unknown): BlockedUsersDocument {
  const record = asRecord(value);

  return {
    items: Array.isArray(record.items)
      ? (record.items as BlockedUserItem[]).map((item) => normalizeBlockedUserItem(item))
      : BLOCKED_USERS_SEED.items,
  };
}

function normalizeUserProfile(value: unknown): UserProfile {
  const record = asRecord(value);
  const firstName = typeof record.firstName === "string" ? record.firstName : currentUser.firstName;
  const lastName = typeof record.lastName === "string" ? record.lastName : currentUser.lastName;
  const name =
    typeof record.name === "string"
      ? record.name
      : [firstName, lastName].filter(Boolean).join(" ") || currentUser.name;

  // Check if user is admin based on email
  const services = getFirebaseServices();
  const currentEmail = services?.auth.currentUser?.email;
  let role: "admin" | "resident" = currentUser.role;
  
  if (record.role === "admin" || record.role === "resident") {
    role = record.role;
  }
  
  // Override role to admin if email is admin@admin.com
  if (currentEmail === "admin@admin.com") {
    role = "admin";
  }

  return {
    ...currentUser,
    id:
      typeof record.id === "string"
        ? record.id
        : typeof record.uid === "string"
          ? record.uid
          : currentUser.id,
    firstName,
    lastName,
    name,
    username: typeof record.username === "string" ? record.username : currentUser.username,
    email: typeof record.email === "string" ? record.email : currentUser.email,
    phone: typeof record.phone === "string" ? record.phone : currentUser.phone,
    country: typeof record.country === "string" ? record.country : currentUser.country,
    currentState: isCurrentState(record.currentState) ? record.currentState : currentUser.currentState,
    jobTitle: typeof record.jobTitle === "string" ? record.jobTitle : currentUser.jobTitle,
    avatar: typeof record.avatar === "string" ? record.avatar : getAvatarLabel(name),
    bio: typeof record.bio === "string" ? record.bio : currentUser.bio,
    role,
    status:
      record.status === "online" || record.status === "offline" || record.status === "busy"
        ? record.status
        : currentUser.status,
    points: typeof record.points === "number" ? record.points : currentUser.points,
  };
}

async function saveSharedDocument<T extends object>(path: [string, ...string[]], value: T) {
  const services = getFirebaseServices();

  if (!services) {
    return false;
  }

  const sanitizedValue = stripUndefinedValues(value);

  await setDoc(doc(services.db, ...path), sanitizedValue as Record<string, unknown>, { merge: true });
  return true;
}

async function saveCurrentUserDocument<T extends object>(path: [string, ...string[]], value: T) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return false;
  }

  const sanitizedValue = stripUndefinedValues(value);

  await setDoc(doc(services.db, "userProfiles", user.uid, ...path), sanitizedValue as Record<string, unknown>, { merge: true });
  return true;
}

async function loadSharedDocument<T>(path: [string, ...string[]], seedData: T, normalize: (value: unknown) => T) {
  const services = getFirebaseServices();

  if (!services) {
    return seedData;
  }

  const reference = doc(services.db, ...path);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    const sanitizedSeed = stripUndefinedValues(seedData);
    await setDoc(reference, sanitizedSeed as Record<string, unknown>, { merge: true });
    return seedData;
  }

  return normalize(snapshot.data());
}

async function loadCurrentUserDocument<T>(path: [string, ...string[]], seedData: T, normalize: (value: unknown) => T) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return null;
  }

  const reference = doc(services.db, "userProfiles", user.uid, ...path);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    const sanitizedSeed = stripUndefinedValues(seedData);
    await setDoc(reference, sanitizedSeed as Record<string, unknown>, { merge: true });
    return seedData;
  }

  return normalize(snapshot.data());
}

async function loadUserRootDocument<T>(uid: string, seedData: T, normalize: (value: unknown) => T) {
  const services = getFirebaseServices();

  if (!services) {
    return seedData;
  }

  const reference = doc(services.db, "userProfiles", uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    const sanitizedSeed = stripUndefinedValues(seedData);
    await setDoc(reference, sanitizedSeed as Record<string, unknown>, { merge: true });
    return seedData;
  }

  return normalize(snapshot.data());
}

function normalizeLocalizedArrayCollection<T>(value: unknown, fallback: Record<Language, T[]>) {
  const record = asRecord(value);

  return {
    en: Array.isArray(record.en) ? (record.en as T[]) : fallback.en,
    "zh-HK": Array.isArray(record["zh-HK"]) ? (record["zh-HK"] as T[]) : fallback["zh-HK"],
  } satisfies Record<Language, T[]>;
}

function mergeSeededItemsById<T extends { id: string }>(persisted: T[], seeded: T[]) {
  if (!persisted.length) {
    return seeded;
  }

  const persistedById = new Map(persisted.map((item) => [item.id, item]));
  const seededIds = new Set(seeded.map((item) => item.id));
  const reconciledSeededItems = seeded.map((item) => ({
    ...persistedById.get(item.id),
    ...item,
  }));
  const extraPersistedItems = persisted.filter((item) => !seededIds.has(item.id));

  return [...reconciledSeededItems, ...extraPersistedItems];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function getAvatarLabel(name: string) {
  const initials = name
    .split(/\s+/)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return initials || currentUser.avatar;
}

function isCurrentState(value: unknown): value is UserProfile["currentState"] {
  return value === "worker" || value === "employee" || value === "jobless" || value === "student";
}