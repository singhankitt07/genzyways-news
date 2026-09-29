import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { categoryFromSlug } from "@/lib/i18n-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = categoryFromSlug(params.slug);
  if (!category) return {};
  const title = `${category.label.en} News | GenzyWayNews`;
  const description = `Latest ${category.label.en} stories, updated daily on GenzyWayNews.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/category/${category.slug}`,
      siteName: "GenzyWayNews",
      images: [{ url: "/brand/png/og-image.png", width: 1200, height: 630, alt: "GenzyWayNews logo" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/png/og-image.png"]
    }
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categoryFromSlug(params.slug);
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { published: true, category: category.label.en },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="py-8">
      <h1 className="font-serif text-4xl mb-8 pb-4 border-b-2 border-press inline-block">{category.label.en}</h1>
      {articles.length === 0 ? (
        <EmptyState variant="section" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {articles.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
      )}
    </div>
  );
}
