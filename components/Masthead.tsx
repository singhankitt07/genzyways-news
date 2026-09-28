"use client";
import Link from "next/link";
import { useLanguage, categories } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import BrandMark from "./BrandMark";
import AccountMenu from "./AccountMenu";
import WeatherWidget from "./WeatherWidget";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

export default function Masthead() {
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bg-paper/95 backdrop-blur sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} className="md:hidden h-10 w-10 rounded-lg border border-line inline-flex items-center justify-center text-ink hover:bg-ink/10">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="hidden sm:block"><BrandMark /></span>
          <span className="sm:hidden"><BrandMark compact /></span>
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0">
          <form action="/" className="hidden lg:flex items-center rounded-lg border border-line bg-surface px-2">
            <label htmlFor="site-search" className="sr-only">Search news</label>
            <input id="site-search" name="q" placeholder="Search" className="w-28 border-0 bg-transparent px-2 py-2 text-sm outline-none" />
            <button type="submit" aria-label="Search news" className="p-1 text-ink/60 hover:text-press"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg></button>
          </form>
          <ThemeToggle />
          <div className="hidden xl:block"><AccountMenu /></div>
          <div className="hidden xl:block"><LanguageSwitcher /></div>
        </div>
      </div>
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)}>
        <aside className="h-full w-[min(84vw,360px)] bg-paper p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-line pb-4"><BrandMark compact /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu" className="h-10 w-10 rounded-lg border border-line text-ink"><span aria-hidden="true" className="text-2xl leading-none">&times;</span></button></div>
          <nav className="py-5" aria-label="Mobile navigation"><ul className="space-y-1">{categories.map((cat) => <li key={cat.slug}><Link onClick={() => setMenuOpen(false)} href={`/category/${cat.slug}`} className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10">{cat.label[lang]}</Link></li>)}</ul></nav>
          <div className="border-t border-line pt-5 space-y-4"><AccountMenu /><LanguageSwitcher /></div>
        </aside>
      </div>}
      <div className="hidden sm:block border-t border-line">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center gap-3 text-xs text-ink/60">
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
      </div>
      <nav className="border-t border-line bg-surface" aria-label="News categories">
        <div className="max-w-6xl mx-auto overflow-x-auto px-4">
          <ul className="flex min-w-max items-center justify-center gap-5 text-sm">
            {categories.map((cat) => (
              <li key={cat.slug} className="whitespace-nowrap"><Link href={`/category/${cat.slug}`} className="inline-block border-b-2 border-transparent py-3 font-semibold text-ink/75 hover:border-press hover:text-press">{cat.label[lang]}</Link></li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
