"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import {
  savePersistedCurrentUserProfile,
  usePersistedCurrentUserProfile,
  usePersistedDashboardData,
} from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";

export function ProfileSettingsScreen() {
  const { language } = useToLink();
  const { profile } = usePersistedCurrentUserProfile();
  const dashboard = usePersistedDashboardData();
  const [draft, setDraft] = useState<ReturnType<typeof createProfileDraft> | null>(null);
  const [saving, setSaving] = useState(false);
  const effectiveDraft = draft ?? createProfileDraft(profile);

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
        username: effectiveDraft.username,
      });
      setDraft(null);
      toast.success(language === "zh-HK" ? "個人資料已儲存。" : "Profile saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FeatureShell
      description={t(language, "profile.description")}
      title="Profile Settings"
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <form className="rounded-[28px] border border-border bg-panel-strong p-5" onSubmit={handleSaveProfile}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {profile.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted">@{profile.username}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                [t(language, "profile.username"), "username", effectiveDraft.username],
                [t(language, "profile.phone"), "phone", effectiveDraft.phone],
                [t(language, "profile.loginEmail"), "email", effectiveDraft.email],
                [t(language, "profile.currentState"), "currentState", effectiveDraft.currentState],
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
              {dashboard.availableSlots.map((slot) => (
                <span key={slot} className="rounded-full bg-accent-soft px-3 py-2 text-sm text-accent-strong">
                  {slot}
                </span>
              ))}
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
                  <p className="mt-1 text-sm text-muted">{entry.category}</p>
                  <p className="mt-1 text-xs text-muted">{t(language, "profile.deletedAt")} {new Date(entry.deletedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-panel-strong p-5">
            <h3 className="text-lg font-semibold text-foreground">{t(language, "profile.statusSecurity")}</h3>
            <div className="mt-4 grid gap-4">
              {[
                [t(language, "profile.onlineStatus"), profile.status],
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
  currentState: string;
  email: string;
  jobTitle?: string;
  phone: string;
  username: string;
}) {
  return {
    bio: profile.bio,
    country: profile.country,
    currentState: profile.currentState,
    email: profile.email,
    jobTitle: profile.jobTitle ?? "",
    phone: profile.phone,
    username: profile.username,
  };
}