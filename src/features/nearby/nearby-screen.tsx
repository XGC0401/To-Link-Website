"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, List, Map, Search } from "lucide-react";
import { toast } from "sonner";
import { LocationMap } from "@/components/map/location-map";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { nearbyCommunities, nearbyShops } from "@/lib/demo-data";
import type { PlaceItem } from "@/lib/types";
import { formatDistanceKm, haversineDistance } from "@/lib/utils";
import { useUserLocation } from "@/hooks/use-user-location";

type NearbyMode = "shops" | "communities";

export function NearbyScreen({ mode }: { mode: NearbyMode }) {
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
        description="Use browser geolocation to discover places nearby, then switch between a list-detail workspace and a live map view."
        title={mode === "shops" ? "Nearby Shops" : "Nearby Communities"}
        toolbar={
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_200px_auto_auto]">
            <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={mode === "shops" ? "Search shops or restaurants" : "Search communities"}
                value={query}
              />
            </label>
            <select
              className="app-input rounded-full px-4 py-3 text-sm"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <option value="nearest">Nearest</option>
              <option value="latest">Latest Update</option>
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
              {location.status === "loading" ? "Locating..." : location.label}
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
                      {mode === "shops" ? "Nearby shop" : "Community event"}
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
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Phone</p>
                      <p className="mt-2 text-sm text-foreground">{selected.phone || "N/A"}</p>
                    </div>
                    <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Website</p>
                      <p className="mt-2 text-sm text-foreground">{selected.website || "N/A"}</p>
                    </div>
                  </div>
                  {mode === "communities" && isCommunitySelection(selected) ? (
                    <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">Upcoming event</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{selected.eventTitle}</p>
                      <p className="mt-1 text-sm text-muted">{selected.eventDate}</p>
                    </div>
                  ) : null}
                  <button
                    className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => setFormOpen(true)}
                    type="button"
                  >
                    {mode === "shops" ? "Book Now!" : "Join"}
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
        title={mode === "shops" ? "Book nearby place" : "Join community event"}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success(mode === "shops" ? "Booking saved and ready for calendar sync." : "Community event join request saved to your calendar feed.");
            setFormOpen(false);
          }}
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">{mode === "shops" ? "Usage" : "Number of participants"}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder={mode === "shops" ? "Birthday Party" : "2"} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Contact Number(s)</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="1234 8765" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{mode === "shops" ? "Organizer Name" : "Name"}</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="Siu Ming Lee" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Participants Number</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="21" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Date & Time</span>
            <input className="app-input w-full rounded-[20px] px-4 py-3" placeholder="2 Jul 2026 13:00 to 20:00" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Extra Information</span>
            <textarea className="app-input min-h-28 w-full rounded-[24px] px-4 py-3" />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setFormOpen(false)}
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