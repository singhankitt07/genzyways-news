"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type ThemeChoice = "light" | "sepia" | "dark" | "auto";

const THEME_KEY = "genzywaynews-theme";
const FONT_SIZE_KEY = "genzywaynews-reading-font-size";
const DEFAULT_FONT_SIZE = 18;

type ThemeContextValue = {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "auto",
  setTheme: () => undefined,
  fontSize: DEFAULT_FONT_SIZE,
  setFontSize: () => undefined
});

function normalizeTheme(value: string | null | undefined): ThemeChoice {
  if (value === "light" || value === "sepia" || value === "dark") return value;
  return "auto";
}

function getInitialTheme(fallback: ThemeChoice): ThemeChoice {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored ? normalizeTheme(stored) : fallback;
  } catch {
    return fallback;
  }
}

function getInitialFontSize(fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(FONT_SIZE_KEY);
    if (value === null) return fallback;
    const stored = Number(value);
    return Number.isInteger(stored) && stored >= 16 && stored <= 24 ? stored : fallback;
  } catch {
    return fallback;
  }
}

export default function ThemeProvider({ children, initialTheme = "auto", initialFontSize = DEFAULT_FONT_SIZE }: { children: React.ReactNode; initialTheme?: ThemeChoice; initialFontSize?: number }) {
  const [theme, setThemeState] = useState<ThemeChoice>(initialTheme);
  const [fontSize, setFontSizeState] = useState<number>(initialFontSize);
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const activeTheme = getInitialTheme(theme);
    const apply = () => {
      root.dataset.theme = activeTheme === "auto" ? (media.matches ? "dark" : "light") : activeTheme;
    };
    if (activeTheme !== theme) setThemeState(activeTheme);
    apply();
    if (activeTheme !== "auto") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const activeSize = getInitialFontSize(fontSize);
    if (activeSize !== fontSize) setFontSizeState(activeSize);
    document.documentElement.style.setProperty("--reader-font-size", `${activeSize}px`);
  }, [fontSize]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    let active = true;
    fetch("/api/account/reading-preferences")
      .then((response) => response.ok ? response.json() : null)
      .then((preferences) => {
        if (!active || !preferences) return;
        const pending: { theme?: ThemeChoice; readingFontSize?: number } = {};
        try {
          const localTheme = window.localStorage.getItem(THEME_KEY);
          const savedTheme = normalizeTheme(localTheme || preferences.theme);
          if (localTheme === null) {
            setThemeState(savedTheme);
            window.localStorage.setItem(THEME_KEY, savedTheme);
          } else if (savedTheme !== normalizeTheme(preferences.theme)) {
            pending.theme = savedTheme;
          }
          const localSizeValue = window.localStorage.getItem(FONT_SIZE_KEY);
          const localSize = localSizeValue === null ? Number.NaN : Number(localSizeValue);
          const profileSize = Number(preferences.readingFontSize);
          if (Number.isInteger(localSize) && localSize >= 16 && localSize <= 24) {
            if (localSize !== profileSize) pending.readingFontSize = localSize;
          } else if (Number.isInteger(profileSize) && profileSize >= 16 && profileSize <= 24) {
            setFontSizeState(profileSize);
            window.localStorage.setItem(FONT_SIZE_KEY, String(profileSize));
          }
        } catch {
          const savedTheme = normalizeTheme(preferences.theme);
          const savedSize = Number(preferences.readingFontSize);
          setThemeState(savedTheme);
          if (Number.isInteger(savedSize) && savedSize >= 16 && savedSize <= 24) setFontSizeState(savedSize);
        }
        if (Object.keys(pending).length) {
          void fetch("/api/account/reading-preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pending)
          }).catch(() => undefined);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [status, userId]);

  function persistPreferences(preferences: { theme?: ThemeChoice; readingFontSize?: number }) {
    if (status !== "authenticated") return;
    void fetch("/api/account/reading-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences)
    }).catch(() => undefined);
  }

  function setTheme(nextTheme: ThemeChoice) {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {}
    persistPreferences({ theme: nextTheme });
  }

  function setFontSize(nextSize: number) {
    const size = Math.max(16, Math.min(24, Math.round(nextSize)));
    setFontSizeState(size);
    try {
      window.localStorage.setItem(FONT_SIZE_KEY, String(size));
    } catch {}
    persistPreferences({ readingFontSize: size });
  }

  return <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}