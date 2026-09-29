import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/reader";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return isAdminSession(session);
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const status = new URL(request.url).searchParams.get("status") || "OPEN";
  const reports = await prisma.commentReport.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      comment: { include: { user: { select: { name: true, email: true } }, article: { select: { title: true, slug: true } } } }
    }
  });
  return NextResponse.json({ reports });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const reportId = cleanText(body?.reportId, 64);
  const action = cleanText(body?.action, 32);
  if (!reportId || !["RESOLVED", "DISMISSED", "HIDE", "RESTORE"].includes(action)) return NextResponse.json({ error: "Report and a valid action are required." }, { status: 400 });
  const report = await prisma.commentReport.findUnique({ where: { id: reportId }, select: { commentId: true } });
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  if (action === "HIDE") await prisma.comment.update({ where: { id: report.commentId }, data: { moderationStatus: "HIDDEN" } });
  if (action === "RESTORE") await prisma.comment.update({ where: { id: report.commentId }, data: { moderationStatus: "VISIBLE" } });
  const status = action === "HIDE" || action === "RESTORE" ? "RESOLVED" : action;
  await prisma.commentReport.update({ where: { id: reportId }, data: { status } });
  return NextResponse.json({ ok: true, status });
}
