import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { logAutomation } from "@/lib/newsroom/log";
import { parseSourceInput } from "@/lib/newsroom/sources";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  const parsed = await parseSourceInput(await request.json().catch(() => null), true);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const source = await prisma.newsSource.update({ where: { id }, data: parsed.data as Prisma.NewsSourceUpdateInput });
    await logAutomation("source.updated", `Source updated: ${source.name}`, { entity: "NewsSource", entityId: id });
    return NextResponse.json({ source });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Source not found." }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "A source with this URL already exists." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  const removed = await prisma.newsSource.deleteMany({ where: { id } });
  if (!removed.count) return NextResponse.json({ error: "Source not found." }, { status: 404 });
  await logAutomation("source.deleted", "Source deleted", { entity: "NewsSource", entityId: id });
  return NextResponse.json({ ok: true });
}
