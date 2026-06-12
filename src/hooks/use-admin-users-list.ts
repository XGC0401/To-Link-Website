"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

export function useAdminUsersList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const services = getFirebaseServices();

    if (!services) {
      setError("Firebase not configured");
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(services.db, "userProfiles");
      const usersQuery = query(usersRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        usersQuery,
        (snapshot) => {
          const usersList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              name: data.name || "",
              username: data.username || "",
              email: data.email || "",
              phone: data.phone || "",
              country: data.country || "",
              currentState: data.currentState || "employee",
              jobTitle: data.jobTitle || "",
              avatar: data.avatar || "",
              bio: data.bio || "",
              role: data.role || "resident",
              status: data.status || "offline",
              points: data.points || 0,
            } as UserProfile;
          });

          setUsers(usersList);
          setError(null);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );

      setLoading(false);
      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }, []);

  return { users, loading, error };
}
