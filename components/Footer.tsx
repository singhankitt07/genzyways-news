"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import Logo from "./Logo";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/genzywaynews/", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg> },
  { label: "Facebook", href: "https://www.facebook.com/genzywaynews", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M13.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z" /></svg> },
  { label: "X", href: "https://x.com/genzywaynews", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M5 4h3.7l3.5 4.8L16.3 4H19l-5.5 6.2L19.5 20h-3.7l-4-5.4L6.9 20H4.2l5.8-6.6L5 4Zm2 1.7 8.7 12.6h1.6L8.6 5.7H7Z" /></svg> },
  { label: "YouTube", href: "https://www.youtube.com/@genzywaynews", icon: <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.7 12 4.7 12 4.7s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8.9 2 12 2 12s0 3.1.4 4.8a2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM10 15.4V8.6l6 3.4-6 3.4Z" /></svg> }
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-footer-border mt-0 bg-footer text-footer-text no-print">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-footer-muted">{t("tagline")}</p>
          <div className="mt-5 flex items-center gap-2" aria-label="GenzyWayNews social media">
            {SOCIAL_LINKS.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`GenzyWayNews on ${social.label}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-footer-border text-footer-text hover:border-footer-text hover:bg-footer-text hover:text-footer">{social.icon}</a>)}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-footer-muted mb-3">Sections</p>
          <ul className="space-y-1.5">
            <li><Link href="/" className="hover:text-footer-text">Home</Link></li>
            <li><Link href="/category/current-affairs" className="hover:text-footer-text">Current Affairs</Link></li>
            <li><Link href="/category/tech-news" className="hover:text-footer-text">Tech News</Link></li>
            <li><Link href="/category/ai-world" className="hover:text-footer-text">AI World</Link></li>
            <li><Link href="/category/business" className="hover:text-footer-text">Business</Link></li>
            <li><Link href="/category/opinion" className="hover:text-footer-text">Opinion</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-footer-muted mb-3">More</p>
          <ul className="space-y-1.5">
            <li><Link href="/about" className="hover:text-footer-text">About</Link></li>
            <li><Link href="/account/login" className="inline-flex items-center gap-1.5 hover:text-footer-text"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" /></svg>Login</Link></li>
            <li><Link href="/account/profile" className="hover:text-footer-text">My profile</Link></li>
            <li><Link href="/subscribe" className="hover:text-footer-text">Subscribe</Link></li>
            <li><Link href="/shorts" className="hover:text-footer-text">Shorts</Link></li>
            <li><Link href="/videos" className="hover:text-footer-text">Videos</Link></li>
            <li><Link href="/contact" className="hover:text-footer-text">{t("contactUs")}</Link></li>
            <li><Link href="/privacy" className="hover:text-footer-text">{t("privacyPolicy")}</Link></li>
            <li><Link href="/editorial-policy" className="hover:text-footer-text">Editorial Policy</Link></li>
            <li><Link href="/terms" className="hover:text-footer-text">Terms of Use</Link></li>
            <li><a href="/admin/login" className="hover:text-footer-text">{t("staffLogin")}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-footer-border">
        <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-footer-muted">
          &copy; {new Date().getFullYear()} GenzyWayNews. All rights reserved. GenzyWayNews and its logo are trademarks of the newsroom.
        </p>
      </div>
    </footer>
  );
}
