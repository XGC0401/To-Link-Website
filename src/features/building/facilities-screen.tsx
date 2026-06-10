"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import {
  addPersistedBooking,
  usePersistedCurrentUserProfile,
  usePersistedSharedContent,
} from "@/hooks/use-persisted-app-data";
import { addCalendarEvent } from "@/hooks/use-calendar-events";
import { t } from "@/lib/translations";

export function FacilitiesScreen() {
  const { language } = useToLink();
  const sharedContent = usePersistedSharedContent();
  const { profile } = usePersistedCurrentUserProfile();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [participants, setParticipants] = useState(3);
  const facilities = sharedContent.facilities;

  const selected = facilities.find((item) => item.id === selectedId) ?? facilities[0];
  const pricePreview = useMemo(() => {
    if (!selected) {
      return "$0";
    }

    if (selected.roomName.includes("Pool")) {
      return `$25 * ${participants} Participant(s) = $${25 * participants}`;
    }

    if (selected.roomName.includes("Study")) {
      return "$10 * 2 Hour(s) = $20";
    }

    return selected.pricePreview;
  }, [participants, selected]);

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "facilities.pageDesc")}
        title="Clubhouse & Facilities"
      >
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="space-y-3">
              {facilities.map((facility) => (
                <button
                  key={facility.id}
                  className={facility.id === selected?.id ? "w-full rounded-[26px] border border-accent bg-accent-soft p-4 text-left" : "w-full rounded-[26px] border border-border bg-panel-strong p-4 text-left"}
                  onClick={() => setSelectedId(facility.id)}
                  type="button"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{facility.category}</p>
                  <h3 className="mt-2 font-semibold text-foreground">{facility.roomName}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{facility.description}</p>
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="min-h-0 overflow-y-auto pr-1">
              <div className="space-y-4 rounded-[28px] border border-border bg-panel-strong p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "facilities.details")}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">{selected.roomName}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{selected.description}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "facilities.pricingRule")}</p>
                    <p className="mt-2 text-sm text-foreground">{selected.pricingRule}</p>
                  </div>
                  <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "facilities.pricePreview")}</p>
                    <p className="mt-2 text-sm text-foreground">{pricePreview}</p>
                    <p className="mt-2 text-xs text-muted">{t(language, "facilities.frontDesk")}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "facilities.availableSlots")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.availability.map((slot) => (
                      <span key={slot} className={slot.includes("Unavailable") ? "rounded-full bg-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" : "rounded-full bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong"}>
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                  onClick={() => setBookingOpen(true)}
                  type="button"
                >
                  {t(language, "common.bookNow")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </FeatureShell>

      <Modal onClose={() => setBookingOpen(false)} open={bookingOpen} title={t(language, "facilities.bookingTitle")}>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!selected) {
              return;
            }

            const formData = new FormData(event.currentTarget);
            const organizerName = String(formData.get("organizerName") ?? "").trim() || profile.name;
            const contactNumber = String(formData.get("contactNumber") ?? "").trim();
            const dateTimeValue = String(formData.get("dateTime") ?? "").trim();
            const [date = new Date().toISOString().slice(0, 10), time = "Pending"] = dateTimeValue.split("T");

            await addPersistedBooking({
              id: crypto.randomUUID(),
              targetName: selected.roomName,
              organizer: organizerName,
              participantCount: participants,
              dateLabel: dateTimeValue ? `${date} · ${time}` : t(language, "booking.status.pending"),
              status: "pending",
            });

            addCalendarEvent({
              id: crypto.randomUUID(),
              title: `${selected.roomName} booking`,
              description: [
                `Organizer: ${organizerName}`,
                contactNumber ? `Contact: ${contactNumber}` : null,
                `Participants: ${participants}`,
                `Pricing: ${pricePreview}`,
              ]
                .filter(Boolean)
                .join(". "),
              date,
              timeLabel: time,
              type: "booking",
            });

            toast.success(t(language, "toast.facilityBooked"));
            setBookingOpen(false);
          }}
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "facilities.roomName")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" readOnly value={selected?.roomName ?? ""} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.contactNumbers")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" name="contactNumber" placeholder="1234 8765" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "facilities.participantsNumbers")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setParticipants(Number(event.target.value) || 1)}
              placeholder="3"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.organizerName")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" defaultValue={profile.name} name="organizerName" placeholder={t(language, "common.namePlaceholder")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.dateTime")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" name="dateTime" type="datetime-local" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.price")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" readOnly value={pricePreview} />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setBookingOpen(false)}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" type="submit">
              {t(language, "common.submit")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}