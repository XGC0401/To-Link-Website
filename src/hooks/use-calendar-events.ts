"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { useSyncExternalStore } from "react";
import { useToLink } from "@/lib/app-state";
import { calendarEvents as seededCalendarEvents } from "@/lib/demo-data";
import { getFirebaseServices } from "@/lib/firebase";
import { localizeCalendarEvents } from "@/lib/seeded-content-localization";
import type { CalendarEventItem } from "@/lib/types";

const STORAGE_KEY = "to-link-calendar-events";
const HIDDEN_SEEDED_STORAGE_KEY = "to-link-calendar-hidden-seeded-events";
const listeners = new Set<() => void>();
let cachedRawEvents = "";
let cachedLocalEvents: CalendarEventItem[] = [];
let cachedRemoteEvents: CalendarEventItem[] = [];
let cachedHiddenSeedIdsRaw = "";
let cachedHiddenSeedIds = new Set<string>();
let cachedSnapshot: CalendarEventItem[] = seededCalendarEvents;
let initialized = false;
let disposeRemoteListener: (() => void) | null = null;

export function useCalendarEvents() {
  const { language } = useToLink();
  const events = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return localizeCalendarEvents(language, events);
}

export function addCalendarEvent(event: CalendarEventItem) {
  if (typeof window === "undefined") {
    return;
  }

  ensureInitialized();

  const nextEvent = sanitizeCalendarEvent(event);

  persistEventLocally(nextEvent);

  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return;
  }

  void persistEventRemotely(user.uid, nextEvent);
}

export function removeCalendarEvent(eventId: string) {
  if (typeof window === "undefined") {
    return;
  }

  ensureInitialized();
  removeEventsByIds(new Set([eventId]));
}

export function removeCalendarEventsByTypeAndTitle(type: CalendarEventItem["type"], title: string) {
  if (typeof window === "undefined") {
    return;
  }

  ensureInitialized();

  const ids = cachedSnapshot
    .filter((event) => event.type === type && event.title === title)
    .map((event) => event.id);

  if (!ids.length) {
    return;
  }

  removeEventsByIds(new Set(ids));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureInitialized();

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === HIDDEN_SEEDED_STORAGE_KEY) {
      refreshLocalEvents();
      refreshHiddenSeedIds();
      rebuildSnapshot();
      emitChange();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  ensureInitialized();

  return cachedSnapshot;
}

