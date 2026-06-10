"use client";

import { MessageSquareMore } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import {
  openPersistedDirectChat,
  updatePersistedBookingStatus,
  usePersistedBookings,
  usePersistedCurrentUserProfile,
} from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";

export function BookingStatusScreen() {
  const { language } = useToLink();
  const router = useRouter();
  const bookings = usePersistedBookings();
  const { profile } = usePersistedCurrentUserProfile();

  async function handleOpenBookingConversation(organizer: string) {
    const roomId = await openPersistedDirectChat({
      members: [profile.name, organizer],
      title: organizer,
    });

    if (!roomId) {
      toast.error(language === "zh-HK" ? "暫時無法開啟預約對話。" : "Unable to open the booking conversation right now.");
      return;
    }

    router.push(`/connections/messages?room=${encodeURIComponent(roomId)}`);
  }

  return (
    <FeatureShell
      description={t(language, "booking.pageDesc")}
      title={t(language, "nav.activities.booking")}
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
        {bookings.items.map((booking) => (
          <article key={booking.id} className="rounded-[28px] border border-border bg-panel-strong p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{booking.targetName}</h3>
                <p className="mt-2 text-sm text-muted">{booking.organizer}</p>
                <p className="mt-1 text-sm text-muted">{booking.dateLabel}</p>
              </div>
              <span className={booking.status === "accepted" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" : booking.status === "denied" ? "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700" : booking.status === "canceled" ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700" : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"}>
              {booking.status === "accepted" ? t(language, "booking.status.accepted")
                : booking.status === "denied" ? t(language, "booking.status.denied")
                : booking.status === "canceled" ? t(language, "booking.status.canceled")
                : t(language, "booking.status.pending")}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted">{t(language, "booking.participants")} {booking.participantCount}</p>
            {booking.reason ? (
              <div className="mt-4 rounded-[22px] border border-border bg-panel px-4 py-4 text-sm leading-7 text-muted">
                {t(language, "booking.denialReason")} {booking.reason}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"
                onClick={() => {
                  void handleOpenBookingConversation(booking.organizer);
                }}
                type="button"
              >
                <MessageSquareMore className="h-4 w-4" />
                {t(language, "common.message")}
              </button>
              {booking.status === "pending" ? (
                <>
                  <button
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={async () => {
                      await updatePersistedBookingStatus(booking.id, "accepted");
                      toast.success(t(language, "toast.bookingAccepted"));
                    }}
                    type="button"
                  >
                    {t(language, "common.accept")}
                  </button>
                  <button
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={async () => {
                      await updatePersistedBookingStatus(
                        booking.id,
                        "denied",
                        language === "zh-HK" ? "需要人工審核。" : "Manual review required.",
                      );
                      toast.success(t(language, "toast.denyFlow"));
                    }}
                    type="button"
                  >
                    {t(language, "common.deny")}
                  </button>
                </>
              ) : null}
              {booking.status === "accepted" || booking.status === "pending" ? (
                <button
                  className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                  onClick={async () => {
                    await updatePersistedBookingStatus(booking.id, "canceled");
                    toast.success(t(language, "toast.cancelConfirm"));
                  }}
                  type="button"
                >
                  {t(language, "booking.cancelBooking")}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </FeatureShell>
  );
}