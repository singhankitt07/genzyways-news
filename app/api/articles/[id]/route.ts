import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const body = await req.json();
  const { title, summary, content, category, imageUrl, author, breaking, live, subscriberOnly, published } = body;

  const article = await prisma.article.update({
    where: { id: params.id },
    data: { title, summary, content, category, imageUrl: imageUrl || null, author, breaking: !!breaking, live: !!live, subscriberOnly: !!subscriberOnly, published: !!published }
  });

  return NextResponse.json(article);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
