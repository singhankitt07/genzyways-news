import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Rendered per request so the build never needs a database connection and new articles appear immediately.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/subscribe`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/editorial-policy`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...["current-affairs", "tech-news", "ai-world", "business", "opinion"].map((slug) => ({
      url: `${base}/category/${slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8
    }))
  ];

  let articles: { slug: string; updatedAt: Date }[] = [];
  let ebooks: { slug: string; updatedAt: Date }[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true }
    });
  } catch {
    articles = [];
  }
  try {
    ebooks = await prisma.ebook.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  } catch {
    ebooks = [];
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/article/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "daily",
    priority: 0.6
  }));

  const ebookRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/ebooks`, changeFrequency: "weekly", priority: 0.7 },
    ...ebooks.map((ebook) => ({
      url: `${base}/ebooks/${ebook.slug}`,
      lastModified: ebook.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5
    }))
  ];

  return [...staticRoutes, ...articleRoutes, ...ebookRoutes];
}
