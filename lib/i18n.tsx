"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Lang, dictionary } from "./i18n-data";

export type { Lang } from "./i18n-data";
export { dictionary, categories, translateCategory, categorySlugFor, categoryFromSlug } from "./i18n-data";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (key) => key
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("genzy-lang") as Lang | null;
    if (stored === "en" || stored === "hi" || stored === "hinglish") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem("genzy-lang", l);
  }

  function t(key: string) {
    return dictionary[key]?.[lang] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
