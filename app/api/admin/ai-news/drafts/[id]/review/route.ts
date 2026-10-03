import { NextResponse } from "next/server";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { reviewDraft } from "@/lib/newsroom/draft";
import { actorOf, draftErrorResponse } from "@/lib/newsroom/http-errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { decision?: string; note?: string } | null;
  if (!body || (body.decision !== "APPROVED" && body.decision !== "REJECTED")) return NextResponse.json({ error: "decision must be APPROVED or REJECTED." }, { status: 400 });
  try {
    await reviewDraft(id, body.decision, actorOf(access.session), typeof body.note === "string" ? body.note : undefined);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return draftErrorResponse(error);
  }
}
