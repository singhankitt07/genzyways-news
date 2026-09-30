import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" }, include: { media: { orderBy: [{ paragraphIndex: "asc" }, { sortOrder: "asc" }] } } });
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const body = await req.json();
  const { title, titleHi, summary, summaryHi, content, contentHi, category, imageUrl, sourceName, sourceUrl, author, breaking, live, subscriberOnly, published, publishedHi } = body;
  const media = Array.isArray(body.media) ? body.media : [];

  if (!title || !summary || !content || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let slug = slugify(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const article = await prisma.article.create({
    data: {
      title,
      titleHi: typeof titleHi === "string" ? titleHi.trim().slice(0, 240) || null : null,
      slug,
      summary,
      summaryHi: typeof summaryHi === "string" ? summaryHi.trim().slice(0, 1000) || null : null,
      content,
      contentHi: typeof contentHi === "string" ? contentHi.trim() || null : null,
      category,
      imageUrl: imageUrl || null,
      sourceName: typeof sourceName === "string" ? sourceName.trim().slice(0, 120) || null : null,
      sourceUrl: typeof sourceUrl === "string" && /^https?:\/\//i.test(sourceUrl.trim()) ? sourceUrl.trim().slice(0, 500) : null,
      author: author || "Staff Reporter",
      breaking: !!breaking,
      live: !!live,
      subscriberOnly: !!subscriberOnly,
      published: !!published,
      publishedHi: !!publishedHi,
      media: { create: media.map((item: { type?: string; url?: string; caption?: string; paragraphIndex?: number }, index: number) => ({ type: item.type === "VIDEO" ? "VIDEO" : "IMAGE", url: typeof item.url === "string" ? item.url.trim().slice(0, 500) : "", caption: typeof item.caption === "string" ? item.caption.trim().slice(0, 300) || null : null, paragraphIndex: Math.max(0, Math.floor(Number(item.paragraphIndex) || 0)), sortOrder: index })).filter((item: { url: string }) => item.url) }
    }
  });

  return NextResponse.json(article, { status: 201 });
}
