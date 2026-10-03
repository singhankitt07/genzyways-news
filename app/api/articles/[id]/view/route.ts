import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/newsroom/guard";
import { startOfUtcDay } from "@/lib/newsroom/trending";

// Public, anonymous view counter. Counts are aggregated per article per day, so no personal data is stored.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`view:${ip}:${id}`, 3, 60_000)) return new NextResponse(null, { status: 204 });
  try {
    const article = await prisma.article.findFirst({ where: { id, published: true }, select: { id: true } });
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const day = startOfUtcDay();
    await prisma.articleView.upsert({ where: { articleId_day: { articleId: id, day } }, update: { views: { increment: 1 } }, create: { articleId: id, day, views: 1 } });
  } catch (error) {
    console.error("[views] could not record view", error);
  }
  return new NextResponse(null, { status: 204 });
}
