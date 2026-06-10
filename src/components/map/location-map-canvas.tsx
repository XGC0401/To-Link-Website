"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import { t } from "@/lib/translations";
import type { Language, PlaceItem } from "@/lib/types";

function createMarker(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;height:18px;width:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 10px 18px rgba(0,0,0,0.18)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const residentMarker = createMarker("#f36b21");
const shopMarker = createMarker("#2a9d6f");

export default function LocationMapCanvas({
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
  const centerItem = items.find((item) => item.id === activeId) ?? items[0];
  const center = centerItem
    ? ([centerItem.lat, centerItem.lng] as [number, number])
    : ([userLocation.lat, userLocation.lng] as [number, number]);

  return (
    <MapContainer center={center} className="h-full w-full rounded-[28px]" zoom={15}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker icon={residentMarker} position={[userLocation.lat, userLocation.lng]}>
        <Popup>{userLocation.label}</Popup>
        <Tooltip direction="top" offset={[0, -8]} permanent>
          {t(language, "nearby.youAreHere")}
        </Tooltip>
      </Marker>
      {items.map((item) => (
        <Marker key={item.id} icon={shopMarker} position={[item.lat, item.lng]}>
          <Popup>
            <div className="space-y-2">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-zinc-600">{item.description}</p>
              <p className="text-xs text-zinc-600">
                {t(language, "common.phone")} {item.phone || "N/A"}
              </p>
              <p className="text-xs text-zinc-600">
                {t(language, "common.website")}{" "}
                {item.website && item.website !== "N/A" ? (
                  <a className="text-accent-strong underline" href={item.website} rel="noreferrer" target="_blank">
                    {item.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </Popup>
          <Tooltip direction="top" offset={[0, -8]} permanent>
            {item.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}