"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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
  path: string[];
  seedData: T;
}

interface SeededUserDocumentOptions<T> {
  enabled?: boolean;
  parse: (value: unknown) => T;
  pathFactory: (uid: string) => string[];
  seedData: T;
}

export function useSeededFirestoreDocument<T>({
  enabled = true,
  parse,
  path,
  seedData,
}: SeededDocumentOptions<T>): FirestoreDocumentState<T> {
  const services = getFirebaseServices();
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

  const pathKey = useMemo(() => path.join("/"), [path]);

  useEffect(() => {
    if (!enabled || !services) {
      return;
    }

    const reference = doc(services.db, ...path);

    return onSnapshot(
      reference,
      (snapshot) => {
        if (!snapshot.exists()) {
          void setDoc(reference, seedData, { merge: true });
          setState({
            data: seedData,
            error: null,
            ready: true,
            status: "ready",
          });
          return;
        }

        setState({
          data: parse(snapshot.data()),
          error: null,
          ready: true,
          status: "ready",
        });
      },
      (error) => {
        setState({
          data: seedData,
          error: error.message,
          ready: true,
          status: "error",
        });
      },
    );
  }, [enabled, parse, pathKey, path, seedData, services]);

  return enabled && services ? state : fallbackState;
}

export function useSeededUserDocument<T>({
  enabled = true,
  parse,
  pathFactory,
  seedData,
}: SeededUserDocumentOptions<T>): FirestoreDocumentState<T> {
  const services = getFirebaseServices();
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

  useEffect(() => {
    if (!enabled || !services) {
      return;
    }

    let unsubscribeDocument: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(services.auth, (user) => {
      unsubscribeDocument?.();
      unsubscribeDocument = undefined;

      if (!user) {
        setState({
          data: seedData,
          error: null,
          ready: true,
          status: "ready",
        });
        return;
      }

      const path = pathFactory(user.uid);
      const reference = doc(services.db, ...path);

      unsubscribeDocument = onSnapshot(
        reference,
        (snapshot) => {
          if (!snapshot.exists()) {
            void setDoc(reference, seedData, { merge: true });
            setState({
              data: seedData,
              error: null,
              ready: true,
              status: "ready",
            });
            return;
          }

          setState({
            data: parse(snapshot.data()),
            error: null,
            ready: true,
            status: "ready",
          });
        },
        (error) => {
          setState({
            data: seedData,
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
  }, [enabled, parse, pathFactory, seedData, services]);

  return enabled && services ? state : fallbackState;
}