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

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function matchesFormat(value: string, format: "PDF" | "EPUB") {
  return value.split(/[?#]/, 1)[0].toLowerCase().endsWith(`.${format.toLowerCase()}`);
}

export async function GET(request: Request) {
  const admin = new URL(request.url).searchParams.get("admin") === "1";
  if (admin) {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }
  const ebooks = await prisma.ebook.findMany({
    where: admin ? {} : { published: true },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ ebooks });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const title = cleanText(body?.title, 180);
  const summary = cleanText(body?.summary, 1200);
  const category = cleanText(body?.category, 80);
  const format = typeof body?.format === "string" && FORMATS.has(body.format) ? body.format as "PDF" | "EPUB" : null;
  const language = typeof body?.language === "string" && LANGUAGES.has(body.language) ? body.language : "en";
  const fileUrl = safeFileUrl(body?.fileUrl);
  const slug = slugify(cleanText(body?.slug, 180) || title);
  if (!title || !summary || !category || !format || !fileUrl || !slug || !matchesFormat(fileUrl, format)) {
    return NextResponse.json({ error: "Title, summary, category, PDF/EPUB format, and a secure file URL are required." }, { status: 400 });
  }
  if (await prisma.ebook.findUnique({ where: { slug }, select: { id: true } })) {
    return NextResponse.json({ error: "That ebook URL is already in use. Choose another slug." }, { status: 409 });
  }
  const coverUrl = body?.coverUrl ? safeFileUrl(body.coverUrl) : null;
  if (body?.coverUrl && !coverUrl) return NextResponse.json({ error: "Cover image URL must be HTTPS or a local upload." }, { status: 400 });

  const ebook = await prisma.ebook.create({
    data: {
      slug,
      title,
      titleHi: cleanText(body?.titleHi, 180) || null,
      summary,
      summaryHi: cleanText(body?.summaryHi, 1200) || null,
      category,
      author: cleanText(body?.author, 120) || "GenzyWays News Desk",
      language,
      format,
      fileUrl,
      coverUrl,
      sources: cleanText(body?.sources, 4000) || null,
      published: body?.published === true
    }
  });
  return NextResponse.json({ ebook }, { status: 201 });
}