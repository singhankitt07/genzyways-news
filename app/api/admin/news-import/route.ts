import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const parser = new Parser({
  customFields: { item: ["media:content", "content:encoded"] }
});

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const body = await req.json();
  const feedUrl = typeof body.feedUrl === "string" ? body.feedUrl.trim() : "";
  const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "Current Affairs";
  const maxItems = Math.min(Math.max(Number(body.maxItems) || 10, 1), 20);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(feedUrl);
    if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error("Unsupported protocol");
  } catch {
    return NextResponse.json({ error: "Enter a valid public HTTP or HTTPS feed URL." }, { status: 400 });
  }

  try {
    const response = await fetch(parsedUrl, { signal: AbortSignal.timeout(10000), headers: { "User-Agent": "GenzyWays-Newsroom/1.0" } });
    if (!response.ok) return NextResponse.json({ error: `Feed returned HTTP ${response.status}.` }, { status: 502 });
    const feed = await parser.parseString(await response.text());
    let imported = 0;
    let skipped = 0;

    for (const item of feed.items.slice(0, maxItems)) {
      const title = stripHtml(item.title || "").slice(0, 240);
      const sourceUrl = (item.link || item.guid || "").trim();
      const rawContent = (item as typeof item & { "content:encoded"?: string })["content:encoded"] || item.content || item.contentSnippet || "";
      const content = stripHtml(rawContent);
      if (!title || !sourceUrl || !/^https?:\/\//i.test(sourceUrl) || !content) {
        skipped += 1;
        continue;
      }

      const duplicate = await prisma.article.findFirst({ where: { sourceUrl } });
      if (duplicate) {
        skipped += 1;
        continue;
      }

      let slug = slugify(title) || `imported-story-${Date.now().toString(36)}`;
      if (await prisma.article.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
      const summary = content.slice(0, 280);
      await prisma.article.create({
        data: {
          title,
          slug,
          summary,
          content,
          category,
          author: "Newsroom Import",
          sourceName: feed.title?.trim().slice(0, 120) || parsedUrl.hostname,
          sourceUrl: sourceUrl.slice(0, 500),
          imageUrl: typeof item.enclosure?.url === "string" ? item.enclosure.url : null,
          published: false,
          publishedHi: false,
          live: false,
          breaking: false,
          subscriberOnly: false
        }
      });
      imported += 1;
    }

    return NextResponse.json({ imported, skipped, feedTitle: feed.title || parsedUrl.hostname });
  } catch (error) {
    console.error("News import failed", error);
    return NextResponse.json({ error: "Could not read that feed. Check the URL and try again." }, { status: 502 });
  }
}