"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";
import { friendList as seededFriendList, friendSuggestions as seededFriendSuggestions } from "@/lib/demo-data";
import type { UserProfile } from "@/lib/types";

export function useAdminUsersList() {
  const services = getFirebaseServices();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(Boolean(services));
  const [error, setError] = useState<string | null>(services ? null : "Firebase not configured");

  useEffect(() => {
    if (!services) {
      return;
    }

    let isActive = true;
    const usersRef = collection(services.db, "userProfiles");
    const usersQuery = query(usersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

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

        const realUserIds = new Set(usersList.map((user) => user.id));
        const combinedUsers = [
          ...usersList,
          ...demoUsers.filter((demo) => !realUserIds.has(demo.id)),
        ];

        if (!isActive) {
          return;
        }

        setUsers(combinedUsers);
        setError(null);
        setLoading(false);
      },
      (err) => {
        if (!isActive) {
          return;
        }

        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [services]);

  return { users, loading, error: services ? error : "Firebase not configured" };
}
