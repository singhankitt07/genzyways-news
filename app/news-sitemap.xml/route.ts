import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character] || character);
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  let articles: { slug: string; title: string; createdAt: Date; category: string }[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { published: true, createdAt: { gte: cutoff } },
      orderBy: { createdAt: "desc" },
      take: 1_000,
      select: { slug: true, title: true, createdAt: true, category: true }
    });
  } catch {
    articles = [];
  }

  const urls = articles.map((article) => `
    <url>
      <loc>${escapeXml(`${base}/article/${article.slug}`)}</loc>
      <news:news>
        <news:publication>
          <news:name>GenzyWays News</news:name>
          <news:language>en</news:language>
        </news:publication>
        <news:publication_date>${article.createdAt.toISOString()}</news:publication_date>
        <news:title>${escapeXml(article.title)}</news:title>
        <news:keywords>${escapeXml(article.category)}</news:keywords>
      </news:news>
    </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
