"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UI_COOKIE_NAMES } from "@/lib/app-config";
import {
  applyDocumentPreferences,
  DEFAULT_PREFERENCES,
  getStoredPreferences,
  type StoredPreferences,
  writePreferenceCookie,
} from "@/lib/preferences";
import type { FontScale, InfoPanelId, Language, ThemeMode } from "@/lib/types";

interface ToLinkContextValue {
  theme: ThemeMode;
  setTheme: (value: ThemeMode) => void;
  toggleTheme: () => void;
  fontScale: FontScale;
  setFontScale: (value: FontScale) => void;
  language: Language;
  toggleLanguage: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (value: boolean) => void;
  activeInfoPanel: InfoPanelId | null;
  openInfoPanel: (value: InfoPanelId) => void;
  closeInfoPanel: () => void;
  bestOfMonthOpen: boolean;
  setBestOfMonthOpen: (value: boolean) => void;
}

const ToLinkContext = createContext<ToLinkContextValue | null>(null);

export function ToLinkProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences?: StoredPreferences;
}) {
  const resolvedInitialPreferences = getInitialPreferences(initialPreferences);
  const [theme, setTheme] = useState<ThemeMode>(resolvedInitialPreferences.theme);
  const [fontScale, setFontScale] = useState<FontScale>(resolvedInitialPreferences.fontScale);
  const [language, setLanguage] = useState<Language>(resolvedInitialPreferences.language);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeInfoPanel, setActiveInfoPanel] = useState<InfoPanelId | null>(null);
  const [bestOfMonthOpen, setBestOfMonthOpen] = useState(false);

  useEffect(() => {
    applyDocumentPreferences(theme, fontScale, language);
    writePreferenceCookie(UI_COOKIE_NAMES.theme, theme);
    writePreferenceCookie(UI_COOKIE_NAMES.fontScale, fontScale);
    writePreferenceCookie(UI_COOKIE_NAMES.language, language);
  }, [theme, fontScale, language]);

  const value = useMemo<ToLinkContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
      fontScale,
      setFontScale,
      language,
      toggleLanguage: () =>
        setLanguage((current) => (current === "en" ? "zh-HK" : "en")),
      sidebarOpen,
      setSidebarOpen,
      notificationsOpen,
      setNotificationsOpen,
      activeInfoPanel,
      openInfoPanel: setActiveInfoPanel,
      closeInfoPanel: () => setActiveInfoPanel(null),
      bestOfMonthOpen,
      setBestOfMonthOpen,
    }),
    [activeInfoPanel, bestOfMonthOpen, fontScale, language, notificationsOpen, sidebarOpen, theme],
  );

  return <ToLinkContext.Provider value={value}>{children}</ToLinkContext.Provider>;
}

export function useToLink() {
  const context = useContext(ToLinkContext);

  if (!context) {
    throw new Error("useToLink must be used within ToLinkProvider");
  }

  return context;
}

function getInitialPreferences(initialPreferences?: StoredPreferences) {
  if (initialPreferences) {
    return initialPreferences;
  }

  if (typeof document === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  return getStoredPreferences(document.cookie);
}