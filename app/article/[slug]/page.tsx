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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article || !article.published) return {};

  const url = `/article/${article.slug}`;
  const images = article.imageUrl ? [{ url: article.imageUrl }] : undefined;

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
      card: article.imageUrl ? "summary_large_image" : "summary",
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : undefined
    }
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article || !article.published) notFound();
  const session = await getServerSession(authOptions);
  const isReader = Boolean(session?.user);
  const previewLength = Math.max(1, Math.ceil(article.content.length * 0.2));
  const previewEnd = article.content.lastIndexOf(" ", previewLength);
  const previewContent = article.content.slice(0, previewEnd > 0 ? previewEnd : previewLength);
  const visibleContent = isReader ? article.content : previewContent;
  const visibleParagraphs = visibleContent.split("\n\n");

  return (
    <>
      <article className="py-10 max-w-2xl mx-auto">
        <div className="mb-2"><CategoryBadge category={article.category} /></div>
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
        <div className="prose-content font-serif text-lg leading-relaxed space-y-5">
          {visibleParagraphs.map((para, i) => (
            <p key={i}>{renderInline(para)}</p>
          ))}
        </div>
        {!isReader && <ArticleAccessPrompt />}

        <RelatedArticles category={article.category} excludeId={article.id} />
      </article>

      <div className="max-w-2xl mx-auto pb-16 no-print">
        <NewsletterSignup />
      </div>
    </>
  );
}
