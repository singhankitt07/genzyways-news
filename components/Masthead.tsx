"use client";

import Link from "next/link";
import { useLanguage, categories } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import HindiNewsLink from "./HindiNewsLink";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";
import WeatherWidget from "./WeatherWidget";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SearchIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
const MenuIcon = ({ open }: { open: boolean }) => open ? <span aria-hidden="true" className="text-2xl leading-none">&times;</span> : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;

export default function Masthead() {
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(80);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  function openMenu() {
    const bottom = headerRef.current?.getBoundingClientRect().bottom;
    setMenuTop(Math.max(0, bottom || 80));
    setMenuOpen((current) => !current);
  }

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => { if (mobileSearchOpen) mobileSearchRef.current?.focus(); }, [mobileSearchOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button, input, select") || []);
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : previousOverflow;
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  return (
    <header ref={headerRef} style={{ "--menu-top": `${menuTop}px` } as React.CSSProperties} className="theme-header masthead sticky top-0 z-30 no-print">
      <div className="masthead-top mx-auto grid max-w-7xl items-center gap-3 px-4 py-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="hidden min-w-0 items-center gap-3 text-xs text-ink/65 lg:flex"><span className="font-semibold uppercase tracking-[0.14em] text-press">Today</span><span className="truncate">{today}</span><span className="hidden xl:inline">· <WeatherWidget /></span></div>
        <div className="flex items-center justify-between lg:justify-center"><button type="button" onClick={openMenu} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="site-mega-menu" className="menu-toggle tap-target inline-flex items-center justify-center border border-line md:hidden"><MenuIcon open={menuOpen} /></button><Logo /></div>
        <div className="flex items-center justify-end gap-3"><div className="hidden lg:block"><AccountMenu /></div><Link href="/subscribe" className="subscribe-button">Subscribe</Link><div className="hidden lg:block"><ThemeToggle /></div><div className="hidden xl:flex items-center gap-3"><HindiNewsLink /><LanguageSwitcher /></div></div>
      </div>
      <div className="masthead-date border-t border-line lg:hidden">
        <div className="masthead-date-content mx-auto max-w-7xl px-4 py-1.5 text-[11px] text-ink/65">
          <div className="masthead-date-label flex min-w-0 items-center gap-2"><span className="font-semibold uppercase tracking-[0.14em] text-press">Today</span><span className="truncate">{today}</span></div>
          <span className="masthead-date-weather">· <WeatherWidget /></span>
          <div className="masthead-mobile-actions"><AccountMenu mobile /><ThemeToggle /></div>
        </div>
      </div>
      <div className="masthead-nav border-t border-line"><div className="mx-auto flex max-w-7xl items-center gap-3 px-4"><button type="button" onClick={openMenu} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="site-mega-menu" className="menu-toggle tap-target hidden items-center justify-center border border-line md:inline-flex"><MenuIcon open={menuOpen} /></button><Link href="/?q=" className="search-link hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/75 hover:text-press md:flex lg:hidden"><SearchIcon /> Search</Link><form action="/" className="search-form hidden items-center border border-line bg-surface lg:flex"><label htmlFor="site-search" className="sr-only">Search news</label><input id="site-search" name="q" placeholder="Search" className="w-28 border-0 bg-transparent px-2 py-1 text-sm outline-none" /><button type="submit" aria-label="Search news" className="tap-target text-ink/70 hover:text-press"><SearchIcon /></button></form><nav className="category-nav scroll-nav flex-1 overflow-x-auto" aria-label="News categories"><ul className="flex min-w-max items-center justify-start gap-5 text-xs font-semibold lg:justify-center"><li><Link href="/" className="category-link">{lang === "hi" ? "होम" : "Home"}</Link></li>{categories.map((cat, index) => <li key={cat.slug} className={index > 6 ? "hidden xl:block" : ""}><Link href={`/category/${cat.slug}`} className="category-link">{cat.label[lang]}</Link></li>)}</ul></nav>{mobileSearchOpen ? <form action="/" className="mobile-search-form flex min-w-0 flex-1 items-center border border-line bg-surface"><label htmlFor="mobile-site-search" className="sr-only">Search news</label><input ref={mobileSearchRef} id="mobile-site-search" name="q" placeholder="Search news" className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none" /><button type="button" onClick={() => setMobileSearchOpen(false)} aria-label="Close search" className="menu-toggle tap-target inline-flex items-center justify-center border border-line"><span aria-hidden="true">&times;</span></button></form> : <button type="button" onClick={() => setMobileSearchOpen(true)} aria-label="Open search" className="menu-toggle tap-target inline-flex items-center justify-center border border-line md:hidden"><SearchIcon /></button>}</div></div>
      {menuOpen && (
        <>
          <div className="mega-menu-backdrop fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <section id="site-mega-menu" ref={menuRef} className="mega-menu-panel fixed left-0 right-0 z-50 overflow-y-auto border-b border-line" style={{ top: `${menuTop}px`, "--menu-top": `${menuTop}px` } as React.CSSProperties} aria-label="Site navigation">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
              <form action="/" className="mega-menu-search mb-7 flex items-center border border-line bg-surface">
                <label htmlFor="mega-search" className="sr-only">Search news</label>
                <input id="mega-search" name="q" placeholder="Search the newsroom" className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 outline-none" />
                <button type="submit" aria-label="Search news" className="tap-target inline-flex items-center justify-center border-l border-line"><SearchIcon /></button>
              </form>
              <div className="mega-menu-grid">
                <section>
                  <h2 className="mega-menu-heading">Sections</h2>
                  <div className="mega-section-list">{categories.map((cat) => <Link key={cat.slug} onClick={() => setMenuOpen(false)} href={`/category/${cat.slug}`} className="mega-menu-link">{cat.label[lang]}</Link>)}</div>
                </section>
                <section>
                  <h2 className="mega-menu-heading">Special</h2>
                  <div className="mega-special-list"><Link onClick={() => setMenuOpen(false)} href="/category/opinion" className="mega-menu-link">Opinion</Link><Link onClick={() => setMenuOpen(false)} href="/shorts" className="mega-menu-link">Shorts</Link><Link onClick={() => setMenuOpen(false)} href="/videos" className="mega-menu-link">Videos</Link><Link onClick={() => setMenuOpen(false)} href="/ebooks" className="mega-menu-link">Guides & eBooks</Link><Link onClick={() => setMenuOpen(false)} href="/editorial-policy" className="mega-menu-link">Editorial Policy</Link></div>
                </section>
                <aside className="mega-trending">
                  <p className="section-kicker">Trending / Events</p>
                  <h2 className="mt-2 font-serif text-2xl">Follow the newsroom</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">Browse the latest reporting, save stories, or follow categories from your reader profile.</p>
                  <div className="mt-5 flex flex-wrap gap-3"><Link onClick={() => setMenuOpen(false)} href="/search" className="text-sm font-semibold text-press underline">Search stories</Link><Link onClick={() => setMenuOpen(false)} href="/account/profile" className="text-sm font-semibold text-press underline">Your profile</Link></div>
                  <div className="mt-5 border-t border-line pt-4">
                    <h3 className="mega-menu-heading">Your account</h3>
                    <AccountMenu mobileMenu onNavigate={() => setMenuOpen(false)} />
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </>
      )}
    </header>
  );
}
