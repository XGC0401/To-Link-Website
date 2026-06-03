"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { PlaceItem } from "@/lib/types";

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
  userLocation,
}: {
  activeId?: string;
  items: PlaceItem[];
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
          You are here
        </Tooltip>
      </Marker>
      {items.map((item) => (
        <Marker key={item.id} icon={shopMarker} position={[item.lat, item.lng]}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-zinc-600">{item.description}</p>
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