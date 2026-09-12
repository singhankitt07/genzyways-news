"use client";
import Link from "next/link";
import { useLanguage, categories } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import BrandMark from "./BrandMark";
import AccountMenu from "./AccountMenu";
import WeatherWidget from "./WeatherWidget";

export default function Masthead() {
  const { lang, t } = useLanguage();
  return (
    <header className="bg-paper sticky top-0 z-20 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3 text-xs text-ink/60 min-w-0">
          <span className="hidden sm:block uppercase tracking-[0.14em] text-[10px] font-semibold text-press">Today</span>
          <span className="truncate">
            {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
          <WeatherWidget />
        </div>
        <div className="text-center order-first sm:order-none">
          <BrandMark />
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink/45 mt-1">{t("tagline")}</p>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
          <AccountMenu />
          <LanguageSwitcher />
        </div>
      </div>
      <nav className="border-y border-line">
        <ul className="max-w-6xl mx-auto px-4 flex gap-6 overflow-x-auto text-sm">
          {categories.map((cat) => (
            <li key={cat.slug} className="whitespace-nowrap">
              <Link
                href={`/category/${cat.slug}`}
                className="inline-block py-2.5 font-medium border-b-2 border-transparent hover:border-press hover:text-press transition-colors"
              >
                {cat.label[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
