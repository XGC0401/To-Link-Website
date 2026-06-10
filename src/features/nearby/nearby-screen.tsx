"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, List, Map, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { LocationMap } from "@/components/map/location-map";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { addCalendarEvent } from "@/hooks/use-calendar-events";
import { addPersistedBooking } from "@/hooks/use-persisted-app-data";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
import { t } from "@/lib/translations";
import { formatAppDateTime } from "@/lib/date";
import type { PlaceItem } from "@/lib/types";
import { formatDistanceKm, haversineDistance } from "@/lib/utils";
import { useUserLocation } from "@/hooks/use-user-location";

type NearbyMode = "shops" | "communities";

interface ShopBookingDraft {
  contactNumbers: string[];
  date: string;
  endTime: string;
  extraInfo: string;
  organizerName: string;
  participantCount: string;
  startTime: string;
  usage: string;
}

interface CommunityJoinDraft {
  contactPhone: string;
  extraInfo: string;
  participantCount: string;
  participantNames: string[];
}

export function NearbyScreen({ mode }: { mode: NearbyMode }) {
  const { language } = useToLink();
  const location = useUserLocation();
  const livePlaces = useNearbyPlaces({
    enabled: true,
    lat: location.lat,
    lng: location.lng,
    mode,
  });
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("nearest");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [shopBookingDraft, setShopBookingDraft] = useState<ShopBookingDraft>(() => createShopBookingDraft());
  const [communityJoinDraft, setCommunityJoinDraft] = useState<CommunityJoinDraft>(() => createCommunityJoinDraft());

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...livePlaces.items]
      .map((item) => ({
        ...item,
        distance: haversineDistance(
          { lat: location.lat, lng: location.lng },
          { lat: item.lat, lng: item.lng },
        ),
      }))
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        return [item.name, item.description, ...item.details]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortBy === "latest") {
          return right.updatedAt.localeCompare(left.updatedAt);
        }
        return left.distance - right.distance;
      });
  }, [livePlaces.items, location.lat, location.lng, query, sortBy]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const isLoadingPlaces = livePlaces.status === "idle" || livePlaces.status === "loading";

  function closeForm() {
    setFormOpen(false);
    setShopBookingDraft(createShopBookingDraft());
    setCommunityJoinDraft(createCommunityJoinDraft());
  }

  function handleAddContactNumber() {
    if (shopBookingDraft.contactNumbers.length >= 3) {
      toast.error(t(language, "nearby.contactLimit"));
      return;
    }

    setShopBookingDraft((current) => ({
      ...current,
      contactNumbers: [...current.contactNumbers, ""],
    }));
  }

  function handleRemoveContactNumber(index: number) {
    setShopBookingDraft((current) => ({
      ...current,
      contactNumbers:
        current.contactNumbers.length === 1
          ? current.contactNumbers
          : current.contactNumbers.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function handleUpdateParticipantCount(value: string) {
    const numericValue = Number(value);
    const safeCount = Number.isFinite(numericValue) && numericValue > 0 ? Math.min(numericValue, 8) : 1;

    setCommunityJoinDraft((current) => ({
      ...current,
      participantCount: value,
      participantNames: Array.from({ length: safeCount }, (_, index) => current.participantNames[index] ?? ""),
    }));
  }

  function handleAddParticipant() {
    setCommunityJoinDraft((current) => {
      if (current.participantNames.length >= 8) {
        return current;
      }

      const nextParticipantNames = [...current.participantNames, ""];

      return {
        ...current,
        participantCount: String(nextParticipantNames.length),
        participantNames: nextParticipantNames,
      };
    });
  }

  function handleRemoveParticipant(index: number) {
    setCommunityJoinDraft((current) => {
      if (current.participantNames.length === 1) {
        return current;
      }

      const nextParticipantNames = current.participantNames.filter((_, currentIndex) => currentIndex !== index);

      return {
        ...current,
        participantCount: String(nextParticipantNames.length),
        participantNames: nextParticipantNames,
      };
    });
  }

  async function handleSubmitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    const contactNumbers = shopBookingDraft.contactNumbers.map((entry) => entry.trim()).filter(Boolean);

    if (
      !shopBookingDraft.usage.trim() ||
      !contactNumbers.length ||
      !shopBookingDraft.participantCount.trim() ||
      !shopBookingDraft.organizerName.trim() ||
      !shopBookingDraft.date ||
      !shopBookingDraft.startTime ||
      !shopBookingDraft.endTime
    ) {
      toast.error(t(language, "nearby.completeBooking"));
      return;
    }

    addCalendarEvent({
      id: crypto.randomUUID(),
      title: `${selected.name} booking`,
      description: [
        `Usage: ${shopBookingDraft.usage.trim()}`,
        `Organizer: ${shopBookingDraft.organizerName.trim()}`,
        `Contacts: ${contactNumbers.join(", ")}`,
        `Participants: ${shopBookingDraft.participantCount.trim()}`,
        shopBookingDraft.extraInfo.trim() ? `Extra info: ${shopBookingDraft.extraInfo.trim()}` : null,
      ]
        .filter(Boolean)
        .join(". "),
      date: shopBookingDraft.date,
      timeLabel: `${shopBookingDraft.startTime} - ${shopBookingDraft.endTime}`,
      type: "booking",
    });

    await addPersistedBooking({
      id: crypto.randomUUID(),
      targetName: selected.name,
      organizer: shopBookingDraft.organizerName.trim(),
      participantCount: Number(shopBookingDraft.participantCount) || 1,
      dateLabel: `${shopBookingDraft.date} · ${shopBookingDraft.startTime} - ${shopBookingDraft.endTime}`,
      status: "pending",
    });

    toast.success(t(language, "toast.bookingSaved"));
    closeForm();
  }

  function handleSubmitJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    const participantNames = communityJoinDraft.participantNames.map((entry) => entry.trim()).filter(Boolean);
    const participantCount = Number(communityJoinDraft.participantCount);

    if (
      !communityJoinDraft.contactPhone.trim() ||
      !participantCount ||
      participantNames.length !== participantCount
    ) {
      toast.error(t(language, "nearby.completeJoin"));
      return;
    }

    addCalendarEvent({
      id: crypto.randomUUID(),
      title: `${selected.name} join request`,
      description: [
        `Contact: ${communityJoinDraft.contactPhone.trim()}`,
        `Participants: ${participantNames.join(", ")}`,
        communityJoinDraft.extraInfo.trim() ? `Extra info: ${communityJoinDraft.extraInfo.trim()}` : null,
      ]
        .filter(Boolean)
        .join(". "),
      date: getTodayDateValue(),
      timeLabel: t(language, "nearby.pendingConfirmation"),
      type: "joined",
    });
    toast.success(t(language, "toast.eventJoinSaved"));
    closeForm();
  }

  return (
    <div className="relative flex h-full w-full">
      <FeatureShell
        description={t(language, "nearby.pageDesc")}
        title={mode === "shops" ? "Nearby Shops" : "Nearby Communities"}
        toolbar={
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_200px_auto_auto]">
            <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={mode === "shops" ? t(language, "nearby.searchShops") : t(language, "nearby.searchCommunities")}
                value={query}
              />
            </label>
            <select
              className="app-input rounded-full px-4 py-3 text-sm"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <option value="nearest">{t(language, "common.nearest")}</option>
              <option value="latest">{t(language, "common.latestUpdate")}</option>
            </select>
            <div className="flex gap-2">
              <button
                className={viewMode === "list" ? "rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white" : "rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"}
                onClick={() => setViewMode("list")}
                type="button"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                className={viewMode === "map" ? "rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white" : "rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"}
                onClick={() => setViewMode("map")}
                type="button"
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => toast.success(`Current location: ${location.label}`)}
              type="button"
            >
              <CalendarPlus className="h-4 w-4" />
              {location.label}
            </button>
          </div>
        }
      >
        {viewMode === "list" ? (
          <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="min-h-0 overflow-y-auto pr-1">
              {isLoadingPlaces ? (
                <NearbyStatusCard message={t(language, "nearby.loadingLive")} />
              ) : livePlaces.status === "error" ? (
                <NearbyStatusCard message={livePlaces.error ?? t(language, "nearby.loadError")} />
              ) : items.length ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={item.id === selected?.id ? "w-full rounded-[26px] border border-accent bg-accent-soft p-4 text-left" : "w-full rounded-[26px] border border-border bg-panel-strong p-4 text-left"}
                      onClick={() => setSelectedId(item.id)}
                      type="button"
                    >
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                      <p className="mt-3 text-xs text-muted">{formatDistanceKm(item.distance)}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <NearbyStatusCard message={t(language, "nearby.noResults")} />
              )}
            </div>

            <div className="min-h-0 overflow-y-auto pr-1">
              {selected ? (
                <div className="space-y-4 rounded-[28px] border border-border bg-panel-strong p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
                      {mode === "shops" ? t(language, "nearby.nearbyShop") : t(language, "nearby.communityEvent")}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">{selected.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{selected.description}</p>
                  </div>
                  <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      {t(language, "common.updated")}
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatAppDateTime(selected.updatedAt, language)}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {selected.details.map((detail) => (
                      <div key={detail} className="rounded-[24px] border border-border bg-panel px-4 py-4 text-sm leading-7 text-muted">
                        {detail}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "common.phone")}</p>
                      <p className="mt-2 text-sm text-foreground">{selected.phone || "N/A"}</p>
                    </div>
                    <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "common.website")}</p>
                      <p className="mt-2 text-sm text-foreground">{selected.website || "N/A"}</p>
                    </div>
                  </div>
                  <button
                    className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => setFormOpen(true)}
                    type="button"
                  >
                    {mode === "shops" ? t(language, "common.bookNow") : t(language, "common.join")}
                  </button>
                </div>
              ) : isLoadingPlaces ? (
                <NearbyStatusCard message={t(language, "nearby.loadingLive")} />
              ) : livePlaces.status === "error" ? (
                <NearbyStatusCard message={livePlaces.error ?? t(language, "nearby.loadError")} />
              ) : (
                <NearbyStatusCard message={t(language, "nearby.noResults")} />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-hidden rounded-[28px] border border-border bg-panel-strong p-3">
            <LocationMap
              activeId={selected?.id}
              items={items as PlaceItem[]}
              language={language}
              userLocation={{ lat: location.lat, lng: location.lng, label: location.label }}
            />
          </div>
        )}
      </FeatureShell>

      <Modal
        onClose={() => setFormOpen(false)}
        open={formOpen}
        title={mode === "shops" ? t(language, "nearby.bookTitle") : t(language, "nearby.joinTitle")}
        width="max-w-4xl"
      >
        {mode === "shops" ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitBooking}>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.usage")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    usage: event.target.value,
                  }))
                }
                placeholder={t(language, "nearby.usagePlaceholder")}
                value={shopBookingDraft.usage}
              />
            </label>
            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">{t(language, "common.contactNumbers")}</span>
              <div className="space-y-3">
                {shopBookingDraft.contactNumbers.map((contactNumber, index) => (
                  <div key={`contact-${index}`} className="flex items-center gap-3">
                    <input
                      className="app-input w-full rounded-[20px] px-4 py-3"
                      onChange={(event) =>
                        setShopBookingDraft((current) => ({
                          ...current,
                          contactNumbers: current.contactNumbers.map((entry, currentIndex) =>
                            currentIndex === index ? event.target.value : entry,
                          ),
                        }))
                      }
                      placeholder="1234 8765"
                      value={contactNumber}
                    />
                    <button
                      aria-label="Remove contact number"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-panel text-foreground"
                      onClick={() => handleRemoveContactNumber(index)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"
                onClick={handleAddContactNumber}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {t(language, "nearby.addContact")}
              </button>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.participantsNumber")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                min="1"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    participantCount: event.target.value,
                  }))
                }
                placeholder="21"
                type="number"
                value={shopBookingDraft.participantCount}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "common.organizerName")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    organizerName: event.target.value,
                  }))
                }
                placeholder={t(language, "common.namePlaceholder")}
                value={shopBookingDraft.organizerName}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.date")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                type="date"
                value={shopBookingDraft.date}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.startTime")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                type="time"
                value={shopBookingDraft.startTime}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.endTime")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
                type="time"
                value={shopBookingDraft.endTime}
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.extraInfo")}</span>
              <textarea
                className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
                onChange={(event) =>
                  setShopBookingDraft((current) => ({
                    ...current,
                    extraInfo: event.target.value,
                  }))
                }
                value={shopBookingDraft.extraInfo}
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
                onClick={closeForm}
                type="button"
              >
                {t(language, "common.cancel")}
              </button>
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" type="submit">
                {t(language, "common.submit")}
              </button>
            </div>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmitJoin}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.joinParticipants")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                min="1"
                onChange={(event) => handleUpdateParticipantCount(event.target.value)}
                type="number"
                value={communityJoinDraft.participantCount}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.contactPhone")}</span>
              <input
                className="app-input w-full rounded-[20px] px-4 py-3"
                onChange={(event) =>
                  setCommunityJoinDraft((current) => ({
                    ...current,
                    contactPhone: event.target.value,
                  }))
                }
                placeholder="1234 8765"
                value={communityJoinDraft.contactPhone}
              />
            </label>
            <div className="space-y-3">
              {communityJoinDraft.participantNames.map((participantName, index) => (
                <div key={`participant-${index}`} className="flex items-center gap-3">
                  <input
                    className="app-input w-full rounded-[20px] px-4 py-3"
                    onChange={(event) =>
                      setCommunityJoinDraft((current) => ({
                        ...current,
                        participantNames: current.participantNames.map((entry, currentIndex) =>
                          currentIndex === index ? event.target.value : entry,
                        ),
                      }))
                    }
                    placeholder={t(language, "common.namePlaceholder")}
                    value={participantName}
                  />
                  <button
                    aria-label="Remove participant"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-panel text-foreground"
                    onClick={() => handleRemoveParticipant(index)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"
                onClick={handleAddParticipant}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {t(language, "nearby.addParticipant")}
              </button>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "nearby.extraInfo")}</span>
              <textarea
                className="app-input min-h-28 w-full rounded-[24px] px-4 py-3"
                onChange={(event) =>
                  setCommunityJoinDraft((current) => ({
                    ...current,
                    extraInfo: event.target.value,
                  }))
                }
                value={communityJoinDraft.extraInfo}
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
                onClick={closeForm}
                type="button"
              >
                {t(language, "common.cancel")}
              </button>
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" type="submit">
                {t(language, "common.submit")}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function NearbyStatusCard({ message }: { message: string }) {
  return (
    <div className="rounded-[26px] border border-dashed border-border bg-panel-strong p-6 text-sm leading-7 text-muted">
      {message}
    </div>
  );
}

function createShopBookingDraft(): ShopBookingDraft {
  return {
    contactNumbers: [""],
    date: getTodayDateValue(),
    endTime: "",
    extraInfo: "",
    organizerName: "",
    participantCount: "",
    startTime: "",
    usage: "",
  };
}

function createCommunityJoinDraft(): CommunityJoinDraft {
  return {
    contactPhone: "",
    extraInfo: "",
    participantCount: "1",
    participantNames: [""],
  };
}

function getTodayDateValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(new Date());
}