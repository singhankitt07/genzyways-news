"use client";
import Link from "next/link";
import { useLanguage, categories } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Masthead() {
  const { lang, t } = useLanguage();
  return (
    <header className="bg-paper sticky top-0 z-20 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-3 flex items-end justify-between gap-4">
        <div>
          <Link href="/" className="font-serif text-3xl sm:text-4xl tracking-tight text-ink block hover:text-press transition-colors">
            {t("siteName")}
          </Link>
          <p className="text-xs text-ink/50 mt-1">{t("tagline")}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-ink/50 font-sans">
            {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
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
