"use client";

import { useToLink } from "@/lib/app-state";
import { currentUser, profileHistory } from "@/lib/demo-data";
import { FeatureShell } from "@/components/ui/feature-shell";
import { t } from "@/lib/translations";

export function ProfileSettingsScreen() {
  const { language } = useToLink();
  return (
    <FeatureShell
      description={t(language, "profile.description")}
      title="Profile Settings"
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <section className="rounded-[28px] border border-border bg-panel-strong p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {currentUser.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{currentUser.name}</h3>
                <p className="text-sm text-muted">@{currentUser.username}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                [t(language, "profile.username"), currentUser.username],
                [t(language, "profile.phone"), currentUser.phone],
                [t(language, "profile.loginEmail"), currentUser.email],
                [t(language, "profile.currentState"), currentUser.currentState],
                [t(language, "profile.country"), currentUser.country],
                [t(language, "profile.jobTitle"), currentUser.jobTitle ?? "N/A"],
              ].map(([label, value]) => (
                <label key={String(label)} className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <input className="app-input w-full rounded-[20px] px-4 py-3" defaultValue={String(value)} />
                </label>
              ))}
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">{t(language, "profile.bio")}</span>
                <textarea className="app-input min-h-28 w-full rounded-[24px] px-4 py-3" defaultValue={currentUser.bio} />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-panel-strong p-5">
            <h3 className="text-lg font-semibold text-foreground">{t(language, "profile.availableTimeSlot")}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Mon 19:00 - 21:00", "Tue 20:00 - 22:00", "Sat 10:00 - 13:00", "Sun 14:00 - 18:00"].map((slot) => (
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
              {profileHistory.map((entry) => (
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
                [t(language, "profile.onlineStatus"), currentUser.status],
                [t(language, "profile.points"), String(currentUser.points)],
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