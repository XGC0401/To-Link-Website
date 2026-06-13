"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase";

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

export function useSeededFirestoreDocument<T extends object>({
  enabled = true,
  parse,
  path,
  seedData,
}: SeededDocumentOptions<T>): FirestoreDocumentState<T> {
  const pathKey = path.join("/");

  const [state, setState] = useState<FirestoreDocumentState<T>>(() => ({
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
    }),
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

    return onSnapshot(
      reference,
      (snapshot) => {
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
      },
      (error) => {
        setState({
          data: seedDataRef.current,
          error: error.message,
          ready: true,
          status: "error",
        });
      },
    );
  }, [enabled, pathKey]);

  return enabled && isFirebaseConfigured ? state : fallbackState;
}

export function useSeededUserDocument<T extends object>({
  enabled = true,
  parse,
  pathFactory,
  seedData,
}: SeededUserDocumentOptions<T>): FirestoreDocumentState<T> {
  const [state, setState] = useState<FirestoreDocumentState<T>>(() => ({
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
    }),
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

    let unsubscribeDocument: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(services.auth, (user) => {
      unsubscribeDocument?.();
      unsubscribeDocument = undefined;

      if (!user) {
        setState({
          data: seedDataRef.current,
          error: null,
          ready: true,
          status: "ready",
        });
        return;
      }

      const path = pathFactoryRef.current(user.uid);
      const reference = doc(services.db, ...path);

      unsubscribeDocument = onSnapshot(
        reference,
        (snapshot) => {
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
        },
        (error) => {
          setState({
            data: seedDataRef.current,
            error: error.message,
            ready: true,
            status: "error",
          });
        },
      );
    });

    return () => {
      unsubscribeDocument?.();
      unsubscribeAuth();
    };
  }, [enabled]);

  return enabled && isFirebaseConfigured ? state : fallbackState;
}
