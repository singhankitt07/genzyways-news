import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { renderInline } from "@/lib/markdown";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButtons from "@/components/ShareButtons";
import PrintButton from "@/components/PrintButton";
import RelatedArticles from "@/components/RelatedArticles";
import NewsletterSignup from "@/components/NewsletterSignup";
import ArticleAccessPrompt from "@/components/ArticleAccessPrompt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdSense from "@/components/AdSense";
import LiveTimestamp from "@/components/LiveTimestamp";
import ArticleEngagement from "@/components/ArticleEngagement";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article || !article.published) return {};

  const url = `/article/${article.slug}`;
  const images = article.imageUrl
    ? [{ url: article.imageUrl, alt: article.title }]
    : [{ url: "/brand/png/genzywaynews-og-image.png", width: 1200, height: 630, alt: "GenzyWayNews logo" }];

  return {
    title: `${article.title} | GenzyWayNews`,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url,
      siteName: "GenzyWayNews",
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
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
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
      <article className="mx-auto w-full max-w-[720px] px-0 py-10">
        <div className="mb-2 flex items-center gap-2"><CategoryBadge category={article.category} />{article.live && <span className="live-dot text-xs font-semibold">LIVE · <LiveTimestamp value={article.updatedAt} /></span>}{article.subscriberOnly && <span className="text-xs uppercase tracking-wider text-gold">Subscriber edition</span>}</div>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight mb-4">{article.title}</h1>
        <p className="text-lg text-ink/70 mb-4">{article.summary}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/50 border-b border-line pb-6 mb-8">
          <div className="flex items-center gap-3">
            <span>By {article.author}</span>
            <span>&middot;</span>
            <time>
              {article.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <ShareButtons title={article.title} path={`/article/${article.slug}`} />
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

        <AdSense slot={process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT} />

        <RelatedArticles category={article.category} excludeId={article.id} />
      </article>

      <div className="mx-auto w-full max-w-[720px] pb-16 no-print">
        <NewsletterSignup />
      </div>
    </>
  );
}
