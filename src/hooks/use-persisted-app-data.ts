"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
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
import { getFirebaseServices } from "@/lib/firebase";
import type {
  Advertisement,
  AIConversation,
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
  NotificationItem,
  ProfileHistoryItem,
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

interface FriendSuggestionsDocument {
  items: FriendCard[];
}

interface AIConversationsDocument {
  conversations: AIConversation[];
  remainingQuestions: number;
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

const BOOKINGS_SEED: BookingsDocument = {
  items: seededBookings,
};

const CONNECTIONS_SEED: ConnectionsDocument = {
  chatRooms: seededChatRooms,
  friendList: seededFriendList,
};

const FRIEND_SUGGESTIONS_SEED: FriendSuggestionsDocument = {
  items: seededFriendSuggestions,
};

const AI_CONVERSATIONS_SEED: AIConversationsDocument = {
  conversations: seededAiConversations,
  remainingQuestions: 20,
};

export function usePersistedCurrentUserProfile() {
  const state = useSeededUserDocument<UserProfile>({
    pathFactory: (uid) => ["userProfiles", uid],
    parse: normalizeUserProfile,
    seedData: currentUser,
  });

  return {
    ...state,
    profile: state.data,
  };
}

export function usePersistedDashboardData() {
  const state = useSeededUserDocument<DashboardDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "dashboard"],
    parse: normalizeDashboardDocument,
    seedData: DASHBOARD_SEED,
  });

  return {
    ...state,
    availableSlots: state.data.availableSlots,
    notificationsByLanguage: state.data.notificationsByLanguage,
    profileHistory: state.data.profileHistory,
  };
}

export function usePersistedSharedContent() {
  const state = useSeededFirestoreDocument<SharedContentDocument>({
    parse: normalizeSharedContentDocument,
    path: ["appData", "sharedContent"],
    seedData: SHARED_CONTENT_SEED,
  });

  return {
    ...state,
    adminMessage: state.data.adminMessage,
    advertisementsByLanguage: state.data.advertisementsByLanguage,
    communityEvents: state.data.communityEvents,
    documents: state.data.documents,
    facilities: state.data.facilities,
    faqItemsByLanguage: state.data.faqItemsByLanguage,
  };
}

export function usePersistedPosts() {
  const state = useSeededFirestoreDocument<PostsDocument>({
    parse: normalizePostsDocument,
    path: ["appData", "posts"],
    seedData: POSTS_SEED,
  });

  return {
    ...state,
    items: state.data.items,
  };
}

export function usePersistedBookings() {
  const state = useSeededUserDocument<BookingsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "bookings"],
    parse: normalizeBookingsDocument,
    seedData: BOOKINGS_SEED,
  });

  return {
    ...state,
    items: state.data.items,
  };
}

export function usePersistedConnections() {
  const connectionsState = useSeededUserDocument<ConnectionsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "connections"],
    parse: normalizeConnectionsDocument,
    seedData: CONNECTIONS_SEED,
  });
  const suggestionsState = useSeededFirestoreDocument<FriendSuggestionsDocument>({
    parse: normalizeFriendSuggestionsDocument,
    path: ["appData", "friendSuggestions"],
    seedData: FRIEND_SUGGESTIONS_SEED,
  });

  return {
    chatRooms: connectionsState.data.chatRooms,
    error: connectionsState.error ?? suggestionsState.error,
    friendList: connectionsState.data.friendList,
    friendSuggestions: suggestionsState.data.items,
    ready: connectionsState.ready && suggestionsState.ready,
    status:
      connectionsState.status === "error" || suggestionsState.status === "error"
        ? "error"
        : connectionsState.status === "loading" || suggestionsState.status === "loading"
          ? "loading"
          : "ready",
  };
}

export function usePersistedAiConversations() {
  const state = useSeededUserDocument<AIConversationsDocument>({
    pathFactory: (uid) => ["userProfiles", uid, "appData", "aiConversations"],
    parse: normalizeAIConversationsDocument,
    seedData: AI_CONVERSATIONS_SEED,
  });

  return {
    ...state,
    conversations: state.data.conversations,
    remainingQuestions: state.data.remainingQuestions,
  };
}

export async function savePersistedCurrentUserProfile(profilePatch: Partial<UserProfile>) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return false;
  }

  const currentProfile = await loadUserRootDocument(user.uid, currentUser, normalizeUserProfile);
  const nextProfile = normalizeUserProfile({
    ...currentProfile,
    ...profilePatch,
    uid: user.uid,
  });

  await setDoc(doc(services.db, "userProfiles", user.uid), nextProfile, { merge: true });
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

