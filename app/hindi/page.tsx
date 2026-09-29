import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "हिंदी न्यूज़ | GenzyWays News", description: "GenzyWays News की पूरी हिंदी न्यूज़: करेंट अफेयर्स, टेक, एआई, बिज़नेस और भारत की खबरें।" };

export default async function HindiNewsPage() {
  const articles = await prisma.article.findMany({ where: { published: true, titleHi: { not: null }, summaryHi: { not: null }, contentHi: { not: null } }, orderBy: { createdAt: "desc" }, take: 24 });
  const [lead, ...rest] = articles;
  return <div lang="hi" className="py-8 sm:py-10"><div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-press pb-4"><div><p className="section-kicker">GenzyWays News हिंदी</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">हिंदी न्यूज़ रूम</h1><p className="mt-2 text-sm text-ink/65">पूरी खबरें हिंदी में पढ़ें।</p></div><Link href="/" className="text-sm font-semibold text-press underline">Read English News</Link></div>{lead ? <><article className="border-b border-line pb-10"><Link href={`/hindi/article/${lead.slug}`} className="group"><h2 className="font-serif text-3xl leading-tight group-hover:text-press sm:text-5xl">{lead.titleHi}</h2><p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink/70">{lead.summaryHi}</p><p className="mt-4 text-xs text-ink/55">लेखक: {lead.author} · {lead.category}</p></Link></article><div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{rest.map((article) => <article key={article.id} className="border-t border-line pt-4"><p className="section-kicker">{article.category}</p><Link href={`/hindi/article/${article.slug}`} className="group"><h2 className="mt-2 font-serif text-2xl leading-snug group-hover:text-press">{article.titleHi}</h2><p className="mt-2 text-sm leading-relaxed text-ink/65">{article.summaryHi}</p></Link></article>)}</div></> : <div className="border border-dashed border-line p-10 text-center"><h2 className="font-serif text-2xl">हिंदी संस्करण जल्द उपलब्ध होगा</h2><p className="mt-2 text-sm text-ink/65">एडमिन पैनल से पूरी हिंदी हेडलाइन, सारांश और खबर जोड़ें।</p></div>}</div>;
}
