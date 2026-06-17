"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase";

type FirestoreDocumentStatus = "loading" | "ready" | "error";

interface FirestoreDocumentState<T> {
  data: T;
  error: string | null;
  ready: boolean;
  status: FirestoreDocumentStatus;
  refresh: () => void;
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

const POLL_INTERVAL_MS = 5000;

export function useSeededFirestoreDocument<T extends object>({
  enabled = true,
  parse,
  path,
  seedData,
}: SeededDocumentOptions<T>): FirestoreDocumentState<T> {
  const pathKey = path.join("/");

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [state, setState] = useState<Omit<FirestoreDocumentState<T>, "refresh">>(() => ({
    data: seedData,
    error: null,
    ready: !enabled || !isFirebaseConfigured,
    status: enabled && isFirebaseConfigured ? "loading" : "ready",
  }));

  const fallbackState = useMemo<FirestoreDocumentState<T>>(
    () => ({
      data: seedData,
      error: null,
      ready: true,
      status: "ready",
      refresh,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seedData],
  );

  const parseRef = useRef(parse);
  parseRef.current = parse;
  const seedDataRef = useRef(seedData);
  seedDataRef.current = seedData;

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) {
      return;
    }

    const services = getFirebaseServices();

    if (!services) {
      return;
    }

    const segments = pathKey.split("/") as [string, ...string[]];
    const reference = doc(services.db, ...segments);

    async function fetchDoc() {
      try {
        const snapshot = await getDoc(reference);

        if (!snapshot.exists()) {
          void setDoc(reference, seedDataRef.current as Record<string, unknown>, { merge: true });
          setState({
            data: seedDataRef.current,
            error: null,
            ready: true,
            status: "ready",
          });
          return;
        }

        setState({
          data: parseRef.current(snapshot.data()),
          error: null,
          ready: true,
          status: "ready",
        });
      } catch (error) {
        setState({
          data: seedDataRef.current,
          error: error instanceof Error ? error.message : "Fetch failed",
          ready: true,
          status: "error",
        });
      }
    }

    void fetchDoc();
    const interval = setInterval(() => void fetchDoc(), POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, pathKey, refreshKey]);

  return enabled && isFirebaseConfigured ? { ...state, refresh } : fallbackState;
}

export function useSeededUserDocument<T extends object>({
  enabled = true,
  parse,
  pathFactory,
  seedData,
}: SeededUserDocumentOptions<T>): FirestoreDocumentState<T> {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [state, setState] = useState<Omit<FirestoreDocumentState<T>, "refresh">>(() => ({
    data: seedData,
    error: null,
    ready: !enabled || !isFirebaseConfigured,
    status: enabled && isFirebaseConfigured ? "loading" : "ready",
  }));

  const fallbackState = useMemo<FirestoreDocumentState<T>>(
    () => ({
      data: seedData,
      error: null,
      ready: true,
      status: "ready",
      refresh,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seedData],
  );

  const parseRef = useRef(parse);
  parseRef.current = parse;
  const pathFactoryRef = useRef(pathFactory);
  pathFactoryRef.current = pathFactory;
  const seedDataRef = useRef(seedData);
  seedDataRef.current = seedData;

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) {
      return;
    }

    const services = getFirebaseServices();

    if (!services) {
      return;
    }

    let currentUserId: string | null = null;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function fetchDoc(uid: string) {
      const svc = getFirebaseServices();

      if (!svc) return;

      const path = pathFactoryRef.current(uid);
      const reference = doc(svc.db, ...path);

      try {
        const snapshot = await getDoc(reference);

        if (!snapshot.exists()) {
          void setDoc(reference, seedDataRef.current as Record<string, unknown>, { merge: true });
          setState({
            data: seedDataRef.current,
            error: null,
            ready: true,
            status: "ready",
          });
          return;
        }

        setState({
          data: parseRef.current(snapshot.data()),
          error: null,
          ready: true,
          status: "ready",
        });
      } catch (error) {
        setState({
          data: seedDataRef.current,
          error: error instanceof Error ? error.message : "Fetch failed",
          ready: true,
          status: "error",
        });
      }
    }

    const unsubscribeAuth = onAuthStateChanged(services.auth, (user) => {
      clearInterval(intervalId);
      intervalId = undefined;
      currentUserId = null;

      if (!user) {
        setState({
          data: seedDataRef.current,
          error: null,
          ready: true,
          status: "ready",
        });
        return;
      }

      currentUserId = user.uid;
      void fetchDoc(user.uid);
      intervalId = setInterval(() => {
        if (currentUserId) void fetchDoc(currentUserId);
      }, POLL_INTERVAL_MS);
    });

    return () => {
      clearInterval(intervalId);
      unsubscribeAuth();
    };
  }, [enabled, refreshKey]);

  return enabled && isFirebaseConfigured ? { ...state, refresh } : fallbackState;
}
