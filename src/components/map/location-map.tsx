"use client";

import dynamic from "next/dynamic";
import type { PlaceItem } from "@/lib/types";

const LocationMapCanvas = dynamic(() => import("@/components/map/location-map-canvas"), {
  ssr: false,
});

export function LocationMap({
  activeId,
  items,
  userLocation,
}: {
  activeId?: string;
  items: PlaceItem[];
  userLocation: { lat: number; lng: number; label: string };
}) {
  return <LocationMapCanvas activeId={activeId} items={items} userLocation={userLocation} />;
}