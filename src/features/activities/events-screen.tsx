"use client";

import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { nearbyCommunities } from "@/lib/demo-data";
import { t } from "@/lib/translations";

export function EventsScreen() {
  const { language } = useToLink();
  return (
    <FeatureShell
      description={t(language, "events.pageDesc")}
      title="Events"
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
        {nearbyCommunities.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-border bg-panel-strong p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "events.communityEvent")}</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{item.eventTitle}</h3>
            <p className="mt-1 text-sm text-muted">{item.eventDate}</p>
            <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            <div className="mt-4 space-y-2">
              {item.details.map((detail) => (
                <div key={detail} className="rounded-[22px] border border-border bg-panel px-4 py-3 text-sm leading-6 text-muted">
                  {detail}
                </div>
              ))}
            </div>
            <button
              className="mt-5 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
              onClick={() => toast.success("Join form prepared. Submitted joins will sync into Calendar.")}
              type="button"
            >
              {t(language, "common.join")}
            </button>
          </article>
        ))}
      </div>
    </FeatureShell>
  );
}