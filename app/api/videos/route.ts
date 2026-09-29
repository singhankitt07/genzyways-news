import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/reader";

export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind");
  const admin = new URL(request.url).searchParams.get("admin") === "1";
  if (admin) {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }
  const videos = await prisma.mediaVideo.findMany({ where: { ...(admin ? {} : { published: true }), ...(kind === "SHORT" || kind === "VIDEO" ? { kind } : {}) }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const title = cleanText(body?.title, 160);
  const url = cleanText(body?.url, 500);
  const kind = body?.kind === "SHORT" ? "SHORT" : body?.kind === "VIDEO" ? "VIDEO" : "";
  if (!title || !url || !kind) return NextResponse.json({ error: "Title, video URL, and type are required." }, { status: 400 });
  const video = await prisma.mediaVideo.create({ data: { title, description: cleanText(body?.description, 1000) || null, url, thumbnailUrl: cleanText(body?.thumbnailUrl, 500) || null, kind, published: Boolean(body?.published) } });
  return NextResponse.json({ video });
}
