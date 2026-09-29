"use client";
import Link from "next/link";
import { useLanguage, categories } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";
import WeatherWidget from "./WeatherWidget";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SearchIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
const MenuIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;

export default function Masthead() {
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);
  useEffect(() => {
    let previousY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHeaderHidden(currentY > 96 && currentY > previousY);
      if (currentY < 24) setHeaderHidden(false);
      previousY = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(document.querySelectorAll<HTMLElement>(".mobile-drawer a, .mobile-drawer button, .mobile-drawer input, .mobile-drawer select"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : previousOverflow;
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  return (
    <header className={`theme-header masthead sticky top-0 z-30 no-print ${headerHidden && !menuOpen ? "masthead-hidden" : ""}`}>
      <div className="masthead-top mx-auto grid max-w-7xl items-center gap-3 px-4 py-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="hidden min-w-0 items-center gap-3 text-xs text-ink/65 lg:flex"><span className="font-semibold uppercase tracking-[0.14em] text-press">Today</span><span className="truncate">{today}</span><span className="hidden xl:inline">· <WeatherWidget /></span></div>
        <div className="flex items-center justify-between lg:justify-center"><button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} className="menu-toggle tap-target inline-flex items-center justify-center border border-line md:hidden"><MenuIcon /></button><Logo /></div>
        <div className="flex items-center justify-end gap-3"><div className="hidden lg:block"><AccountMenu /></div><Link href="/subscribe" className="subscribe-button">Subscribe</Link><div className="hidden lg:block"><ThemeToggle /></div><div className="hidden xl:block"><LanguageSwitcher /></div></div>
      </div>
      <div className="masthead-date border-t border-line lg:hidden"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1.5 text-[11px] text-ink/65"><span className="font-semibold uppercase tracking-[0.14em] text-press">Today</span><span className="truncate">{today}</span><span className="hidden sm:inline">· <WeatherWidget /></span></div></div>
      <div className="masthead-nav border-t border-line"><div className="mx-auto flex max-w-7xl items-center gap-3 px-4"><button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} className="menu-toggle tap-target hidden items-center justify-center border border-line md:inline-flex"><MenuIcon /></button><Link href="/?q=" className="search-link hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/75 hover:text-press md:flex lg:hidden"><SearchIcon /> Search</Link><form action="/" className="search-form hidden items-center border border-line bg-surface lg:flex"><label htmlFor="site-search" className="sr-only">Search news</label><input id="site-search" name="q" placeholder="Search" className="w-28 border-0 bg-transparent px-2 py-1 text-sm outline-none" /><button type="submit" aria-label="Search news" className="tap-target text-ink/70 hover:text-press"><SearchIcon /></button></form><nav className="category-nav scroll-nav flex-1 overflow-x-auto" aria-label="News categories"><ul className="flex min-w-max items-center justify-start gap-5 text-xs font-semibold lg:justify-center"><li><Link href="/" className="category-link">{lang === "hi" ? "होम" : "Home"}</Link></li>{categories.map((cat, index) => <li key={cat.slug} className={index > 6 ? "hidden xl:block" : ""}><Link href={`/category/${cat.slug}`} className="category-link">{cat.label[lang]}</Link></li>)}<li className="hidden lg:block"><details className="relative"><summary className="category-link more-menu-trigger list-none cursor-pointer" aria-label="More categories" title="More categories"><span aria-hidden="true">&#8943;</span><span className="sr-only">More categories</span></summary><div className="more-menu-panel absolute right-0 top-10 z-40 min-w-48 border border-line bg-surface p-2 shadow-lg">{categories.slice(7).map((cat) => <Link key={cat.slug} href={`/category/${cat.slug}`} className="more-menu-link block px-3 py-2 text-xs">{cat.label[lang]}</Link>)}</div></details></li></ul></nav>{mobileSearchOpen ? <form action="/" className="mobile-search-form flex min-w-0 flex-1 items-center border border-line bg-surface"><label htmlFor="mobile-site-search" className="sr-only">Search news</label><input ref={mobileSearchRef} id="mobile-site-search" name="q" placeholder="Search news" className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none" /><button type="button" onClick={() => setMobileSearchOpen(false)} aria-label="Close search" className="menu-toggle tap-target inline-flex items-center justify-center border border-line"><span aria-hidden="true">&times;</span></button></form> : <button type="button" onClick={() => setMobileSearchOpen(true)} aria-label="Open search" className="menu-toggle tap-target inline-flex items-center justify-center border border-line md:hidden"><SearchIcon /></button>}</div></div>
      {menuOpen && <div className="mobile-drawer-backdrop fixed inset-0 z-50" onClick={closeMenu}><aside className="mobile-drawer mobile-safe-bottom h-full max-h-dvh w-[min(86vw,360px)] overflow-y-auto overscroll-contain border-r border-line p-5 text-ink" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-line pb-4"><Logo iconOnly /><button ref={closeButtonRef} type="button" onClick={closeMenu} aria-label="Close navigation menu" className="menu-toggle tap-target inline-flex items-center justify-center border border-line"><span aria-hidden="true" className="text-2xl leading-none">&times;</span></button></div><form action="/" className="mt-5 flex items-center border border-line bg-background px-2"><label htmlFor="drawer-search" className="sr-only">Search news</label><input id="drawer-search" name="q" placeholder="Search news" className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-ink outline-none" /><button type="submit" aria-label="Search news" className="tap-target text-ink"><SearchIcon /></button></form><nav className="py-5" aria-label="Mobile navigation"><ul className="space-y-1"><li><Link onClick={closeMenu} href="/" className="drawer-link">Home</Link></li>{categories.map((cat) => <li key={cat.slug}><Link onClick={closeMenu} href={`/category/${cat.slug}`} className="drawer-link">{cat.label[lang]}</Link></li>)}</ul></nav><div className="border-t border-line pt-5 space-y-4"><Link onClick={closeMenu} href="/shorts" className="drawer-link">Shorts</Link><Link onClick={closeMenu} href="/videos" className="drawer-link">Videos</Link><Link onClick={closeMenu} href="/subscribe" className="drawer-link">Subscribe</Link><AccountMenu /><LanguageSwitcher /><ThemeToggle /></div></aside></div>}
    </header>
  );
}
