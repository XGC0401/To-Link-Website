"use client";

import { useEffect, useState } from "react";

const defaultLocation = {
  lat: 22.2855,
  lng: 114.1577,
  label: "Central, Hong Kong",
};

export function useUserLocation() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
    status: "loading" | "ready" | "error";
  }>(() => ({
    ...defaultLocation,
    status:
      typeof navigator !== "undefined" && !navigator.geolocation
        ? ("error" as const)
        : ("loading" as const),
  }));

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const data = await response.json();
          const address = data.address ?? {};
          const label =
            [address.suburb, address.city, address.state, address.country]
              .filter(Boolean)
              .slice(0, 2)
              .join(", ") || `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;

          setLocation({
            lat: coords.latitude,
            lng: coords.longitude,
            label,
            status: "ready",
          });
        } catch {
          setLocation({
            lat: coords.latitude,
            lng: coords.longitude,
            label: `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
            status: "ready",
          });
        }
      },
      () => setLocation((current) => ({ ...current, status: "error" })),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return location;
}