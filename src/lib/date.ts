import type { Language } from "@/lib/types";

const APP_TIME_ZONE = "Asia/Hong_Kong";

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: "en-GB",
  "zh-HK": "zh-HK",
};

interface DateTimeFormatOptions {
  joiner?: string;
  month?: "short" | "long";
  weekday?: "short" | "long";
}

export function formatAppDateTime(
  value: Date | string,
  language: Language,
  options: DateTimeFormatOptions = {},
) {
  const date = toDate(value);
  const locale = LOCALE_BY_LANGUAGE[language];
  const dateLabel = new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    weekday: options.weekday,
    day: "numeric",
    month: options.month ?? "short",
    year: "numeric",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dateLabel}${options.joiner ?? " · "}${timeLabel}`;
}

export function formatAppDayLabel(value: Date | string, language: Language) {
  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    timeZone: "UTC",
    weekday: "short",
  }).format(toDate(value));
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}