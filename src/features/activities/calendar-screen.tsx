"use client";

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { addCalendarEvent, useCalendarEvents } from "@/hooks/use-calendar-events";
import { t } from "@/lib/translations";

export function CalendarScreen() {
  const { language } = useToLink();
  const calendarEvents = useCalendarEvents();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftEvent, setDraftEvent] = useState(() => ({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    timeLabel: "",
    title: "",
  }));
  const monthStart = startOfMonth(selectedDay);
  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
      }),
    [monthStart],
  );

  const selectedEvents = calendarEvents.filter((event) =>
    isSameDay(new Date(event.date), selectedDay),
  );

  function closeComposer() {
    setComposerOpen(false);
    setDraftEvent({
      date: format(selectedDay, "yyyy-MM-dd"),
      description: "",
      timeLabel: "",
      title: "",
    });
  }

  function handleCreateEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftEvent.title.trim() || !draftEvent.description.trim() || !draftEvent.date || !draftEvent.timeLabel.trim()) {
      toast.error("Please complete the event title, description, date, and time.");
      return;
    }

    addCalendarEvent({
      id: crypto.randomUUID(),
      title: draftEvent.title.trim(),
      description: draftEvent.description.trim(),
      date: draftEvent.date,
      timeLabel: draftEvent.timeLabel.trim(),
      type: "personal",
    });
    toast.success(t(language, "toast.calendarEventCreated"));
    closeComposer();
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "calendar.pageDesc")}
        title="Calendar"
      >
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="rounded-[28px] border border-border bg-panel-strong p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-foreground">{format(selectedDay, "MMMM yyyy")}</h3>
              <div className="flex gap-2">
                <button className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground" onClick={() => setSelectedDay(addDays(selectedDay, -30))} type="button">
                  {t(language, "common.prev")}
                </button>
                <button className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground" onClick={() => setSelectedDay(addDays(selectedDay, 30))} type="button">
                  {t(language, "common.next")}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {[t(language, "calendar.mon"), t(language, "calendar.tue"), t(language, "calendar.wed"), t(language, "calendar.thu"), t(language, "calendar.fri"), t(language, "calendar.sat"), t(language, "calendar.sun")].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayEvents = calendarEvents.filter((event) => isSameDay(new Date(event.date), day));
                return (
                  <button
                    key={day.toISOString()}
                    className={isSameDay(day, selectedDay) ? "min-h-24 rounded-[20px] border border-accent bg-accent-soft px-2 py-2 text-left" : "min-h-24 rounded-[20px] border border-border bg-panel px-2 py-2 text-left"}
                    onClick={() => setSelectedDay(day)}
                    type="button"
                  >
                    <p className="text-sm font-semibold text-foreground">{format(day, "d")}</p>
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="mt-1 rounded-full bg-accent-soft px-2 py-1 text-[11px] text-accent-strong">
                        {event.title}
                      </div>
                    ))}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-[28px] border border-border bg-panel-strong p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "calendar.selectedDay")}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{format(selectedDay, "EEEE, d MMMM yyyy")}</h3>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                onClick={() => {
                  setDraftEvent((current) => ({
                    ...current,
                    date: format(selectedDay, "yyyy-MM-dd"),
                  }));
                  setComposerOpen(true);
                }}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {t(language, "calendar.createEvent")}
              </button>
            </div>
            <div className="space-y-3">
              {selectedEvents.length ? (
                selectedEvents.map((event) => (
                  <article key={event.id} className="rounded-[26px] border border-border bg-panel-strong p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{event.type}</p>
                        <h4 className="mt-2 text-lg font-semibold text-foreground">{event.title}</h4>
                      </div>
                      <span className="rounded-full bg-panel px-3 py-1 text-xs text-muted">{event.timeLabel}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{event.description}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[26px] border border-dashed border-border bg-panel-strong p-8 text-center text-sm text-muted">
                  {t(language, "calendar.noActivities")}
                </div>
              )}
            </div>
          </div>
        </div>
      </FeatureShell>

      <Modal onClose={() => setComposerOpen(false)} open={composerOpen} title={t(language, "calendar.createEvent")}>
        <form
          className="grid gap-4"
          onSubmit={handleCreateEvent}
        >
          <input
            className="app-input rounded-[20px] px-4 py-3"
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder={t(language, "common.title")}
            value={draftEvent.title}
          />
          <textarea
            className="app-input min-h-32 rounded-[24px] px-4 py-3"
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder={t(language, "common.description")}
            value={draftEvent.description}
          />
          <input
            className="app-input rounded-[20px] px-4 py-3"
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                date: event.target.value,
              }))
            }
            type="date"
            value={draftEvent.date}
          />
          <input
            className="app-input rounded-[20px] px-4 py-3"
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                timeLabel: event.target.value,
              }))
            }
            placeholder={t(language, "calendar.timePlaceholder")}
            value={draftEvent.timeLabel}
          />
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={closeComposer}
              type="button"
            >
              {t(language, "common.cancel")}
            </button>
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" type="submit">
              {t(language, "common.save")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}