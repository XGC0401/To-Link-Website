"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseServices } from "@/lib/firebase";

type FirestoreDocumentStatus = "loading" | "ready" | "error";

interface FirestoreDocumentState<T> {
  data: T;
  error: string | null;
  ready: boolean;
  status: FirestoreDocumentStatus;
}

interface SeededDocumentOptions<T> {
  enabled?: boolean;
  parse: (value: unknown) => T;
  path: [string, ...string[]];
  seedData: T;
}

interface SeededUserDocumentOptions<T> {
  enabled?: boolean;
  parse: (value: unknown) => T;
  pathFactory: (uid: string) => [string, ...string[]];
  seedData: T;
}

interface FirestoreDocumentEntry {
  path: [string, ...string[]];
  pathKey: string;
  currentValue: unknown;
  ready: boolean;
  error: string | null;
  listeners: Set<() => void>;
  unsubscribe: (() => void) | null;
}

const firestoreDocumentRegistry = new Map<string, FirestoreDocumentEntry>();

function getDocumentPathKey(path: [string, ...string[]]) {
  return path.join("/");
}

function getOrCreateFirestoreDocumentEntry(path: [string, ...string[]]): FirestoreDocumentEntry {
  const pathKey = getDocumentPathKey(path);
  const existing = firestoreDocumentRegistry.get(pathKey);

  if (existing) {
    return existing;
  }

  const entry: FirestoreDocumentEntry = {
    path,
    pathKey,
    currentValue: undefined,
    ready: false,
    error: null,
    listeners: new Set(),
    unsubscribe: null,
  };

  firestoreDocumentRegistry.set(pathKey, entry);
  return entry;
}

function cleanupFirestoreDocumentEntry(entry: FirestoreDocumentEntry) {
  entry.unsubscribe?.();
  firestoreDocumentRegistry.delete(entry.pathKey);
}

function deriveFirestoreDocumentState<T extends object>(
  entry: FirestoreDocumentEntry,
  services: ReturnType<typeof getFirebaseServices> | null,
  seedData: T,
  parse: (value: unknown) => T,
): FirestoreDocumentState<T> {
  if (!services) {
    return {
      data: seedData,
      error: null,
      ready: true,
      status: "ready",
    };
  }

  const data = entry.currentValue === undefined ? seedData : parse(entry.currentValue);
  const status = entry.error ? "error" : entry.ready ? "ready" : "loading";

  return {
    data,
    error: entry.error,
    ready: entry.ready,
    status,
  };
}

function ensureFirestoreDocumentSubscription(
  entry: FirestoreDocumentEntry,
  services: ReturnType<typeof getFirebaseServices>,
  seedData: unknown,
) {
  if (entry.unsubscribe) {
    return;
  }

  const reference = doc(services.db, ...entry.path);

  entry.unsubscribe = onSnapshot(
    reference,
    (snapshot) => {
      if (!snapshot.exists()) {
        const sanitizedSeed = stripUndefinedValues(seedData) as Record<string, unknown>;
        void setDoc(reference, sanitizedSeed, { merge: true });
        entry.currentValue = sanitizedSeed;
        entry.ready = true;
        entry.error = null;
      } else {
        entry.currentValue = snapshot.data();
        entry.ready = true;
        entry.error = null;
      }

      for (const listener of entry.listeners) {
        listener();
      }
    },
    (error) => {
      entry.currentValue = undefined;
      entry.ready = true;
      entry.error = error.message;

      for (const listener of entry.listeners) {
        listener();
      }
    },
  );
}

function subscribeToFirestoreDocumentEntry(
  entry: FirestoreDocumentEntry,
  services: ReturnType<typeof getFirebaseServices>,
  seedData: unknown,
  listener: () => void,
) {
  entry.listeners.add(listener);
  ensureFirestoreDocumentSubscription(entry, services, seedData);

  return () => {
    entry.listeners.delete(listener);

    if (entry.listeners.size === 0) {
      cleanupFirestoreDocumentEntry(entry);
    }
  };
}

function stripUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedValues(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined),
    ) as T;
  }

  return value;
}

export function useSeededFirestoreDocument<T extends object>({
  enabled = true,
  parse,
  path,
  seedData,
}: SeededDocumentOptions<T>): FirestoreDocumentState<T> {
  const services = useMemo(() => getFirebaseServices(), []);
  const [state, setState] = useState<FirestoreDocumentState<T>>(() => ({
    data: seedData,
    error: null,
    ready: !enabled || !services,
    status: enabled && services ? "loading" : "ready",
  }));
  const fallbackState = useMemo<FirestoreDocumentState<T>>(
    () => ({
      data: seedData,
      error: null,
      ready: true,
      status: "ready",
    }),
    [seedData],
  );

  const entry = useMemo(() => getOrCreateFirestoreDocumentEntry(path), [path]);

  useEffect(() => {
    if (!enabled || !services) {
      return;
    }

    const updateState = () => setState(deriveFirestoreDocumentState(entry, services, seedData, parse));
    const unsubscribeEntry = subscribeToFirestoreDocumentEntry(entry, services, seedData, updateState);

    updateState();

    return unsubscribeEntry;
  }, [enabled, entry, parse, seedData, services]);

  return enabled && services ? state : fallbackState;
}

export function useSeededUserDocument<T extends object>({
  enabled = true,
  parse,
  pathFactory,
  seedData,
}: SeededUserDocumentOptions<T>): FirestoreDocumentState<T> {
  const services = useMemo(() => getFirebaseServices(), []);
  const [state, setState] = useState<FirestoreDocumentState<T>>(() => ({
    data: seedData,
    error: null,
    ready: !enabled || !services,
    status: enabled && services ? "loading" : "ready",
  }));
  const fallbackState = useMemo<FirestoreDocumentState<T>>(
    () => ({
      data: seedData,
      error: null,
      ready: true,
      status: "ready",
    }),
    [seedData],
  );
  const pathFactoryRef = useRef(pathFactory);

  useEffect(() => {
    pathFactoryRef.current = pathFactory;
  }, [pathFactory]);

  useEffect(() => {
    if (!enabled || !services) {
      return;
    }

    let unsubscribeEntry: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(services.auth, (user) => {
      unsubscribeEntry?.();
      unsubscribeEntry = undefined;

      if (!user) {
        setState({
          data: seedData,
          error: null,
          ready: true,
          status: "ready",
        });
        return;
      }

      const path = pathFactoryRef.current(user.uid);
      const entry = getOrCreateFirestoreDocumentEntry(path);
      const updateState = () => setState(deriveFirestoreDocumentState(entry, services, seedData, parse));
      unsubscribeEntry = subscribeToFirestoreDocumentEntry(entry, services, seedData, updateState);

      updateState();
    });

    return () => {
      unsubscribeEntry?.();
      unsubscribeAuth();
    };
  }, [enabled, parse, seedData, services]);

  return enabled && services ? state : fallbackState;
}