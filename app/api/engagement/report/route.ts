import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText, currentReader } from "@/lib/reader";

export async function POST(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to report a comment." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const commentId = cleanText(body?.commentId, 64);
  const reason = cleanText(body?.reason, 240) || "Abusive or inappropriate content";
  if (!commentId) return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  await prisma.commentReport.upsert({ where: { commentId_userId: { commentId, userId: user.id } }, update: { reason }, create: { commentId, userId: user.id, reason } });
  return NextResponse.json({ ok: true });
}
