import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { logAutomation } from "@/lib/newsroom/log";
import { listProviders } from "@/lib/newsroom/providers";
import { parseSourceInput, SOURCE_KINDS } from "@/lib/newsroom/sources";

export async function GET() {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  const sources = await prisma.newsSource.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  return NextResponse.json({ sources, providers: listProviders(), kinds: SOURCE_KINDS });
}

export async function POST(request: Request) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const parsed = await parseSourceInput(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const source = await prisma.newsSource.create({ data: parsed.data as Prisma.NewsSourceCreateInput });
    await logAutomation("source.created", `Source added: ${source.name}`, { entity: "NewsSource", entityId: source.id });
    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "A source with this URL already exists." }, { status: 409 });
    throw error;
  }
}
