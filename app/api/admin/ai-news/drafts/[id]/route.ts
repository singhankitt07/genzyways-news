import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { editDraft, parseDraftEdit } from "@/lib/newsroom/draft";
import { actorOf, draftErrorResponse } from "@/lib/newsroom/http-errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  const { id } = await params;
  const draft = await prisma.articleDraft.findUnique({ where: { id }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 50 } } });
  if (!draft) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  const report = draft.reportId ? await prisma.researchReport.findUnique({ where: { id: draft.reportId }, include: { sources: { orderBy: { position: "asc" } }, claims: true, result: true } }) : null;
  return NextResponse.json({ draft, report });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  const edit = parseDraftEdit(await request.json().catch(() => null));
  if ("error" in edit) return NextResponse.json({ error: edit.error }, { status: 400 });
  try {
    await editDraft(id, edit, actorOf(access.session));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return draftErrorResponse(error);
  }
}
