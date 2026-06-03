"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { facilities } from "@/lib/demo-data";

export function FacilitiesScreen() {
  const [selectedId, setSelectedId] = useState(facilities[0]?.id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [participants, setParticipants] = useState(3);

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
        description="Clubhouse rooms and facilities use a split workspace with availability, booking logic, and front-desk payment guidance."
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Facility details</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">{selected.roomName}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{selected.description}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Pricing rule</p>
                    <p className="mt-2 text-sm text-foreground">{selected.pricingRule}</p>
                  </div>
                  <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Price preview</p>
                    <p className="mt-2 text-sm text-foreground">{pricePreview}</p>
                    <p className="mt-2 text-xs text-muted">*Please pay at the front desk*</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Available time slots</p>
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
                  Book Now!
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </FeatureShell>

      <Modal onClose={() => setBookingOpen(false)} open={bookingOpen} title="Facility booking">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Facility booking request prepared and ready for calendar sync.");
            setBookingOpen(false);
          }}
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Room Name</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" readOnly value={selected?.roomName ?? ""} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Contact Number(s)</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="1234 8765" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Participants Numbers</span>
            <input
              className="app-input w-full rounded-[20px] px-4 py-3"
              onChange={(event) => setParticipants(Number(event.target.value) || 1)}
              placeholder="3"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Organizer Name</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="Dai Long Wong" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Date & Time</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="25 Jun 2026 13:00 to 15:00" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Price</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" readOnly value={pricePreview} />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setBookingOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" type="submit">
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}