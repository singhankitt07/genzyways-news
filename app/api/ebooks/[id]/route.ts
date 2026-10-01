import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/reader";

const LANGUAGES = new Set(["en", "hi", "both"]);
const FORMATS = new Set(["PDF", "EPUB"]);

function safeFileUrl(value: unknown) {
  const url = cleanText(value, 1000);
  if (url.startsWith("/uploads/")) return url;
  try {
    return new URL(url).protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}

function matchesFormat(value: string, format: "PDF" | "EPUB") {
  return value.split(/[?#]/, 1)[0].toLowerCase().endsWith(`.${format.toLowerCase()}`);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const existing = await prisma.ebook.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Ebook not found." }, { status: 404 });

  const format = body?.format === undefined ? existing.format : FORMATS.has(body.format) ? body.format as "PDF" | "EPUB" : null;
  const language = body?.language === undefined ? existing.language : LANGUAGES.has(body.language) ? body.language : "";
  const fileUrl = body?.fileUrl === undefined ? existing.fileUrl : safeFileUrl(body.fileUrl);
  const coverUrl = body?.coverUrl === undefined ? existing.coverUrl : body.coverUrl ? safeFileUrl(body.coverUrl) : null;
  if (!format || !language || !fileUrl || !matchesFormat(fileUrl, format) || (body?.coverUrl && !coverUrl)) {
    return NextResponse.json({ error: "Check the ebook format, language, file, and cover image." }, { status: 400 });
  }
  if (typeof body?.published !== "undefined" && typeof body.published !== "boolean") {
    return NextResponse.json({ error: "Published must be true or false." }, { status: 400 });
  }

  const ebook = await prisma.ebook.update({
    where: { id },
    data: {
      title: body?.title === undefined ? existing.title : cleanText(body.title, 180),
      titleHi: body?.titleHi === undefined ? existing.titleHi : cleanText(body.titleHi, 180) || null,
      summary: body?.summary === undefined ? existing.summary : cleanText(body.summary, 1200),
      summaryHi: body?.summaryHi === undefined ? existing.summaryHi : cleanText(body.summaryHi, 1200) || null,
      category: body?.category === undefined ? existing.category : cleanText(body.category, 80),
      author: body?.author === undefined ? existing.author : cleanText(body.author, 120),
      sources: body?.sources === undefined ? existing.sources : cleanText(body.sources, 4000) || null,
      language,
      format,
      fileUrl,
      coverUrl,
      ...(typeof body?.published === "boolean" ? { published: body.published } : {})
    }
  });
  return NextResponse.json({ ebook });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  await prisma.ebook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}