import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText, currentReader } from "@/lib/reader";

export async function GET(request: Request) {
  const articleId = new URL(request.url).searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "Article is required." }, { status: 400 });
  const user = await currentReader();
  const comments = await prisma.comment.findMany({ where: { articleId }, orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, image: true } }, votes: true } });
  return NextResponse.json({ comments: comments.map((comment) => ({ id: comment.id, body: comment.deletedAt ? "Comment removed." : comment.body, editedAt: comment.editedAt, createdAt: comment.createdAt, parentId: comment.parentId, user: comment.user, votes: comment.votes.length, voted: Boolean(user && comment.votes.some((vote) => vote.userId === user.id)), own: Boolean(user && comment.userId === user.id), removed: Boolean(comment.deletedAt) })) });
}

export async function POST(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const articleId = cleanText(body?.articleId, 64);
  const commentBody = cleanText(body?.body, 2000);
  const parentId = cleanText(body?.parentId, 64) || null;
  if (!articleId || !commentBody) return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  if (parentId) {
    const parent = await prisma.comment.findFirst({ where: { id: parentId, articleId, deletedAt: null } });
    if (!parent) return NextResponse.json({ error: "Reply target was not found." }, { status: 404 });
  }
  const comment = await prisma.comment.create({ data: { articleId, userId: user.id, parentId, body: commentBody } });
  return NextResponse.json({ ok: true, id: comment.id });
}

export async function PATCH(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to edit comments." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = cleanText(body?.id, 64);
  const text = cleanText(body?.body, 2000);
  if (!id || !text) return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  const comment = await prisma.comment.findFirst({ where: { id, userId: user.id, deletedAt: null } });
  if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  await prisma.comment.update({ where: { id }, data: { body: text, editedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await currentReader();
  if (!user) return NextResponse.json({ error: "Sign in to delete comments." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  const comment = await prisma.comment.findFirst({ where: { id, userId: user.id } });
  if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  await prisma.comment.update({ where: { id }, data: { deletedAt: new Date(), body: "Comment removed." } });
  return NextResponse.json({ ok: true });
}
