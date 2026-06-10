"use client";

import { ImagePlus, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { FeatureShell } from "@/components/ui/feature-shell";
import {
  savePersistedDashboardData,
  savePersistedCurrentUserProfile,
  usePersistedCurrentUserProfile,
  usePersistedDashboardData,
} from "@/hooks/use-persisted-app-data";
import { cloudinarySetupHint, uploadFilesToCloudinary, validateMediaSelection } from "@/lib/media-upload";
import { formatCurrentState, formatPostCategory, formatUserStatus } from "@/lib/seeded-content-localization";
import { formatAppDateTime } from "@/lib/date";
import type { UserProfile } from "@/lib/types";
import { t } from "@/lib/translations";

const currentStateOptions: UserProfile["currentState"][] = ["employee", "worker", "student", "jobless"];
const statusOptions: UserProfile["status"][] = ["online", "busy", "offline"];

export function ProfileSettingsScreen() {
  const { language } = useToLink();
  const { profile } = usePersistedCurrentUserProfile();
  const dashboard = usePersistedDashboardData();
  const [draft, setDraft] = useState<ReturnType<typeof createProfileDraft> | null>(null);
  const [slotDraft, setSlotDraft] = useState<string[] | null>(null);
  const [slotInput, setSlotInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
        jobTitle: effectiveDraft.jobTitle,
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

  return (
    <FeatureShell
      description={t(language, "profile.description")}
      title={t(language, "nav.settings.profile")}
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <form className="rounded-[28px] border border-border bg-panel-strong p-5" onSubmit={handleSaveProfile}>
            <div className="flex items-center gap-4">
              <AvatarBadge
                alt={profile.name}
                className="h-16 w-16 bg-accent text-lg font-bold text-white"
                textClassName="text-white"
                value={profile.avatar}
              />
              <div>
                <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted">@{profile.username}</p>
              </div>
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground">
                <ImagePlus className="h-4 w-4" />
                {uploadingAvatar ? (language === "zh-HK" ? "上傳中..." : "Uploading...") : language === "zh-HK" ? "更換頭像" : "Change Photo"}
                <input accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} type="file" />
              </label>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
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
        </div>
      </div>
    </FeatureShell>
  );
}

function createProfileDraft(profile: {
  bio: string;
  country: string;
  currentState: UserProfile["currentState"];
  email: string;
  jobTitle?: string;
  phone: string;
  status: UserProfile["status"];
  username: string;
}) {
  return {
    bio: profile.bio,
    country: profile.country,
    currentState: profile.currentState,
    email: profile.email,
    jobTitle: profile.jobTitle ?? "",
    phone: profile.phone,
    status: profile.status,
    username: profile.username,
  };
}