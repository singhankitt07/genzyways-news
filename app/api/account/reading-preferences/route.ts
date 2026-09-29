import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const THEMES = new Set(["light", "sepia", "dark", "auto"]);

async function currentUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id || null;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { theme: true, readingFontSize: true }
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    theme: THEMES.has(user.theme) ? user.theme : "auto",
    readingFontSize: user.readingFontSize
  });
}

export async function PATCH(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid preferences." }, { status: 400 });
  }

  const data: { theme?: string; readingFontSize?: number } = {};
  if (Object.hasOwn(body, "theme")) {
    if (typeof body.theme !== "string" || !THEMES.has(body.theme)) {
      return NextResponse.json({ error: "Invalid theme choice." }, { status: 400 });
    }
    data.theme = body.theme;
  }
  if (Object.hasOwn(body, "readingFontSize")) {
    const size = Number(body.readingFontSize);
    if (!Number.isInteger(size) || size < 16 || size > 24) {
      return NextResponse.json({ error: "Reading text size must be between 16 and 24 pixels." }, { status: 400 });
    }
    data.readingFontSize = size;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "No preferences provided." }, { status: 400 });

  const user = await prisma.user.update({ where: { id: userId }, data, select: { theme: true, readingFontSize: true } });
  return NextResponse.json({ theme: user.theme, readingFontSize: user.readingFontSize });
}