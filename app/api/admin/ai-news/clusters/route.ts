import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";

const STATUSES = ["NEW", "IGNORED", "RESEARCHING", "RESEARCHED", "DRAFTED", "PUBLISHED"];

export async function GET(request: Request) {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  const risk = params.get("risk");
  const take = Math.min(Math.max(Number(params.get("limit")) || 50, 1), 100);
  const clusters = await prisma.storyCluster.findMany({
    where: { ...(status && STATUSES.includes(status) ? { status } : {}), ...(risk && ["LOW", "MEDIUM", "HIGH"].includes(risk) ? { riskLevel: risk } : {}) },
    orderBy: [{ importance: "desc" }, { lastSeenAt: "desc" }],
    take,
    include: { items: { select: { id: true, title: true, originalUrl: true, publishedAt: true, source: { select: { name: true, kind: true } } }, orderBy: { publishedAt: "desc" }, take: 10 } }
  });
  return NextResponse.json({ clusters });
}
