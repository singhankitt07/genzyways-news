import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText, currentReader } from "@/lib/reader";

export async function GET() {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const follows = await prisma.categoryFollow.findMany({ where: { userId: user.id }, select: { category: true } });
  return NextResponse.json({ categories: follows.map((follow) => follow.category) });
}

export async function POST(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to follow categories." }, { status: 401 });
  const category = cleanText((await request.json().catch(() => null))?.category, 80);
  if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  const existing = await prisma.categoryFollow.findUnique({ where: { userId_category: { userId: user.id, category } } });
  if (existing) await prisma.categoryFollow.delete({ where: { id: existing.id } });
  else await prisma.categoryFollow.create({ data: { userId: user.id, category } });
  return NextResponse.json({ following: !existing });
}
