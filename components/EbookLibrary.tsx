"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export type PublicEbook = {
  id: string;
  slug: string;
  title: string;
  titleHi: string | null;
  summary: string;
  summaryHi: string | null;
  category: string;
  author: string;
  language: string;
  format: "PDF" | "EPUB";
  fileUrl: string;
  coverUrl: string | null;
  sources: string | null;
  updatedAt: string;
};

export default function EbookLibrary({ ebooks }: { ebooks: PublicEbook[] }) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => [...new Set(ebooks.map((ebook) => ebook.category))].sort(), [ebooks]);
  const filtered = ebooks.filter((ebook) => {
    const text = `${ebook.title} ${ebook.titleHi || ""} ${ebook.summary} ${ebook.summaryHi || ""} ${ebook.category}`.toLocaleLowerCase();
    return text.includes(query.trim().toLocaleLowerCase()) && (category === "all" || ebook.category === category);
  });
  const isHindi = lang === "hi";

  return (
    <div>
      <header className="ebooks-page-header">
        <p className="section-kicker">{isHindi ? "पाठकों के लिए संसाधन" : "Reader resources"}</p>
        <h1>{isHindi ? "गाइड और ई-बुक्स" : "Guides & eBooks"}</h1>
        <p>{isHindi ? "न्यूज़रूम की मुफ्त, संपादक-समीक्षित व्याख्याएं और उपयोगी गाइड।" : "Free, editor-reviewed explainers and practical guides from the newsroom."}</p>
      </header>
      <div className="ebook-filters" role="search">
        <label className="ebook-filter-search"><span className="sr-only">Search guides and eBooks</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isHindi ? "गाइड खोजें" : "Search guides"} /></label>
        <label className="ebook-filter-category"><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{isHindi ? "सभी श्रेणियां" : "All categories"}</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <p className="ebook-result-count" aria-live="polite">{filtered.length} {isHindi ? "गाइड" : "guides"}</p>
      </div>
      {filtered.length ? <div className="ebook-card-grid">{filtered.map((ebook) => {
        const title = isHindi && ebook.titleHi ? ebook.titleHi : ebook.title;
        const summary = isHindi && ebook.summaryHi ? ebook.summaryHi : ebook.summary;
        return <article key={ebook.id} className="ebook-card">
          <Link href={`/ebooks/${ebook.slug}`} className="ebook-card-link">
            {ebook.coverUrl ? <img className="ebook-cover" src={ebook.coverUrl} alt="" /> : <div className="ebook-cover ebook-cover-placeholder" aria-hidden="true"><span>{ebook.format}</span><strong>{title.slice(0, 1)}</strong></div>}
            <div className="ebook-card-body">
              <p className="section-kicker">{ebook.category} · {ebook.format} · {ebook.language === "both" ? (isHindi ? "द्विभाषी" : "Bilingual") : ebook.language.toUpperCase()}</p>
              <h2 className="ebook-card-title">{title}</h2>
              <p className="ebook-card-summary">{summary}</p>
              <p className="ebook-card-meta">{isHindi ? "लेखक" : "By"} {ebook.author} · {new Date(ebook.updatedAt).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
              <span className="ebook-open-link">{isHindi ? "गाइड देखें" : "View guide"}</span>
            </div>
          </Link>
        </article>;
      })}</div> : <div className="ebook-empty-state"><h2>{ebooks.length ? (isHindi ? "कोई गाइड नहीं मिली" : "No guides match") : (isHindi ? "गाइड जल्द आ रही हैं" : "Guides are coming soon")}</h2><p>{ebooks.length ? (isHindi ? "अपनी खोज या श्रेणी बदलें।" : "Try another search or category.") : (isHindi ? "हमारी टीम समीक्षित गाइड तैयार कर रही है।" : "Our editors are preparing reviewed guides for readers.")}</p></div>}
    </div>
  );
}