function getServerSnapshot() {
  return seededCalendarEvents;
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function ensureInitialized() {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  initialized = true;
  refreshLocalEvents();
  refreshHiddenSeedIds();
  rebuildSnapshot();

  const services = getFirebaseServices();

  if (!services) {
    return;
  }

  onAuthStateChanged(services.auth, (user) => {
    if (disposeRemoteListener) {
      disposeRemoteListener();
      disposeRemoteListener = null;
    }

    if (!user) {
      cachedRemoteEvents = [];
      rebuildSnapshot();
      emitChange();
      return;
    }

    void syncLocalEventsToFirestore(user.uid);

    disposeRemoteListener = onSnapshot(
      query(
        collection(services.db, "userProfiles", user.uid, "calendarEvents"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
      (snapshot) => {
        cachedRemoteEvents = snapshot.docs
          .map((document) => toCalendarEventItem(document.id, document.data()))
          .filter((event): event is CalendarEventItem => Boolean(event));

        prunePersistedLocalEvents(cachedRemoteEvents.map((event) => event.id));
        rebuildSnapshot();
        emitChange();
      },
      () => {
        cachedRemoteEvents = [];
        rebuildSnapshot();
        emitChange();
      },
    );
  });
}

function getStoredUserEvents() {
  if (typeof window === "undefined") {
    return [] as CalendarEventItem[];
  }

  refreshLocalEvents();

  return cachedLocalEvents;
}

function refreshLocalEvents() {
  if (typeof window === "undefined") {
    return;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY) ?? "";

  if (rawValue === cachedRawEvents) {
    return;
  }

  cachedRawEvents = rawValue;
  cachedLocalEvents = parseStoredUserEvents(rawValue);
}

function refreshHiddenSeedIds() {
  if (typeof window === "undefined") {
    return;
  }

  const rawValue = window.localStorage.getItem(HIDDEN_SEEDED_STORAGE_KEY) ?? "";

  if (rawValue === cachedHiddenSeedIdsRaw) {
    return;
  }

  cachedHiddenSeedIdsRaw = rawValue;
  cachedHiddenSeedIds = parseHiddenSeedIds(rawValue);
}

function rebuildSnapshot() {
  const visibleSeededEvents = seededCalendarEvents.filter((event) => !cachedHiddenSeedIds.has(event.id));
  cachedSnapshot = [...visibleSeededEvents, ...mergeUserEvents(cachedRemoteEvents, cachedLocalEvents)];
}

function mergeUserEvents(...sources: CalendarEventItem[][]) {
  const merged = new Map<string, CalendarEventItem>();

  for (const source of sources) {
    for (const event of source) {
      if (!merged.has(event.id)) {
        merged.set(event.id, event);
      }
    }
  }

  return Array.from(merged.values());
}

function persistEventLocally(event: CalendarEventItem) {
  const nextEvents = [event, ...getStoredUserEvents().filter((current) => current.id !== event.id)];
  const nextRawEvents = JSON.stringify(nextEvents);

  window.localStorage.setItem(STORAGE_KEY, nextRawEvents);
  cachedRawEvents = nextRawEvents;
  cachedLocalEvents = nextEvents;
  rebuildSnapshot();
  emitChange();
}

function removeEventsByIds(eventIds: Set<string>) {
  if (!eventIds.size) {
    return;
  }

  const visibleSeededEventIds = new Set(seededCalendarEvents.map((event) => event.id));
  let hiddenSeedChanged = false;

  for (const eventId of eventIds) {
    if (visibleSeededEventIds.has(eventId)) {
      cachedHiddenSeedIds.add(eventId);
      hiddenSeedChanged = true;
    }
  }

  if (hiddenSeedChanged) {
    persistHiddenSeedIds();
  }

  const nextLocalEvents = cachedLocalEvents.filter((event) => !eventIds.has(event.id));

  if (nextLocalEvents.length !== cachedLocalEvents.length) {
    const nextRawEvents = JSON.stringify(nextLocalEvents);
    window.localStorage.setItem(STORAGE_KEY, nextRawEvents);
    cachedRawEvents = nextRawEvents;
    cachedLocalEvents = nextLocalEvents;
  }

  cachedRemoteEvents = cachedRemoteEvents.filter((event) => !eventIds.has(event.id));
  rebuildSnapshot();
  emitChange();

  const services = getFirebaseServices();
  const user = services?.auth.currentUser;

  if (!services || !user) {
    return;
  }

  for (const eventId of eventIds) {
    void removeEventRemotely(user.uid, eventId);
  }
}

function persistHiddenSeedIds() {
  const nextRawValue = JSON.stringify([...cachedHiddenSeedIds]);
  window.localStorage.setItem(HIDDEN_SEEDED_STORAGE_KEY, nextRawValue);
  cachedHiddenSeedIdsRaw = nextRawValue;
}

async function persistEventRemotely(userId: string, event: CalendarEventItem) {
  const services = getFirebaseServices();

  if (!services) {
    return;
  }

  await setDoc(doc(services.db, "userProfiles", userId, "calendarEvents", event.id), {
    ...event,
    createdAt: new Date().toISOString(),
  });
}

async function removeEventRemotely(userId: string, eventId: string) {
  const services = getFirebaseServices();

  if (!services) {
    return;
  }

  await deleteDoc(doc(services.db, "userProfiles", userId, "calendarEvents", eventId));
}

async function syncLocalEventsToFirestore(userId: string) {
  const localEvents = getStoredUserEvents();

  if (!localEvents.length) {
    return;
  }

  await Promise.allSettled(localEvents.map((event) => persistEventRemotely(userId, event)));
}

function prunePersistedLocalEvents(persistedIds: string[]) {
  if (typeof window === "undefined" || !persistedIds.length) {
    return;
  }

  const persistedIdSet = new Set(persistedIds);
  const nextLocalEvents = getStoredUserEvents().filter((event) => !persistedIdSet.has(event.id));

  if (nextLocalEvents.length === cachedLocalEvents.length) {
    return;
  }

  const nextRawEvents = JSON.stringify(nextLocalEvents);

  window.localStorage.setItem(STORAGE_KEY, nextRawEvents);
  cachedRawEvents = nextRawEvents;
  cachedLocalEvents = nextLocalEvents;
}

function sanitizeCalendarEvent(event: CalendarEventItem): CalendarEventItem {
  return {
    ...event,
    date: event.date.trim(),
    description: event.description.trim(),
    timeLabel: event.timeLabel.trim(),
    title: event.title.trim(),
  };
}

function toCalendarEventItem(id: string, value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const event = {
    id,
    title: record.title,
    description: record.description,
    date: record.date,
    timeLabel: record.timeLabel,
    type: record.type,
  };

  return isCalendarEventItem(event) ? event : null;
}

function parseStoredUserEvents(rawValue: string | null) {
  try {
    if (!rawValue) {
      return [] as CalendarEventItem[];
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as CalendarEventItem[];
    }

    return parsed.filter(isCalendarEventItem);
  } catch {
    return [] as CalendarEventItem[];
  }
}

function parseHiddenSeedIds(rawValue: string | null) {
  try {
    if (!rawValue) {
      return new Set<string>();
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((value): value is string => typeof value === "string" && value.trim().length > 0));
  } catch {
    return new Set<string>();
  }
}

function isCalendarEventItem(value: unknown): value is CalendarEventItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.description === "string" &&
    typeof record.date === "string" &&
    typeof record.timeLabel === "string" &&
    (record.type === "booking" || record.type === "joined" || record.type === "personal")
  );
}