import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const body = await req.json();
  const { title, summary, content, category, imageUrl, sourceName, sourceUrl, author, breaking, live, subscriberOnly, published } = body;

  if (!title || !summary || !content || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let slug = slugify(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      summary,
      content,
      category,
      imageUrl: imageUrl || null,
      sourceName: typeof sourceName === "string" ? sourceName.trim().slice(0, 120) || null : null,
      sourceUrl: typeof sourceUrl === "string" && /^https?:\/\//i.test(sourceUrl.trim()) ? sourceUrl.trim().slice(0, 500) : null,
      author: author || "Staff Reporter",
      breaking: !!breaking,
      live: !!live,
      subscriberOnly: !!subscriberOnly,
      published: !!published
    }
  });

  return NextResponse.json(article, { status: 201 });
}
