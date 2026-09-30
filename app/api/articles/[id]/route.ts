import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const article = await prisma.article.findUnique({ where: { id: params.id }, include: { media: { orderBy: [{ paragraphIndex: "asc" }, { sortOrder: "asc" }] } } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const body = await req.json();
  const { title, titleHi, summary, summaryHi, content, contentHi, category, imageUrl, sourceName, sourceUrl, author, breaking, live, subscriberOnly, published, publishedHi } = body;
  const media = Array.isArray(body.media) ? body.media : [];

  const article = await prisma.$transaction(async (transaction) => {
    await transaction.articleMedia.deleteMany({ where: { articleId: params.id } });
    return transaction.article.update({
      where: { id: params.id },
      data: { title, titleHi: typeof titleHi === "string" ? titleHi.trim().slice(0, 240) || null : null, summary, summaryHi: typeof summaryHi === "string" ? summaryHi.trim().slice(0, 1000) || null : null, content, contentHi: typeof contentHi === "string" ? contentHi.trim() || null : null, category, imageUrl: imageUrl || null, sourceName: typeof sourceName === "string" ? sourceName.trim().slice(0, 120) || null : null, sourceUrl: typeof sourceUrl === "string" && /^https?:\/\//i.test(sourceUrl.trim()) ? sourceUrl.trim().slice(0, 500) : null, author, breaking: !!breaking, live: !!live, subscriberOnly: !!subscriberOnly, published: !!published, publishedHi: !!publishedHi, media: { create: media.map((item: { type?: string; url?: string; caption?: string; paragraphIndex?: number }, index: number) => ({ type: item.type === "VIDEO" ? "VIDEO" : "IMAGE", url: typeof item.url === "string" ? item.url.trim().slice(0, 500) : "", caption: typeof item.caption === "string" ? item.caption.trim().slice(0, 300) || null : null, paragraphIndex: Math.max(0, Math.floor(Number(item.paragraphIndex) || 0)), sortOrder: index })).filter((item: { url: string }) => item.url) } }
    });
  });

  return NextResponse.json(article);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
