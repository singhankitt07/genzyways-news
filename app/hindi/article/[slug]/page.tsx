import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderInline } from "@/lib/markdown";
import ArticleEngagement from "@/components/ArticleEngagement";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug }, select: { titleHi: true, summaryHi: true } });
  if (!article?.titleHi || !article.summaryHi) return {};
  return { title: `${article.titleHi} | GenzyWays News`, description: article.summaryHi, alternates: { canonical: `/hindi/article/${params.slug}` } };
}

export default async function HindiArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article?.titleHi || !article.summaryHi || !article.contentHi || !article.publishedHi) notFound();
  return <main lang="hi" className="mx-auto w-full max-w-[760px] py-10"><Link href="/hindi" className="text-sm text-press underline">हिंदी न्यूज़ रूम</Link><p className="section-kicker mt-6">{article.category}</p><h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{article.titleHi}</h1><p className="mt-4 text-lg leading-relaxed text-ink/70">{article.summaryHi}</p><div className="mt-5 border-b border-line pb-5 text-sm text-ink/55">लेखक: {article.author} · {article.createdAt.toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })}</div>{article.imageUrl && <img src={article.imageUrl} alt="" className="mt-8 aspect-[16/9] w-full object-cover" />}{article.sourceName && <p className="mt-5 text-xs text-ink/60">स्रोत: {article.sourceUrl ? <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-press underline">{article.sourceName}</a> : article.sourceName}</p>}<div className="prose-content mt-8 space-y-5 font-sans text-[18px] leading-[1.9]">{article.contentHi.split("\n\n").map((paragraph, index) => <p key={index}>{renderInline(paragraph)}</p>)}</div><ArticleEngagement articleId={article.id} /></main>;
}
