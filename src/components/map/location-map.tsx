"use client";

import dynamic from "next/dynamic";
import type { Language, PlaceItem } from "@/lib/types";

const LocationMapCanvas = dynamic(() => import("@/components/map/location-map-canvas"), {
  ssr: false,
});

export function LocationMap({
  activeId,
  items,
  language,
  userLocation,
}: {
  activeId?: string;
  items: PlaceItem[];
  language: Language;
  userLocation: { lat: number; lng: number; label: string };
}) {
  return <LocationMapCanvas activeId={activeId} items={items} language={language} userLocation={userLocation} />;
}