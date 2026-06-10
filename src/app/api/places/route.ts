import { NextResponse } from "next/server";
import type { PlaceItem } from "@/lib/types";

export const runtime = "nodejs";

type NearbyMode = "shops" | "communities";

interface OverpassElement {
  center?: {
    lat: number;
    lon: number;
  };
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  timestamp?: string;
  type: "node" | "relation" | "way";
}

const MODE_CONFIG: Record<NearbyMode, { radius: number; selectors: string[] }> = {
  shops: {
    radius: 2500,
    selectors: [
      '[shop]',
      '[amenity~"restaurant|cafe|fast_food|pharmacy|marketplace|bakery|ice_cream|bar|pub"]',
    ],
  },
  communities: {
    radius: 5000,
    selectors: [
      '[amenity~"community_centre|social_facility|library|arts_centre|events_venue|conference_centre|youth_centre"]',
      '[office~"association|ngo|charity"]',
      '[club]',
    ],
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (mode !== "shops" && mode !== "communities") {
    return NextResponse.json(
      {
        error: "Invalid nearby mode.",
      },
      {
        status: 400,
      },
    );
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      {
        error: "Valid coordinates are required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const items = await fetchNearbyPlaces(mode, lat, lng);

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load nearby places.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 502,
      },
    );
  }
}

async function fetchNearbyPlaces(mode: NearbyMode, lat: number, lng: number) {
  const config = MODE_CONFIG[mode];
  const selectorLines = config.selectors
    .map((selector) => `  nwr(around:${config.radius},${lat},${lng})${selector};`)
    .join("\n");
  const query = `[out:json][timeout:25];\n(\n${selectorLines}\n);\nout center;`;
  const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
    headers: {
      Accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
      "User-Agent": "To-Link-Recreate/1.0 (+https://localhost)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("The nearby places service did not respond successfully.");
  }

  const payload = (await response.json()) as { elements?: OverpassElement[] };
  const deduped = new Map<string, PlaceItem>();

  for (const element of payload.elements ?? []) {
    const item = toPlaceItem(element, mode);

    if (!item) {
      continue;
    }

    const dedupeKey = `${item.name.toLowerCase()}::${item.lat.toFixed(5)}::${item.lng.toFixed(5)}`;

    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, item);
    }
  }

  return [...deduped.values()];
}

function toPlaceItem(element: OverpassElement, mode: NearbyMode): PlaceItem | null {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const name = tags.name?.trim();

  if (!name || lat == null || lng == null) {
    return null;
  }

  return {
    id: `${element.type}-${element.id}`,
    name,
    description: buildDescription(tags, mode),
    details: buildDetails(tags, lat, lng, mode),
    phone: normalizeValue(tags.phone ?? tags["contact:phone"]),
    website: normalizeWebsite(tags.website ?? tags["contact:website"] ?? tags.url),
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  };
}

function buildDescription(tags: Record<string, string>, mode: NearbyMode) {
  const typeLabel = humanizeTag(
    tags.shop ?? tags.amenity ?? tags.office ?? tags.club ?? (mode === "shops" ? "shop" : "community"),
  );
  const address = buildAddress(tags);
  const openingHours = tags.opening_hours ? `Hours: ${tags.opening_hours}` : null;

  return [typeLabel, address, openingHours]
    .filter(Boolean)
    .join(". ") ||
    (mode === "shops"
      ? "Live place data from OpenStreetMap nearby search."
      : "Live community place data from OpenStreetMap nearby search.");
}

function buildDetails(tags: Record<string, string>, lat: number, lng: number, mode: NearbyMode) {
  const details = [
    `Category: ${humanizeTag(tags.shop ?? tags.amenity ?? tags.office ?? tags.club ?? (mode === "shops" ? "shop" : "community"))}`,
    buildAddress(tags) ? `Address: ${buildAddress(tags)}` : null,
    tags.cuisine ? `Cuisine: ${tags.cuisine}` : null,
    tags.operator ? `Operator: ${tags.operator}` : null,
    tags.brand ? `Brand: ${tags.brand}` : null,
    tags.opening_hours ? `Opening hours: ${tags.opening_hours}` : null,
    tags["addr:street"] || tags["addr:housenumber"] ? null : `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
  ].filter((detail): detail is string => Boolean(detail));

  return details.length
    ? details
    : [
        mode === "shops"
          ? "Live result from OpenStreetMap nearby search."
          : "Live community result from OpenStreetMap nearby search.",
      ];
}

function buildAddress(tags: Record<string, string>) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter(Boolean);

  return parts.join(", ");
}

function humanizeTag(value: string) {
  return value
    .split(/[;:_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeValue(value: string | undefined) {
  const normalized = value?.trim();

  return normalized?.length ? normalized : "N/A";
}

function normalizeWebsite(value: string | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return "N/A";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `https://${normalized}`;
}