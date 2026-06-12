"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";

export function useOnlineStatusTracker() {
  useEffect(() => {
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
