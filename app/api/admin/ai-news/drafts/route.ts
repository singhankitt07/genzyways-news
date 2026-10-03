import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";

const STATUSES = ["IN_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"];

export async function GET(request: Request) {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  const status = new URL(request.url).searchParams.get("status");
  const drafts = await prisma.articleDraft.findMany({
    where: status && STATUSES.includes(status) ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, clusterId: true, title: true, summary: true, category: true, status: true, riskLevel: true, needsHuman: true, verdict: true, confidence: true, articleId: true, createdAt: true, reviewedBy: true }
  });
  return NextResponse.json({ drafts });
}
