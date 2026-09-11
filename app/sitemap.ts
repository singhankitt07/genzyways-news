import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    ...["national", "international", "business", "technology", "opinion"].map((slug) => ({
      url: `${base}/category/${slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8
    }))
  ];

  let articles: { slug: string; updatedAt: Date }[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true }
    });
  } catch {
    articles = [];
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/article/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "daily",
    priority: 0.6
  }));

  return [...staticRoutes, ...articleRoutes];
}
