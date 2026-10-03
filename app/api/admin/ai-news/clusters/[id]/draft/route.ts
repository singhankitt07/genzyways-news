import { NextResponse } from "next/server";
import { requireNewsroomAccess, rateLimit, tooManyRequests } from "@/lib/newsroom/guard";
import { generateDraft } from "@/lib/newsroom/draft";
import { actorOf, draftErrorResponse } from "@/lib/newsroom/http-errors";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  if (!rateLimit(`draft:${id}`, 2, 60_000)) return tooManyRequests();
  const body = (await request.json().catch(() => null)) as { regenerate?: boolean } | null;
  try {
    const draft = await generateDraft(id, actorOf(access.session), { regenerate: body?.regenerate === true });
    return NextResponse.json({ draft: { id: draft.id, status: draft.status, needsHuman: draft.needsHuman, riskLevel: draft.riskLevel } }, { status: 201 });
  } catch (error) {
    return draftErrorResponse(error);
  }
}
