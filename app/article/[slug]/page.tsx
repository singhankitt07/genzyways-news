import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { renderInline } from "@/lib/markdown";
import CategoryBadge from "@/components/CategoryBadge";
import PrintButton from "@/components/PrintButton";
import RelatedArticles from "@/components/RelatedArticles";
import NewsletterSignup from "@/components/NewsletterSignup";
import ArticleAccessPrompt from "@/components/ArticleAccessPrompt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdSense from "@/components/AdSense";
import LiveTimestamp from "@/components/LiveTimestamp";
import ArticleEngagement from "@/components/ArticleEngagement";
import ArticleReadingTools from "@/components/ArticleReadingTools";
import ReadingFontSizeControl from "@/components/ReadingFontSizeControl";
import ReadingProgress from "@/components/ReadingProgress";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug }, include: { authorProfile: true } });
  if (!article || !article.published) return {};

  const url = `/article/${article.slug}`;
  const images = article.imageUrl
    ? [{ url: article.imageUrl, alt: article.title }]
    : [{ url: "/brand/png/genzywaynews-og-image.png", width: 1200, height: 630, alt: "GenzyWays News logo" }];

  return {
    title: `${article.title} | GenzyWays News`,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url,
      siteName: "GenzyWays News",
      images,
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author]
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [images[0].url]
    }
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug }, include: { authorProfile: true } });
  if (!article || !article.published) notFound();
  const session = await getServerSession(authOptions);
  const isReader = Boolean(session?.user);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const subscription = userId ? await prisma.subscription.findUnique({ where: { userId } }) : null;
  const hasSubscription = subscription?.status === "ACTIVE";
  const hasAccess = hasSubscription;
  const previewLength = Math.max(1, Math.ceil(article.content.length * 0.2));
  const previewEnd = article.content.lastIndexOf(" ", previewLength);
  const previewContent = article.content.slice(0, previewEnd > 0 ? previewEnd : previewLength);
  const visibleContent = hasAccess ? article.content : previewContent;
  const visibleParagraphs = visibleContent.split("\n\n");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.summary,
        datePublished: article.createdAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        mainEntityOfPage: { "@type": "WebPage", "@id": `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/article/${article.slug}` },
        author: { "@type": "Person", name: article.author },
        publisher: { "@type": "Organization", name: "GenzyWays News", url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000", logo: { "@type": "ImageObject", url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/brand/genzywaynews-icon.svg` } },
        image: article.imageUrl || `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/brand/png/genzywaynews-og-image.png`
      }) }} />
      <div className="article-reading-page">
      <ReadingProgress />
      <div className="article-reading-layout">
      <ArticleReadingTools articleId={article.id} title={article.title} path={`/article/${article.slug}`} />
      <article className="article-paper-card mx-auto py-10">
        <div className="mb-2 flex items-center gap-2"><CategoryBadge category={article.category} />{article.live && <span className="live-dot text-xs font-semibold">LIVE · <LiveTimestamp value={article.updatedAt} /></span>}{article.subscriberOnly && <span className="text-xs uppercase tracking-wider text-gold">Subscriber edition</span>}</div>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight mb-4">{article.title}</h1>
        <p className="text-lg text-ink/70 mb-4">{article.summary}</p>
        {(article.sourceName || article.sourceUrl) && <p className="mb-5 text-xs text-ink/60">Source: {article.sourceUrl ? <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-press underline">{article.sourceName || article.sourceUrl}</a> : article.sourceName}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/50 border-b border-line pb-6 mb-8">
          <div className="flex items-center gap-3">
            <span>By <Link href={`/author/${article.authorProfile?.slug || encodeURIComponent(article.author)}`} className="font-semibold text-ink hover:text-press hover:underline">{article.author}</Link></span>
            <span>&middot;</span>
            <time>
              {article.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <ReadingFontSizeControl />
            <PrintButton />
          </div>
        </div>
        {article.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.imageUrl} alt="" className="w-full aspect-[16/9] object-cover mb-8" />
        )}
        <div className="prose-content space-y-5 font-sans text-[17px] leading-[1.7] sm:text-lg">
          {visibleParagraphs.map((para, i) => (
            <p key={i}>{renderInline(para)}</p>
          ))}
        </div>
        {!hasAccess && <ArticleAccessPrompt />}

        <ArticleEngagement articleId={article.id} />

        {article.authorProfile && <aside className="mt-10 border-t border-line pt-6"><p className="section-kicker mb-2">About the author</p><Link href={`/author/${article.authorProfile.slug}`} className="group flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-hover font-serif text-xl text-press">{article.authorProfile.name.charAt(0)}</div><div><h2 className="font-serif text-xl group-hover:text-press">{article.authorProfile.name}</h2><p className="text-sm font-semibold text-press">{article.authorProfile.role}</p><p className="mt-1 text-sm text-ink/65">{article.authorProfile.bio}</p></div></Link></aside>}

      </article>
      </div>

      <div className="mx-auto w-full max-w-[760px] px-4"><AdSense slot={process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT} /></div>
      <div className="mx-auto w-full max-w-[760px] px-4"><RelatedArticles category={article.category} excludeId={article.id} /></div>

      <div className="mx-auto w-full max-w-[720px] pb-16 no-print">
        <NewsletterSignup />
      </div>
      </div>
    </>
  );
}
