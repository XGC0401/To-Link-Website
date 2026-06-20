"use client";

import { useEffect, useState } from "react";
import { Search, Circle } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { useAdminUsersList } from "@/hooks/use-admin-users-list";
import { usePersistedCurrentUserProfile } from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export function UserListScreen() {
  const { language } = useToLink();
  const router = useRouter();
  const { profile, ready } = usePersistedCurrentUserProfile();
  const { users, loading } = useAdminUsersList();
  const [query, setQuery] = useState("");

  // Redirect non-admin users
  useEffect(() => {
    if (ready && profile.role !== "admin") {
      router.push("/home");
    }
  }, [ready, profile.role, router]);

  const filteredUsers = useMemo(
    () => {
      if (!query.trim()) {
        return users; // Show all users if search is empty
      }

      const queryLower = query.toLowerCase();
      return users.filter((user) => {
        const matchesName = user.name?.toLowerCase().includes(queryLower) ?? false;
        const matchesUsername = user.username?.toLowerCase().includes(queryLower) ?? false;
        const matchesEmail = user.email?.toLowerCase().includes(queryLower) ?? false;
        
        return matchesName || matchesUsername || matchesEmail;
      });
    },
    [users, query],
  );

  const getStatusColor = (status: UserProfile["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: UserProfile["status"]) => {
    switch (status) {
      case "online":
        return language === "zh-HK" ? "線上" : "Online";
      case "busy":
        return language === "zh-HK" ? "忙碌" : "Busy";
      case "offline":
        return language === "zh-HK" ? "離線" : "Offline";
      default:
        return status;
    }
  };

  return (
    <FeatureShell
      description={
        language === "zh-HK"
          ? "查看所有註冊的用戶並監控其在線狀態"
          : "View all registered users and monitor their online status"
      }
      title={language === "zh-HK" ? "用戶列表" : "User List"}
      contentClassName="min-h-0"
      toolbar={
        <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm w-full">
          <Search className="h-4 w-4 text-muted" />
          <input
            className="w-full bg-transparent outline-none"
            id="user-list-search"
            name="user-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === "zh-HK" ? "搜尋用戶..." : "Search users..."}
            value={query}
          />
        </label>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-muted">
              {language === "zh-HK" ? "載入中..." : "Loading..."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted">
                <p>
                  {language === "zh-HK" ? "沒有找到用戶" : "No users found"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start gap-4 rounded-[24px] border border-border bg-panel-strong p-4"
                >
                  <div className="relative flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {user.avatar}
                    </div>
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-panel-strong",
                        getStatusColor(user.status),
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {user.name}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                          user.role === "admin"
                            ? "bg-accent/20 text-accent"
                            : "bg-muted/20 text-muted",
                        )}
                      >
                        {user.role === "admin"
                          ? language === "zh-HK"
                            ? "管理員"
                            : "Admin"
                          : language === "zh-HK"
                            ? "用戶"
                            : "User"}
                      </span>
                    </div>
                    <p className="text-sm text-muted truncate">@{user.username}</p>
                    <p className="text-sm text-muted truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          getStatusColor(user.status),
                        )}
                      />
                      <span className="text-xs text-muted">
                        {getStatusLabel(user.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted">
                      {user.phone ? <span title="Phone">{user.phone}</span> : null}
                      {user.country ? <span title="Country">{user.country}</span> : null}
                      {user.jobTitle ? <span title="Job Title">{user.jobTitle}</span> : null}
                    </div>
                    {user.bio ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {user.bio}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-center text-sm text-muted py-4">
            {language === "zh-HK"
              ? `共 ${filteredUsers.length} 個用戶`
              : `Total ${filteredUsers.length} users`}
          </p>
        </div>
      )}
    </FeatureShell>
  );
}
