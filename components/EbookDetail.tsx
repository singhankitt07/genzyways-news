"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import type { PublicEbook } from "./EbookLibrary";

function sourceHref(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function EbookDetail({ ebook }: { ebook: PublicEbook }) {
  const { lang } = useLanguage();
  const isHindi = lang === "hi";
  const title = isHindi && ebook.titleHi ? ebook.titleHi : ebook.title;
  const summary = isHindi && ebook.summaryHi ? ebook.summaryHi : ebook.summary;
  const sources = (ebook.sources || "").split("\n").map((source) => source.trim()).filter(Boolean);

  return (
    <article className="ebook-detail">
      <Link href="/ebooks" className="ebook-back-link">{isHindi ? "सभी गाइड" : "All guides"}</Link>
      <div className="ebook-detail-grid">
        <div className="ebook-detail-cover-wrap">
          {ebook.coverUrl ? <img className="ebook-detail-cover" src={ebook.coverUrl} alt="" /> : <div className="ebook-detail-cover ebook-cover-placeholder" aria-hidden="true"><span>{ebook.format}</span><strong>{title.slice(0, 1)}</strong></div>}
        </div>
        <div className="ebook-detail-copy">
          <p className="section-kicker">{ebook.category} · {ebook.format} · {ebook.language === "both" ? (isHindi ? "द्विभाषी" : "Bilingual") : ebook.language.toUpperCase()}</p>
          <h1>{title}</h1>
          {isHindi && ebook.titleHi && <p className="ebook-secondary-title">{ebook.title}</p>}
          <p className="ebook-detail-summary">{summary}</p>
          <p className="ebook-detail-meta">{isHindi ? "लेखक / संपादक" : "Author / editor"}: {ebook.author}</p>
          <p className="ebook-detail-meta">{isHindi ? "अंतिम अपडेट" : "Last updated"}: {new Date(ebook.updatedAt).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          <a className="button-primary ebook-download" href={ebook.fileUrl} target="_blank" rel="noopener noreferrer">{isHindi ? `${ebook.format} डाउनलोड करें` : `Open / download ${ebook.format}`}</a>
        </div>
      </div>
      {sources.length > 0 && <section className="ebook-sources" aria-labelledby="ebook-sources-heading"><h2 id="ebook-sources-heading">{isHindi ? "स्रोत और संदर्भ" : "Sources and references"}</h2><ul>{sources.map((source, index) => {const href = sourceHref(source); return <li key={`${source}-${index}`}>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{source}</a> : source}</li>;})}</ul></section>}
    </article>
  );
}