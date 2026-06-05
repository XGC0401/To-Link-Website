"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, List, Map, Search } from "lucide-react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { LocationMap } from "@/components/map/location-map";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { nearbyCommunities, nearbyShops } from "@/lib/demo-data";
import { t } from "@/lib/translations";
import type { PlaceItem } from "@/lib/types";
import { formatDistanceKm, haversineDistance } from "@/lib/utils";
import { useUserLocation } from "@/hooks/use-user-location";

type NearbyMode = "shops" | "communities";

export function NearbyScreen({ mode }: { mode: NearbyMode }) {
  const { language } = useToLink();
  const location = useUserLocation();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("nearest");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const sourceItems = mode === "shops" ? nearbyShops : nearbyCommunities;

  const items = useMemo(() => {
    return [...sourceItems]
      .map((item) => ({
        ...item,
        distance: haversineDistance(
          { lat: location.lat, lng: location.lng },
          { lat: item.lat, lng: item.lng },
        ),
      }))
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .sort((left, right) => {
        if (sortBy === "latest") {
          return right.updatedAt.localeCompare(left.updatedAt);
        }
        return left.distance - right.distance;
      });
  }, [location.lat, location.lng, query, sortBy, sourceItems]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

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
              {location.status === "loading" ? t(language, "common.locating") : location.label}
            </button>
          </div>
        }
      >
        {viewMode === "list" ? (
          <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="min-h-0 overflow-y-auto pr-1">
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
                  {mode === "communities" && isCommunitySelection(selected) ? (
                    <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{t(language, "nearby.upcomingEvent")}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{selected.eventTitle}</p>
                      <p className="mt-1 text-sm text-muted">{selected.eventDate}</p>
                    </div>
                  ) : null}
                  <button
                    className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => setFormOpen(true)}
                    type="button"
                  >
                    {mode === "shops" ? t(language, "common.bookNow") : t(language, "common.join")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-hidden rounded-[28px] border border-border bg-panel-strong p-3">
            <LocationMap
              activeId={selected?.id}
              items={items as PlaceItem[]}
              userLocation={{ lat: location.lat, lng: location.lng, label: location.label }}
            />
          </div>
        )}
      </FeatureShell>

      <Modal
        onClose={() => setFormOpen(false)}
        open={formOpen}
        title={mode === "shops" ? t(language, "nearby.bookTitle") : t(language, "nearby.joinTitle")}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success(mode === "shops" ? t(language, "toast.bookingSaved") : t(language, "toast.eventJoinSaved"));
            setFormOpen(false);
          }}
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{mode === "shops" ? t(language, "nearby.usage") : t(language, "nearby.joinParticipants")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder={mode === "shops" ? t(language, "nearby.usagePlaceholder") : "2"} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.contactNumbers")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="1234 8765" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{mode === "shops" ? t(language, "common.organizerName") : t(language, "common.name")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder={t(language, "common.namePlaceholder")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "nearby.participantsNumber")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="21" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "common.dateTime")}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder={t(language, "common.dateTimePlaceholder")} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{t(language, "nearby.extraInfo")}</span>
            <textarea className="app-input min-h-28 w-full rounded-[24px] px-4 py-3" />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setFormOpen(false)}
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

function isCommunitySelection(
  item: (PlaceItem & { distance: number }) | null,
): item is PlaceItem & { distance: number; eventTitle: string; eventDate: string } {
  return Boolean(
    item &&
      "eventTitle" in item &&
      typeof item.eventTitle === "string" &&
      "eventDate" in item &&
      typeof item.eventDate === "string",
  );
}