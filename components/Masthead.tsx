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
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <>
      <header className="theme-header sticky top-0 z-30 h-16 shadow-sm no-print">
        <div className="max-w-6xl mx-auto flex h-full items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:bg-surface-hover md:hidden"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <span className="hidden md:block"><BrandMark /></span><span className="md:hidden"><BrandMark compact /></span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open search" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink hover:bg-surface-hover lg:hidden"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg></button>
            <form action="/" className="hidden items-center rounded-lg border border-line bg-surface px-2 lg:flex"><label htmlFor="site-search" className="sr-only">Search news</label><input id="site-search" name="q" placeholder="Search" className="w-28 border-0 bg-transparent px-2 py-2 text-sm outline-none" /><button type="submit" aria-label="Search news" className="h-11 w-11 text-ink/70 hover:text-press"><svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg></button></form>
            <ThemeToggle /><div className="hidden xl:block"><AccountMenu /></div><div className="hidden xl:block"><LanguageSwitcher /></div>
          </div>
        </div>
        {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)}><aside className="mobile-safe-bottom h-full w-[min(84vw,360px)] bg-paper p-5 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-line pb-4"><BrandMark compact /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu" className="h-11 w-11 rounded-lg border border-line text-ink"><span aria-hidden="true" className="text-2xl leading-none">&times;</span></button></div><form action="/" className="mt-5 flex items-center rounded-lg border border-line bg-surface px-2"><label htmlFor="drawer-search" className="sr-only">Search news</label><input id="drawer-search" name="q" placeholder="Search news" className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 outline-none" /><button type="submit" aria-label="Search news" className="h-11 w-11 text-ink"><svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg></button></form><nav className="py-5" aria-label="Mobile navigation"><ul className="space-y-1"><li><Link onClick={() => setMenuOpen(false)} href="/" className="block rounded-lg px-3 py-3 font-medium hover:bg-surface-hover">Home</Link></li>{categories.map((cat) => <li key={cat.slug}><Link onClick={() => setMenuOpen(false)} href={`/category/${cat.slug}`} className="block rounded-lg px-3 py-3 font-medium hover:bg-surface-hover">{cat.label[lang]}</Link></li>)}</ul></nav><div className="border-t border-line pt-5 space-y-4"><AccountMenu /><LanguageSwitcher /></div></aside></div>}
      </header>
      <div className="masthead-date border-b border-line bg-surface"><div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-1.5 text-xs text-ink/70"><span className="uppercase tracking-[0.14em] text-[10px] font-semibold text-press">Today</span><span className="truncate">{today}</span><span className="hidden truncate md:inline">· <WeatherWidget /></span></div></div>
      <nav className="scroll-nav-shell border-b border-line bg-surface" aria-label="News categories"><div className="scroll-nav max-w-6xl mx-auto overflow-x-auto px-4"><ul className="flex min-w-max items-center justify-start gap-5 text-sm lg:justify-center"><li className="whitespace-nowrap"><Link href="/" className="inline-flex min-h-11 items-center border-b-2 border-transparent py-3 font-semibold text-ink hover:border-press hover:text-accent-on-dark">{lang === "hi" ? "होम" : "Home"}</Link></li>{categories.map((cat) => <li key={cat.slug} className="whitespace-nowrap"><Link href={`/category/${cat.slug}`} className="inline-flex min-h-11 items-center border-b-2 border-transparent py-3 font-semibold text-ink hover:border-press hover:text-accent-on-dark">{cat.label[lang]}</Link></li>)}</ul></div></nav>
    </>
  );
}
