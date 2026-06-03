import { UI_COOKIE_NAMES } from "@/lib/app-config";
import type { FontScale, Language, ThemeMode } from "@/lib/types";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface StoredPreferences {
  theme: ThemeMode;
  fontScale: FontScale;
  language: Language;
}

export const DEFAULT_PREFERENCES: StoredPreferences = {
  theme: "light",
  fontScale: "m",
  language: "en",
};

export function readCookieValue(cookieString: string, cookieName: string) {
  const match = cookieString
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`));

  if (!match) {
    return undefined;
  }

  return decodeURIComponent(match.split("=")[1] ?? "");
}

export function writePreferenceCookie(
  cookieName: string,
  value: string,
  maxAge = COOKIE_MAX_AGE,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${cookieName}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function applyDocumentPreferences(
  theme: ThemeMode,
  fontScale: FontScale,
  language: Language,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.fontScale = fontScale;
  document.documentElement.lang = language;
}

export function getStoredPreferences(cookieString: string) {
  return resolveStoredPreferences({
    theme: readCookieValue(cookieString, UI_COOKIE_NAMES.theme),
    fontScale: readCookieValue(cookieString, UI_COOKIE_NAMES.fontScale),
    language: readCookieValue(cookieString, UI_COOKIE_NAMES.language),
  });
}

export function resolveStoredPreferences(values: {
  theme?: string;
  fontScale?: string;
  language?: string;
}): StoredPreferences {
  return {
    theme: values.theme === "dark" ? "dark" : DEFAULT_PREFERENCES.theme,
    fontScale: isFontScale(values.fontScale) ? values.fontScale : DEFAULT_PREFERENCES.fontScale,
    language: values.language === "zh-HK" ? "zh-HK" : DEFAULT_PREFERENCES.language,
  };
}

function isFontScale(value: string | undefined): value is FontScale {
  return value === "s" || value === "m" || value === "b" || value === "l";
}