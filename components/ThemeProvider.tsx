"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "default";

const STORAGE_KEY = "genzywaynews-theme";
const ThemeContext = createContext<{ theme: ThemeChoice; setTheme: (theme: ThemeChoice) => void }>({
  theme: "default",
  setTheme: () => undefined
});

function getInitialTheme(): ThemeChoice {
  if (typeof window === "undefined") return "default";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" || saved === "default" ? saved : "default";
  } catch {
    return "default";
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const active = theme === "default" ? (media.matches ? "dark" : "light") : theme;
      root.dataset.theme = active;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  function setTheme(nextTheme: ThemeChoice) {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The theme still applies for the current visit when storage is blocked.
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}