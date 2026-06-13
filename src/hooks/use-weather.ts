"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/types";

interface WeatherSnapshot {
  status: "idle" | "loading" | "ready" | "error";
  locationLabel: string;
  current: {
    precipitation: number;
    temperature: number;
    windSpeed: number;
    weatherCode: number;
  } | null;
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }>;
}

const WEATHER_CODE_LOOKUP: Record<Language, Record<number, string>> = {
  en: {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Frost fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Showers",
    81: "Showers",
    82: "Showers",
    85: "Snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  },
  "zh-HK": {
    0: "天晴",
    1: "大致天晴",
    2: "局部多雲",
    3: "密雲",
    45: "有霧",
    48: "霜霧",
    51: "微毛雨",
    53: "毛雨",
    55: "密集毛雨",
    56: "結冰毛雨",
    57: "結冰毛雨",
    61: "微雨",
    63: "下雨",
    65: "大雨",
    66: "結冰雨",
    67: "結冰雨",
    71: "微雪",
    73: "下雪",
    75: "大雪",
    77: "雪粒",
    80: "驟雨",
    81: "驟雨",
    82: "驟雨",
    85: "雪陣",
    86: "大雪陣",
    95: "雷暴",
    96: "雷暴",
    99: "雷暴",
  },
};

const WEATHER_COPY: Record<
  Language,
  {
    defaultLabel: string;
    locating: string;
    permissionDenied: string;
    unavailable: string;
    unavailableLive: string;
  }
> = {
  en: {
    defaultLabel: "Weather",
    locating: "Locating…",
    permissionDenied: "Location permission not granted",
    unavailable: "Location services unavailable",
    unavailableLive: "Unable to load live weather",
  },
  "zh-HK": {
    defaultLabel: "天氣",
    locating: "正在定位…",
    permissionDenied: "未獲授權使用位置資訊",
    unavailable: "未能使用定位服務",
    unavailableLive: "未能載入即時天氣",
  },
};

export function useWeather(language: Language) {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot>(() => ({
    status: "idle",
    locationLabel: WEATHER_COPY[language].defaultLabel,
    current: null,
    forecast: [],
  }));

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setSnapshot((current) => ({
        ...current,
        status: "loading",
        locationLabel: WEATHER_COPY[language].locating,
      }));
    }, 0);

    if (!navigator.geolocation) {
      const timer = window.setTimeout(() => {
        setSnapshot((current) => ({
          ...current,
          status: "error",
          locationLabel: WEATHER_COPY[language].unavailable,
        }));
      }, 0);

      return () => {
        window.clearTimeout(loadingTimer);
        window.clearTimeout(timer);
      };
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [weatherResponse, reverseResponse] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`,
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=${encodeURIComponent(
                language === "zh-HK" ? "zh-HK,zh,en" : "en",
              )}`,
            ),
          ]);

          const weatherData = await weatherResponse.json();
          const reverseData = await reverseResponse.json();
          const address = reverseData.address ?? {};
          const locationLabel =
            [address.suburb, address.city, address.state, address.country]
              .filter(Boolean)
              .slice(0, 2)
              .join(", ") || `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;

          setSnapshot({
            status: "ready",
            locationLabel,
            current: {
              precipitation: weatherData.current?.precipitation ?? 0,
              temperature: weatherData.current?.temperature_2m ?? 0,
              windSpeed: weatherData.current?.wind_speed_10m ?? 0,
              weatherCode: weatherData.current?.weather_code ?? 0,
            },
            forecast: (weatherData.daily?.time ?? []).map((date: string, index: number) => ({
              date,
              tempMax: weatherData.daily?.temperature_2m_max?.[index] ?? 0,
              tempMin: weatherData.daily?.temperature_2m_min?.[index] ?? 0,
              weatherCode: weatherData.daily?.weather_code?.[index] ?? 0,
            })),
          });
        } catch {
          setSnapshot((current) => ({
            ...current,
            status: "error",
            locationLabel: WEATHER_COPY[language].unavailableLive,
          }));
        }
      },
      () => {
        setSnapshot((current) => ({
          ...current,
          status: "error",
          locationLabel: WEATHER_COPY[language].permissionDenied,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    return () => window.clearTimeout(loadingTimer);
  }, [language]);

  return {
    ...snapshot,
    describeWeather(code: number) {
      const raw = WEATHER_CODE_LOOKUP[language][code];
      if (raw) {
        const lower = raw.toLowerCase();
        const formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
        // If it's a single word plural (eg. "Showers"), singularize simple trailing 's'
        if (!formatted.includes(" ") && formatted.endsWith("s")) {
          return formatted.slice(0, -1);
        }
        return formatted;
      }

      return language === "zh-HK" ? "未知" : "Unknown";
    },
  };
}