import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const articles = await prisma.article.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 30, select: { title: true, slug: true, summary: true, author: true, updatedAt: true } });
  const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const items = articles.map((article) => `<item><title>${escapeXml(article.title)}</title><link>${base}/article/${article.slug}</link><guid isPermaLink="true">${base}/article/${article.slug}</guid><description>${escapeXml(article.summary)}</description><author>${escapeXml(article.author)}</author><pubDate>${article.updatedAt.toUTCString()}</pubDate></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>GenzyWays News</title><link>${base}</link><description>Current affairs, technology, AI, business, opinion, and culture from GenzyWays News.</description><language>en-IN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
