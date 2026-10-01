import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/reader";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  await prisma.mediaVideo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const kind = body?.kind === "SHORT" || body?.kind === "VIDEO" ? body.kind : undefined;
  const video = await prisma.mediaVideo.update({ where: { id }, data: { title: cleanText(body?.title, 160), description: cleanText(body?.description, 1000) || null, thumbnailUrl: cleanText(body?.thumbnailUrl, 500) || null, ...(kind ? { kind } : {}), published: Boolean(body?.published) } });
  return NextResponse.json({ video });
}