export async function createPersistedPost(item: FeedItem) {
  const currentPosts = await loadSharedDocument(["appData", "posts"], POSTS_SEED, normalizePostsDocument);

  await saveSharedDocument(["appData", "posts"], {
    items: [item, ...currentPosts.items.filter((entry) => entry.id !== item.id)],
  });
}

export async function likePersistedPost(postId: string) {
  const currentPosts = await loadSharedDocument(["appData", "posts"], POSTS_SEED, normalizePostsDocument);

  await saveSharedDocument(["appData", "posts"], {
    items: currentPosts.items.map((item) =>
      item.id === postId ? { ...item, likes: item.likes + 1 } : item,
    ),
  });
}

export async function deletePersistedPost(postId: string) {
  const currentPosts = await loadSharedDocument(["appData", "posts"], POSTS_SEED, normalizePostsDocument);
  const removed = currentPosts.items.find((item) => item.id === postId) ?? null;

  await saveSharedDocument(["appData", "posts"], {
    items: currentPosts.items.filter((item) => item.id !== postId),
  });

  return removed;
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
  const currentConnections = await loadCurrentUserDocument(["appData", "connections"], CONNECTIONS_SEED, normalizeConnectionsDocument);

  if (!currentConnections) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "connections"], {
    ...currentConnections,
    chatRooms: currentConnections.chatRooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            preview: message.content,
            messages: [...room.messages, message],
          }
        : room,
    ),
  });
}

export async function createPersistedGroupChat(chatRoom: ChatRoom) {
  const currentConnections = await loadCurrentUserDocument(["appData", "connections"], CONNECTIONS_SEED, normalizeConnectionsDocument);

  if (!currentConnections) {
    return false;
  }

  return saveCurrentUserDocument(["appData", "connections"], {
    ...currentConnections,
    chatRooms: [chatRoom, ...currentConnections.chatRooms.filter((room) => room.id !== chatRoom.id)],
  });
}

export async function savePersistedAiConversations(documentValue: AIConversationsDocument) {
  return saveCurrentUserDocument(["appData", "aiConversations"], documentValue);
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
    documents: Array.isArray(record.documents)
      ? (record.documents as DocumentItem[])
      : SHARED_CONTENT_SEED.documents,
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
    items: Array.isArray(record.items) ? (record.items as FeedItem[]) : POSTS_SEED.items,
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
      ? (record.chatRooms as ChatRoom[])
      : CONNECTIONS_SEED.chatRooms,
    friendList: Array.isArray(record.friendList)
      ? (record.friendList as FriendCard[])
      : CONNECTIONS_SEED.friendList,
  };
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

function normalizeUserProfile(value: unknown): UserProfile {
  const record = asRecord(value);
  const firstName = typeof record.firstName === "string" ? record.firstName : currentUser.firstName;
  const lastName = typeof record.lastName === "string" ? record.lastName : currentUser.lastName;
  const name =
    typeof record.name === "string"
      ? record.name
      : [firstName, lastName].filter(Boolean).join(" ") || currentUser.name;

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
    role: record.role === "admin" || record.role === "resident" ? record.role : currentUser.role,
    status:
      record.status === "online" || record.status === "offline" || record.status === "busy"
        ? record.status
        : currentUser.status,
    points: typeof record.points === "number" ? record.points : currentUser.points,
  };
}

async function saveSharedDocument(path: string[], value: Record<string, unknown>) {
  const services = getFirebaseServices();

  if (!services) {
    return false;
  }

  await setDoc(doc(services.db, ...path), value, { merge: true });
  return true;
}

async function saveCurrentUserDocument(path: string[], value: Record<string, unknown>) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return false;
  }

  await setDoc(doc(services.db, "userProfiles", user.uid, ...path), value, { merge: true });
  return true;
}

async function loadSharedDocument<T>(path: string[], seedData: T, normalize: (value: unknown) => T) {
  const services = getFirebaseServices();

  if (!services) {
    return seedData;
  }

  const reference = doc(services.db, ...path);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    await setDoc(reference, seedData as Record<string, unknown>, { merge: true });
    return seedData;
  }

  return normalize(snapshot.data());
}

async function loadCurrentUserDocument<T>(path: string[], seedData: T, normalize: (value: unknown) => T) {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return null;
  }

  const reference = doc(services.db, "userProfiles", user.uid, ...path);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    await setDoc(reference, seedData as Record<string, unknown>, { merge: true });
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
    await setDoc(reference, seedData as Record<string, unknown>, { merge: true });
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getAvatarLabel(name: string) {
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