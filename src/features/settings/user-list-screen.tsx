"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { useAdminUsersList } from "@/hooks/use-admin-users-list";
import { adminDeletePersistedUser, usePersistedCurrentUserProfile } from "@/hooks/use-persisted-app-data";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export function UserListScreen() {
  const { language } = useToLink();
  const router = useRouter();
  const { profile, ready } = usePersistedCurrentUserProfile();
  const { users, loading } = useAdminUsersList();
  const [query, setQuery] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<UserProfile | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (ready && profile.role !== "admin") {
      router.push("/home");
    }
  }, [ready, profile.role, router]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) {
      return users;
    }

    const queryLower = query.toLowerCase();

    return users.filter((user) => {
      const matchesName = user.name?.toLowerCase().includes(queryLower) ?? false;
      const matchesUsername = user.username?.toLowerCase().includes(queryLower) ?? false;
      const matchesEmail = user.email?.toLowerCase().includes(queryLower) ?? false;

      return matchesName || matchesUsername || matchesEmail;
    });
  }, [users, query]);

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

  async function handleDeleteUser() {
    if (!deleteCandidate) return;

    setDeleteSubmitting(true);

    try {
      await adminDeletePersistedUser({
        id: deleteCandidate.id,
        email: deleteCandidate.email,
        username: deleteCandidate.username,
        phone: deleteCandidate.phone,
      });
      toast.success(
        language === "zh-HK"
          ? `${deleteCandidate.name} 的帳號已被刪除。`
          : `${deleteCandidate.name}'s account has been permanently deleted.`,
      );
      setDeleteCandidate(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language === "zh-HK" ? "刪除失敗。" : "Deletion failed."));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <>
    <FeatureShell
      contentClassName="min-h-0"
      description={
        language === "zh-HK"
          ? "查看所有註冊的用戶並監控其在線狀態"
          : "View all registered users and monitor their online status"
      }
      title={language === "zh-HK" ? "用戶列表" : "User List"}
      toolbar={
        <label className="app-input flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm">
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
        <div className="flex h-full items-center justify-center">
          <p className="text-muted">{language === "zh-HK" ? "載入中..." : "Loading..."}</p>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted">
                <p>{language === "zh-HK" ? "沒有找到用戶" : "No users found"}</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-start gap-4 rounded-[24px] border border-border bg-panel-strong p-4"
                  >
                    <div className="relative shrink-0">
                      <AvatarBadge
                        alt={user.name}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white"
                        imageClassName="h-12 w-12"
                        textClassName="h-12 w-12 text-white"
                        value={user.avatar}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-panel-strong",
                          getStatusColor(user.status),
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">{user.name}</h3>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
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

                      <p className="truncate text-sm text-muted">@{user.username}</p>
                      <p className="truncate text-sm text-muted">{user.email}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", getStatusColor(user.status))} />
                        <span className="text-xs text-muted">{getStatusLabel(user.status)}</span>
                      </div>

                      <div className="mt-2 flex gap-3 text-xs text-muted">
                        {user.phone ? <span title="Phone">{user.phone}</span> : null}
                        {user.country ? <span title="Country">{user.country}</span> : null}
                        {user.jobTitle ? <span title="Job Title">{user.jobTitle}</span> : null}
                      </div>

                      {user.bio ? <p className="mt-2 line-clamp-2 text-sm text-muted">{user.bio}</p> : null}

                      {user.id !== profile.id && user.role !== "admin" ? (
                        <div className="mt-3">
                          <button
                            className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                            onClick={() => setDeleteCandidate(user)}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {language === "zh-HK" ? "永久刪除帳號" : "Delete Account"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="py-4 text-center text-sm text-muted">
            {language === "zh-HK"
              ? `共 ${filteredUsers.length} 個用戶`
              : `Total ${filteredUsers.length} users`}
          </p>
        </div>
      )}
    </FeatureShell>

    <Modal
      onClose={() => setDeleteCandidate(null)}
      open={Boolean(deleteCandidate)}
      title={language === "zh-HK" ? "永久刪除帳號" : "Delete Account Permanently"}
    >
      {deleteCandidate ? (
        <div className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            {language === "zh-HK"
              ? `你確定要永久刪除 ${deleteCandidate.name} (@${deleteCandidate.username}) 的帳號嗎？此操作無法復原，該用戶的所有資料將被移除。`
              : `Are you sure you want to permanently delete ${deleteCandidate.name} (@${deleteCandidate.username})'s account? This action cannot be undone and all their data will be removed.`}
          </p>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              disabled={deleteSubmitting}
              onClick={() => setDeleteCandidate(null)}
              type="button"
            >
              {language === "zh-HK" ? "取消" : "Cancel"}
            </button>
            <button
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
              disabled={deleteSubmitting}
              onClick={() => { void handleDeleteUser(); }}
              type="button"
            >
              {deleteSubmitting
                ? (language === "zh-HK" ? "刪除中..." : "Deleting...")
                : (language === "zh-HK" ? "確認刪除" : "Confirm Delete")}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
    </>
  );
}
