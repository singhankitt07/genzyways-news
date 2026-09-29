import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText, currentReader } from "@/lib/reader";

export async function POST(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to upvote comments." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const commentId = cleanText(body?.commentId, 64);
  if (!commentId) return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  const existing = await prisma.commentVote.findUnique({ where: { commentId_userId: { commentId, userId: user.id } } });
  if (existing) await prisma.commentVote.delete({ where: { id: existing.id } });
  else await prisma.commentVote.create({ data: { commentId, userId: user.id } });
  return NextResponse.json({ voted: !existing });
}
