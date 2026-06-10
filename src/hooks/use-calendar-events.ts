"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { useSyncExternalStore } from "react";
import { calendarEvents as seededCalendarEvents } from "@/lib/demo-data";
import { getFirebaseServices } from "@/lib/firebase";
import type { CalendarEventItem } from "@/lib/types";

const STORAGE_KEY = "to-link-calendar-events";
const listeners = new Set<() => void>();
let cachedRawEvents = "";
let cachedLocalEvents: CalendarEventItem[] = [];
let cachedRemoteEvents: CalendarEventItem[] = [];
let cachedSnapshot: CalendarEventItem[] = seededCalendarEvents;
let initialized = false;
let disposeRemoteListener: (() => void) | null = null;

export function useCalendarEvents() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureInitialized();

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      refreshLocalEvents();
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
      query(collection(services.db, "userProfiles", user.uid, "calendarEvents"), orderBy("createdAt", "desc")),
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

function rebuildSnapshot() {
  cachedSnapshot = [...seededCalendarEvents, ...mergeUserEvents(cachedRemoteEvents, cachedLocalEvents)];
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