"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";

const ADMIN_SESSION_STORAGE_KEY = "to-link-hardcoded-admin-session";

export function useOnlineStatusTracker() {
  useEffect(() => {
    // Admin uses a hardcoded session — skip writing to Firestore so the
    // partial-document race condition doesn't overwrite the profile seed.
    if (typeof window !== "undefined" && window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === "1") {
      return;
    }

    const services = getFirebaseServices();

    if (!services) {
      return;
    }

    const unsubscribe = onAuthStateChanged(services.auth, async (user) => {
      if (!user) {
        // User logged out
        return;
      }

      // User logged in - set status to online
      try {
        await setDoc(
          doc(services.db, "userProfiles", user.uid),
          {
            status: "online",
            lastSeen: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to update online status:", error);
      }

      // Listen for window close/navigation
      const handleBeforeUnload = async () => {
        try {
          await setDoc(
            doc(services.db, "userProfiles", user.uid),
            {
              status: "offline",
              lastSeen: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Failed to update offline status:", error);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
