"use client";

import { useEffect, useState } from "react";
import type { Language, PlaceItem } from "@/lib/types";

type NearbyMode = "shops" | "communities";

interface NearbyPlacesState {
  error: string | null;
  items: PlaceItem[];
  status: "error" | "idle" | "loading" | "ready";
}

export function useNearbyPlaces({
  enabled,
  lat,
  language,
  limit,
  lng,
  mode,
}: {
  enabled: boolean;
  lat: number;
  language: Language;
  limit: number;
  lng: number;
  mode: NearbyMode;
}) {
  const [state, setState] = useState<NearbyPlacesState>({
    error: null,
    items: [],
    status: enabled ? "loading" : "idle",
  });

  useEffect(() => {
    if (!enabled || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const controller = new AbortController();

    async function loadNearbyPlaces() {
      setState((current) => ({
        ...current,
        error: null,
        status: "loading",
      }));

      try {
        const response = await fetch(
          `/api/places?mode=${mode}&lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&limit=${encodeURIComponent(String(limit))}&language=${encodeURIComponent(language)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const payload = (await response.json()) as {
          error?: string;
          items?: PlaceItem[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load nearby places.");
        }

        setState({
          error: null,
          items: payload.items ?? [],
          status: "ready",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : "Could not load nearby places.",
          items: [],
          status: "error",
        });
      }
    }

    void loadNearbyPlaces();

    return () => controller.abort();
  }, [enabled, language, lat, limit, lng, mode]);

  if (!enabled || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      error: null,
      items: [],
      status: "idle" as const,
    };
  }

  return state;
}