import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleContent from "@/components/ArticleContent";
import ArticleEngagement from "@/components/ArticleEngagement";
import ArticleReadingTools from "@/components/ArticleReadingTools";
import ReadingFontSizeControl from "@/components/ReadingFontSizeControl";
import ReadingProgress from "@/components/ReadingProgress";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug }, select: { titleHi: true, summaryHi: true } });
  if (!article?.titleHi || !article.summaryHi) return {};
  return { title: `${article.titleHi} | GenzyWays News`, description: article.summaryHi, alternates: { canonical: `/hindi/article/${slug}` } };
}

export default async function HindiArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug }, include: { media: { orderBy: [{ paragraphIndex: "asc" }, { sortOrder: "asc" }] } } });
  if (!article?.titleHi || !article.summaryHi || !article.contentHi || !article.publishedHi) notFound();
  return (
    <div className="article-reading-page">
      <ReadingProgress />
      <div className="article-reading-layout">
        <ArticleReadingTools articleId={article.id} title={article.titleHi} path={`/hindi/article/${article.slug}`} />
        <main lang="hi" className="article-paper-card mx-auto py-10">
          <Link href="/hindi" className="text-sm text-press underline">हिंदी न्यूज़ रूम</Link>
          <p className="section-kicker mt-6">{article.category}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{article.titleHi}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{article.summaryHi}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5 text-sm text-muted">
            <span>लेखक: {article.author} · {article.createdAt.toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
            <ReadingFontSizeControl />
          </div>
          {article.imageUrl && <img src={article.imageUrl} alt="" className="mt-8 aspect-[16/9] w-full object-cover" />}
          {article.sourceName && <p className="mt-5 text-xs text-muted">स्रोत: {article.sourceUrl ? <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-press underline">{article.sourceName}</a> : article.sourceName}</p>}
          <div className="prose-content mt-8 space-y-5 font-sans leading-[1.9]">
            <ArticleContent content={article.contentHi} format={article.contentHiFormat} media={article.media} hindi />
          </div>
          <ArticleEngagement articleId={article.id} />
        </main>
      </div>
    </div>
  );
}
