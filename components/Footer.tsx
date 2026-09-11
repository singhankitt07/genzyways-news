"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-line mt-16 bg-ink text-paper/80 no-print">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="font-serif text-xl text-white mb-2">{t("siteName")}</p>
          <p className="text-paper/50">{t("tagline")}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-paper/40 mb-3">Sections</p>
          <ul className="space-y-1.5">
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
            <li><Link href="/contact" className="hover:text-white">{t("contactUs")}</Link></li>
            <li><Link href="/privacy" className="hover:text-white">{t("privacyPolicy")}</Link></li>
            <li><a href="/admin/login" className="hover:text-white">{t("staffLogin")}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-paper/40">
          &copy; {new Date().getFullYear()} GenzyWayNews. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
