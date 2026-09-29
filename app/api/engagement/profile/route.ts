import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentReader } from "@/lib/reader";

export async function GET() {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [bookmarks, history, follows] = await Promise.all([
    prisma.bookmark.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { article: { select: { title: true, slug: true, summary: true, imageUrl: true } } } }),
    prisma.readingHistory.findMany({ where: { userId: user.id }, orderBy: { lastReadAt: "desc" }, take: 12, include: { article: { select: { title: true, slug: true, summary: true, imageUrl: true } } } }),
    prisma.categoryFollow.findMany({ where: { userId: user.id }, select: { category: true } })
  ]);
  return NextResponse.json({ bookmarks, history, follows: follows.map((follow) => follow.category) });
}
