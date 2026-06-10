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
  const [contactNumber, setContactNumber] = useState("");
  const [organizerName, setOrganizerName] = useState(profile.name);
  const [bookingDate, setBookingDate] = useState(getTodayDateValue());
  const [bookingStartTime, setBookingStartTime] = useState("10:00");
  const [bookingEndTime, setBookingEndTime] = useState("12:00");
  const facilities = sharedContent.facilities;

  const selected = facilities.find((item) => item.id === selectedId) ?? facilities[0];
  const roundedDurationHours = useMemo(
    () => getRoundedDurationHours(bookingStartTime, bookingEndTime),
    [bookingEndTime, bookingStartTime],
  );
  const pricePreview = useMemo(() => {
    if (!selected) {
      return language === "zh-HK" ? "HK$0" : "$0";
    }

    if (selected.id === "facility-2") {
      return language === "zh-HK"
        ? `${participants} 位參加者 x HK$25 = HK$${25 * participants}`
        : `$25 * ${participants} Participant(s) = $${25 * participants}`;
    }

    if (selected.id === "facility-1") {
      return language === "zh-HK"
        ? `${roundedDurationHours} 小時 x HK$10 = HK$${10 * roundedDurationHours}`
        : `$10 * ${roundedDurationHours} Hour(s) = $${10 * roundedDurationHours}`;
    }

    return selected.pricePreview;
  }, [language, participants, roundedDurationHours, selected]);

  function openBookingModal() {
    setOrganizerName(profile.name);
    setContactNumber("");
    setBookingDate(getTodayDateValue());
    setBookingStartTime("10:00");
    setBookingEndTime("12:00");
    setBookingOpen(true);
  }

  function closeBookingModal() {
    setBookingOpen(false);
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "facilities.pageDesc")}
        title={t(language, "nav.building.facilities")}
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
                  onClick={openBookingModal}
                  type="button"
                >
                  {t(language, "common.bookNow")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </FeatureShell>

      <Modal onClose={closeBookingModal} open={bookingOpen} title={t(language, "facilities.bookingTitle")}>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!selected) {
              return;
            }

            const normalizedOrganizerName = organizerName.trim() || profile.name;
            const normalizedContactNumber = contactNumber.trim();

            if (!bookingDate || !bookingStartTime || !bookingEndTime) {
              toast.error(language === "zh-HK" ? "請選擇日期、開始時間及結束時間。" : "Please select a date, start time, and end time.");
              return;
            }

            if (!roundedDurationHours) {
              toast.error(language === "zh-HK" ? "結束時間必須晚於開始時間。" : "The end time must be later than the start time.");
              return;
            }

            await addPersistedBooking({
              id: crypto.randomUUID(),
              targetName: selected.roomName,
              organizer: normalizedOrganizerName,
              participantCount: participants,
              dateLabel: `${bookingDate} · ${bookingStartTime} - ${bookingEndTime}`,
              status: "pending",
            });

            addCalendarEvent({
              id: crypto.randomUUID(),
              title: language === "zh-HK" ? `${selected.roomName} 預約` : `${selected.roomName} booking`,
              description: [
                language === "zh-HK" ? `主辦人：${normalizedOrganizerName}` : `Organizer: ${normalizedOrganizerName}`,
                normalizedContactNumber
                  ? language === "zh-HK"
                    ? `聯絡電話：${normalizedContactNumber}`
                    : `Contact: ${normalizedContactNumber}`
                  : null,
                language === "zh-HK" ? `參加人數：${participants}` : `Participants: ${participants}`,
                language === "zh-HK" ? `收費：${pricePreview}` : `Pricing: ${pricePreview}`,
              ]
                .filter(Boolean)
                .join(". "),
              date: bookingDate,
              timeLabel: `${bookingStartTime} - ${bookingEndTime}`,
              type: "booking",
            });

            toast.success(t(language, "toast.facilityBooked"));
            closeBookingModal();
          }}
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "facilities.roomName")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" readOnly value={selected?.roomName ?? ""} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.contactNumbers")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" onChange={(event) => setContactNumber(event.target.value)} placeholder="1234 8765" value={contactNumber} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "facilities.participantsNumbers")}</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setParticipants(Number(event.target.value) || 1)}
              placeholder="3"
              type="number"
              value={participants}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.organizerName")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" onChange={(event) => setOrganizerName(event.target.value)} placeholder={t(language, "common.namePlaceholder")} value={organizerName} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "nearby.date")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" onChange={(event) => setBookingDate(event.target.value)} type="date" value={bookingDate} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "nearby.startTime")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" onChange={(event) => setBookingStartTime(event.target.value)} type="time" value={bookingStartTime} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "nearby.endTime")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" onChange={(event) => setBookingEndTime(event.target.value)} type="time" value={bookingEndTime} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.price")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" readOnly value={pricePreview} />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeBookingModal}
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

function getRoundedDurationHours(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
    return 0;
  }

  return Math.max(1, Math.ceil((endMinutes - startMinutes) / 60));
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}