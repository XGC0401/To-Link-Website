import type { FontScale, ThemeMode } from "@/lib/types";

export const APP_NAME = "To-Link";

export const APP_TAGLINE =
  "Stronger neighborhoods through community posts, shared help, local events, and building services.";

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  s: "S",
  m: "M",
  b: "B",
  l: "L",
};

export const FONT_SCALE_BUTTON_CLASSES: Record<FontScale, string> = {
  s: "text-xs",
  m: "text-sm",
  b: "text-lg",
  l: "text-2xl",
};

export const FONT_SCALE_BUTTON_SIZE_CLASSES: Record<FontScale, string> = {
  s: "h-9 w-9",
  m: "h-10 w-10",
  b: "h-12 w-12",
  l: "h-14 w-14",
};

export const THEME_SEQUENCE: ThemeMode[] = ["light", "dark"];

export const UI_COOKIE_NAMES = {
  theme: "to-link-theme",
  fontScale: "to-link-font-scale",
  language: "to-link-language",
} as const;