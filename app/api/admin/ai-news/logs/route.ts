import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";

export async function GET(request: Request) {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  const level = new URL(request.url).searchParams.get("level");
  const logs = await prisma.automationLog.findMany({ where: level && ["INFO", "WARN", "ERROR"].includes(level) ? { level } : {}, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, level: true, action: true, message: true, createdAt: true } });
  return NextResponse.json({ logs });
}
