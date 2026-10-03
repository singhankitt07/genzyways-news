import { NextResponse } from "next/server";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { publishDraft } from "@/lib/newsroom/draft";
import { actorOf, draftErrorResponse } from "@/lib/newsroom/http-errors";

// A human-only action: the request must come from an authenticated admin, and the draft must already be APPROVED.
// `live: false` (default) saves the article unpublished so it can still be checked in the normal editor.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { live?: boolean } | null;
  try {
    return NextResponse.json(await publishDraft(id, actorOf(access.session), { live: body?.live === true }));
  } catch (error) {
    return draftErrorResponse(error);
  }
}
