import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText, currentReader } from "@/lib/reader";

const REACTIONS = new Set(["LIKE", "INSIGHTFUL", "SAD", "ANGRY"]);

export async function GET(request: Request) {
  const articleId = new URL(request.url).searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "Article is required." }, { status: 400 });
  const reactions = await prisma.articleReaction.groupBy({ by: ["type"], where: { articleId }, _count: { _all: true } });
  const user = reactions;
  const reader = await currentReader();
  const [saved, reading] = reader ? await Promise.all([prisma.bookmark.findUnique({ where: { articleId_userId: { articleId, userId: reader.id } } }), prisma.readingHistory.findUnique({ where: { articleId_userId: { articleId, userId: reader.id } } })]) : [null, null];
  return NextResponse.json({ reactions: Object.fromEntries(user.map((item) => [item.type, item._count._all])), saved: Boolean(saved), progress: reading?.progress || 0 });
}

export async function POST(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to engage with articles." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const articleId = cleanText(body?.articleId, 64);
  const action = cleanText(body?.action, 32);
  if (!articleId) return NextResponse.json({ error: "Article is required." }, { status: 400 });
  if (action === "bookmark") {
    const existing = await prisma.bookmark.findUnique({ where: { articleId_userId: { articleId, userId: user.id } } });
    if (existing) await prisma.bookmark.delete({ where: { id: existing.id } });
    else await prisma.bookmark.create({ data: { articleId, userId: user.id } });
    return NextResponse.json({ saved: !existing });
  }
  if (action === "history") {
    const progress = Math.max(0, Math.min(100, Number(body?.progress) || 0));
    await prisma.readingHistory.upsert({ where: { articleId_userId: { articleId, userId: user.id } }, update: { progress, lastReadAt: new Date() }, create: { articleId, userId: user.id, progress } });
    return NextResponse.json({ ok: true });
  }
  if (!REACTIONS.has(action)) return NextResponse.json({ error: "Unsupported reaction." }, { status: 400 });
  const existing = await prisma.articleReaction.findUnique({ where: { articleId_userId_type: { articleId, userId: user.id, type: action } } });
  if (existing) await prisma.articleReaction.delete({ where: { id: existing.id } });
  else await prisma.articleReaction.create({ data: { articleId, userId: user.id, type: action } });
  return NextResponse.json({ active: !existing });
}
