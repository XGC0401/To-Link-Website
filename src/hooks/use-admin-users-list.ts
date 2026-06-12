"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";
import { friendList as seededFriendList, friendSuggestions as seededFriendSuggestions } from "@/lib/demo-data";
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

          // Include demo accounts for testing/search functionality
          const demoUsers = [...seededFriendList, ...seededFriendSuggestions].map((friend) => ({
            id: friend.id,
            firstName: friend.name.split(" ")[0],
            lastName: friend.name.split(" ").slice(1).join(" "),
            name: friend.name,
            username: friend.username,
            email: `${friend.username}@example.com`,
            phone: "",
            country: "Hong Kong",
            currentState: "employee" as const,
            jobTitle: "",
            avatar: friend.avatar,
            bio: friend.bio,
            role: "resident" as const,
            status: friend.status,
            points: 0,
          }));

          // Combine real users with demo users (avoiding duplicates)
          const realUserIds = new Set(usersList.map((u) => u.id));
          const combinedUsers = [
            ...usersList,
            ...demoUsers.filter((demo) => !realUserIds.has(demo.id)),
          ];

          setUsers(combinedUsers);
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
