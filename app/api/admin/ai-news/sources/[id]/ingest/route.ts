import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess, rateLimit, tooManyRequests } from "@/lib/newsroom/guard";
import { ingestSource } from "@/lib/newsroom/ingest";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  if (!rateLimit(`ingest:${id}`, 3, 60_000)) return tooManyRequests();
  if (!(await prisma.newsSource.findUnique({ where: { id }, select: { id: true } }))) return NextResponse.json({ error: "Source not found." }, { status: 404 });
  const result = await ingestSource(id);
  return NextResponse.json({ result }, { status: result.error ? 502 : 200 });
}
