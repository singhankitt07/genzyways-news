import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { logAutomation } from "@/lib/newsroom/log";

// Editors can only move a story between NEW and IGNORED here; later stages are set by the pipeline itself.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (!body || (body.status !== "NEW" && body.status !== "IGNORED")) return NextResponse.json({ error: "status must be NEW or IGNORED." }, { status: 400 });
  const updated = await prisma.storyCluster.updateMany({ where: { id, status: { in: ["NEW", "IGNORED"] } }, data: { status: body.status } });
  if (!updated.count) return NextResponse.json({ error: "Story not found or already past review." }, { status: 404 });
  await logAutomation("cluster.status", `Story ${body.status.toLowerCase()}`, { entity: "StoryCluster", entityId: id });
  return NextResponse.json({ ok: true });
}
