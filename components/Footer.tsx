"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import BrandMark from "./BrandMark";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/genzywaynews/", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg> },
  { label: "Facebook", href: "https://www.facebook.com/genzywaynews", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M13.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z" /></svg> },
  { label: "X", href: "https://x.com/genzywaynews", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M5 4h3.7l3.5 4.8L16.3 4H19l-5.5 6.2L19.5 20h-3.7l-4-5.4L6.9 20H4.2l5.8-6.6L5 4Zm2 1.7 8.7 12.6h1.6L8.6 5.7H7Z" /></svg> },
  { label: "YouTube", href: "https://www.youtube.com/@genzywaynews", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.7 12 4.7 12 4.7s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8.9 2 12 2 12s0 3.1.4 4.8a2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM10 15.4V8.6l6 3.4-6 3.4Z" /></svg> }
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-line mt-0 bg-ink text-white/80 no-print">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandMark compact />
          <p className="mt-3 text-white/60">{t("tagline")}</p>
          <div className="mt-5 flex items-center gap-2" aria-label="GenzyWayNews social media">
            {SOCIAL_LINKS.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`GenzyWayNews on ${social.label}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white hover:bg-white hover:text-ink">{social.icon}</a>)}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-paper/40 mb-3">Sections</p>
          <ul className="space-y-1.5">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/category/current-affairs" className="hover:text-white">Current Affairs</Link></li>
            <li><Link href="/category/tech-news" className="hover:text-white">Tech News</Link></li>
            <li><Link href="/category/ai-world" className="hover:text-white">AI World</Link></li>
            <li><Link href="/category/business" className="hover:text-white">Business</Link></li>
            <li><Link href="/category/opinion" className="hover:text-white">Opinion</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-paper/40 mb-3">More</p>
          <ul className="space-y-1.5">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/account/login" className="hover:text-white">Reader sign in</Link></li>
            <li><Link href="/account/profile" className="hover:text-white">My profile</Link></li>
            <li><Link href="/contact" className="hover:text-white">{t("contactUs")}</Link></li>
            <li><Link href="/privacy" className="hover:text-white">{t("privacyPolicy")}</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
            <li><a href="/admin/login" className="hover:text-white">{t("staffLogin")}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-white/50">
          &copy; {new Date().getFullYear()} GenzyWayNews. All rights reserved. GenzyWayNews and its logo are trademarks of the newsroom.
        </p>
      </div>
    </footer>
  );
}
