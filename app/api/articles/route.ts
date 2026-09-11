import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, summary, content, category, imageUrl, author, breaking, published } = body;

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
      author: author || "Staff Reporter",
      breaking: !!breaking,
      published: !!published
    }
  });

  return NextResponse.json(article, { status: 201 });
}
