"use client";

import { MessageSquareMore } from "lucide-react";
import { toast } from "sonner";
import { FeatureShell } from "@/components/ui/feature-shell";
import { bookings } from "@/lib/demo-data";

export function BookingStatusScreen() {
  return (
    <FeatureShell
      description="Track requests across shops, facilities, and other reservable spaces with explicit pending, accepted, denied, and canceled states."
      title="Booking Status"
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-[28px] border border-border bg-panel-strong p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{booking.targetName}</h3>
                <p className="mt-2 text-sm text-muted">{booking.organizer}</p>
                <p className="mt-1 text-sm text-muted">{booking.dateLabel}</p>
              </div>
              <span className={booking.status === "accepted" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" : booking.status === "denied" ? "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700" : booking.status === "canceled" ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700" : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"}>
                {booking.status}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted">Participants: {booking.participantCount}</p>
            {booking.reason ? (
              <div className="mt-4 rounded-[22px] border border-border bg-panel px-4 py-4 text-sm leading-7 text-muted">
                Denial reason: {booking.reason}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"
                onClick={() => toast.success("Booking conversation opened in Messages.")}
                type="button"
              >
                <MessageSquareMore className="h-4 w-4" />
                Message
              </button>
              {booking.status === "pending" ? (
                <>
                  <button
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => toast.success("Booking accepted in the owner review flow.")}
                    type="button"
                  >
                    Accept
                  </button>
                  <button
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => toast.success("Deny flow prepared with required reason field.")}
                    type="button"
                  >
                    Deny
                  </button>
                </>
              ) : null}
              {booking.status === "accepted" || booking.status === "pending" ? (
                <button
                  className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                  onClick={() => toast.success("Cancel confirmation prepared for requester flow.")}
                  type="button"
                >
                  Cancel Booking
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </FeatureShell>
  );
}