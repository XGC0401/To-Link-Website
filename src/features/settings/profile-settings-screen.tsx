"use client";

import { deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import {
  deletePersistedCurrentUserAccountData,
  savePersistedDashboardData,
  savePersistedCurrentUserProfile,
  usePersistedCurrentUserProfile,
  usePersistedDashboardData,
} from "@/hooks/use-persisted-app-data";
import { firebaseSetupHint, getFirebaseServices } from "@/lib/firebase";
import { cloudinarySetupHint, uploadFilesToCloudinary, validateMediaSelection } from "@/lib/media-upload";
import { formatCurrentState, formatPostCategory, formatUserStatus } from "@/lib/seeded-content-localization";
import { formatAppDateTime } from "@/lib/date";
import type { UserProfile } from "@/lib/types";
import { t } from "@/lib/translations";

const currentStateOptions: UserProfile["currentState"][] = ["employee", "worker", "student", "jobless"];
const statusOptions: UserProfile["status"][] = ["online", "busy", "offline"];

export function ProfileSettingsScreen() {
  const router = useRouter();
  const { language } = useToLink();
  const { profile } = usePersistedCurrentUserProfile();
  const dashboard = usePersistedDashboardData();
  const [draft, setDraft] = useState<ReturnType<typeof createProfileDraft> | null>(null);
  const [slotDraft, setSlotDraft] = useState<string[] | null>(null);
  const [slotInput, setSlotInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const effectiveDraft = draft ?? createProfileDraft(profile);
  const effectiveSlots = slotDraft ?? dashboard.rawAvailableSlots;

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await savePersistedCurrentUserProfile({
        bio: effectiveDraft.bio,
        country: effectiveDraft.country,
        currentState: effectiveDraft.currentState,
        email: effectiveDraft.email,
        firstName: effectiveDraft.firstName,
        jobTitle: effectiveDraft.jobTitle,
        lastName: effectiveDraft.lastName,
        phone: effectiveDraft.phone,
        status: effectiveDraft.status,
        username: effectiveDraft.username,
      });
      setDraft(null);
      toast.success(language === "zh-HK" ? "個人資料已儲存。" : "Profile saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAvailableSlots() {
    setSavingSlots(true);

    try {
      const saved = await savePersistedDashboardData({
        availableSlots: effectiveSlots.filter((slot) => slot.trim()),
      });

      if (!saved) {
        toast.error(language === "zh-HK" ? "暫時無法儲存可用時段。" : "Unable to save the available time slots right now.");
        return;
      }

      setSlotDraft(null);
      setSlotInput("");
      toast.success(language === "zh-HK" ? "可用時段已更新。" : "Available time slots updated.");
    } finally {
      setSavingSlots(false);
    }
  }

  function handleAddSlot() {
    const nextSlot = slotInput.trim();

    if (!nextSlot) {
      return;
    }

    setSlotDraft((current) => {
      const source = current ?? dashboard.rawAvailableSlots;
      return source.includes(nextSlot) ? source : [...source, nextSlot];
    });
    setSlotInput("");
  }

  function handleRemoveSlot(slot: string) {
    setSlotDraft((current) => (current ?? dashboard.rawAvailableSlots).filter((entry) => entry !== slot));
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;

    if (!fileList?.length) {
      return;
    }

    const validation = validateMediaSelection([fileList[0]]);

    if (!validation.valid || !validation.images.length) {
      toast.error(validation.errors[0] ?? cloudinarySetupHint);
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    try {
      const [upload] = await uploadFilesToCloudinary([validation.images[0]]);
      const saved = await savePersistedCurrentUserProfile({ avatar: upload.secureUrl });

      if (!saved) {
        throw new Error(language === "zh-HK" ? "暫時無法儲存頭像。" : "Unable to save the avatar right now.");
      }

      toast.success(language === "zh-HK" ? "頭像已更新。" : "Profile photo updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : cloudinarySetupHint);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  function openAvatarPicker() {
    if (uploadingAvatar) {
      return;
    }

    avatarInputRef.current?.click();
  }

  async function handleDeleteAccount() {
    const services = getFirebaseServices();
    const user = services?.auth.currentUser;

    if (!services || !user) {
      toast.error(firebaseSetupHint);
      return;
    }

    setDeletingAccount(true);

    try {
      const accountSnapshot = {
        phone: profile.phone,
        uid: user.uid,
        username: profile.username,
      };

      await deleteUser(user);

      try {
        await deletePersistedCurrentUserAccountData(accountSnapshot);
      } catch {
        // Best-effort cleanup after the auth account has already been removed.
      }

      toast.success(language === "zh-HK" ? "帳戶已永久刪除。" : "Your account has been permanently deleted.");
      router.push("/");
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "auth/requires-recent-login"
      ) {
        toast.error(
          language === "zh-HK"
            ? "基於安全原因，請重新登入後再刪除帳戶。"
            : "For security reasons, please sign in again before deleting your account.",
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : language === "zh-HK"
              ? "暫時無法刪除帳戶。"
              : "Unable to delete the account right now.",
        );
      }
    } finally {
      setDeletingAccount(false);
      setDeleteAccountOpen(false);
    }
  }

  return (
    <FeatureShell
      description={t(language, "profile.description")}
      title={t(language, "nav.settings.profile")}
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <form className="rounded-[28px] border border-border bg-panel-strong p-5" onSubmit={handleSaveProfile}>
            <div className="flex items-center gap-4" id="profile-photo">
              <button className="rounded-full transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent/50" onClick={openAvatarPicker} type="button">
                <AvatarBadge
                  alt={profile.name}
                  className="h-16 w-16 bg-accent text-lg font-bold text-white"
                  textClassName="text-white"
                  value={profile.avatar}
                />
              </button>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted">@{profile.username}</p>
              </div>
              <button className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground" onClick={openAvatarPicker} type="button">
                <ImagePlus className="h-4 w-4" />
                {uploadingAvatar ? (language === "zh-HK" ? "上傳中..." : "Uploading...") : language === "zh-HK" ? "更換頭像" : "Change Photo"}
              </button>
              <input accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} ref={avatarInputRef} type="file" />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                [t(language, "auth.firstName"), "firstName", effectiveDraft.firstName],
                [t(language, "auth.lastName"), "lastName", effectiveDraft.lastName],
                [t(language, "profile.username"), "username", effectiveDraft.username],
                [t(language, "profile.phone"), "phone", effectiveDraft.phone],
                [t(language, "profile.loginEmail"), "email", effectiveDraft.email],
                [t(language, "profile.country"), "country", effectiveDraft.country],
                [t(language, "profile.jobTitle"), "jobTitle", effectiveDraft.jobTitle],
              ].map(([label, key, value]) => (
                <label key={String(label)} className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <input
                    className="app-input w-full rounded-[20px] px-4 py-3"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        ...(current ?? effectiveDraft),
                        [key]: event.target.value,
                      }))
                    }
                    value={String(value)}
                  />
                </label>
              ))}
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "profile.currentState")}</span>
                <select
                  className="app-input w-full rounded-[20px] px-4 py-3"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      ...(current ?? effectiveDraft),
                      currentState: event.target.value as UserProfile["currentState"],
                    }))
                  }
                  value={effectiveDraft.currentState}
                >
                  {currentStateOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatCurrentState(language, option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "profile.onlineStatus")}</span>
                <select
                  className="app-input w-full rounded-[20px] px-4 py-3"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      ...(current ?? effectiveDraft),
                      status: event.target.value as UserProfile["status"],
                    }))
                  }
                  value={effectiveDraft.status}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatUserStatus(language, option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">{t(language, "profile.bio")}</span>
                <textarea
                  className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      ...(current ?? effectiveDraft),
                      bio: event.target.value,
                    }))
                  }
                  value={effectiveDraft.bio}
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" disabled={saving} type="submit">
                {t(language, "common.save")}
              </button>
            </div>
          </form>

          <section className="rounded-[28px] border border-border bg-panel-strong p-5">
            <h3 className="text-lg font-semibold text-foreground">{t(language, "profile.availableTimeSlot")}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {effectiveSlots.map((slot) => (
                <span key={slot} className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-2 text-sm text-accent-strong">
                  {slot}
                  <button className="rounded-full text-accent-strong/70 transition hover:text-accent-strong" onClick={() => handleRemoveSlot(slot)} type="button">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) => setSlotInput(event.target.value)}
                placeholder={language === "zh-HK" ? "例如：Fri 19:00 - 21:00" : "For example: Fri 19:00 - 21:00"}
                value={slotInput}
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground" onClick={handleAddSlot} type="button">
                <Plus className="h-4 w-4" />
                {language === "zh-HK" ? "新增時段" : "Add Slot"}
              </button>
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" disabled={savingSlots} onClick={() => { void handleSaveAvailableSlots(); }} type="button">
                {savingSlots ? t(language, "common.working") : t(language, "common.save")}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[28px] border border-border bg-panel-strong p-5">
            <h3 className="text-lg font-semibold text-foreground">{t(language, "profile.history")}</h3>
            <div className="mt-4 space-y-3">
              {dashboard.profileHistory.map((entry) => (
                <div key={entry.id} className="rounded-[22px] border border-border bg-panel px-4 py-4">
                  <p className="font-semibold text-foreground">{entry.title}</p>
                  <p className="mt-1 text-sm text-muted">{formatPostCategory(language, entry.category)}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t(language, "profile.deletedAt")} {formatAppDateTime(entry.deletedAt, language)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-panel-strong p-5">
            <h3 className="text-lg font-semibold text-foreground">{t(language, "profile.statusSecurity")}</h3>
            <div className="mt-4 grid gap-4">
              {[
                [t(language, "profile.onlineStatus"), formatUserStatus(language, profile.status)],
                [t(language, "profile.points"), String(profile.points)],
                [t(language, "profile.maskedId"), t(language, "profile.personalId")],
                [t(language, "profile.password"), t(language, "profile.changePassword")],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-[22px] border border-border bg-panel px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{label}</p>
                  <p className="mt-2 text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-rose-300 bg-rose-50/70 p-5 dark:border-rose-500/40 dark:bg-rose-500/10">
            <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-200">
              {language === "zh-HK" ? "危險操作" : "Danger zone"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-rose-700/85 dark:text-rose-100/85">
              {language === "zh-HK"
                ? "刪除帳戶後將無法復原，請只在你確定永久離開 To-Link 時使用。"
                : "Deleting the account cannot be undone. Only use this when you are certain you want to leave To-Link permanently."}
            </p>
            <button
              className="mt-4 rounded-full border border-rose-500 bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deletingAccount}
              onClick={() => setDeleteAccountOpen(true)}
              type="button"
            >
              {language === "zh-HK" ? "永久刪除帳戶" : "Delete account"}
            </button>
          </section>
        </div>
      </div>

      <Modal
        onClose={() => {
          if (!deletingAccount) {
            setDeleteAccountOpen(false);
          }
        }}
        open={deleteAccountOpen}
        title={language === "zh-HK" ? "永久刪除帳戶" : "Delete account permanently"}
        width="max-w-xl"
      >
        <div className="space-y-5">
          <div className="rounded-[24px] border border-rose-300 bg-rose-50 px-5 py-4 text-sm leading-7 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            {language === "zh-HK"
              ? "你確定要永久刪除帳戶嗎？此操作會移除登入帳戶，而且不能復原。"
              : "Are you sure you want to delete your account PERMANENTLY? This will remove your sign-in account and cannot be undone."}
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setDeleteAccountOpen(false)}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deletingAccount}
              onClick={() => {
                void handleDeleteAccount();
              }}
              type="button"
            >
              {deletingAccount
                ? t(language, "common.working")
                : language === "zh-HK"
                  ? "永久刪除"
                  : "Delete permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </FeatureShell>
  );
}

function createProfileDraft(profile: {
  bio: string;
  country: string;
  currentState: UserProfile["currentState"];
  email: string;
  firstName: string;
  jobTitle?: string;
  lastName: string;
  phone: string;
  status: UserProfile["status"];
  username: string;
}) {
  return {
    bio: profile.bio,
    country: profile.country,
    currentState: profile.currentState,
    email: profile.email,
    firstName: profile.firstName,
    jobTitle: profile.jobTitle ?? "",
    lastName: profile.lastName,
    phone: profile.phone,
    status: profile.status,
    username: profile.username,
  };
}