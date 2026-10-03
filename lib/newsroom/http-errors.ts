import { NextResponse } from "next/server";
import { AIBudgetError, AIConfigError } from "@/lib/ai/provider";
import { DraftError } from "./draft";
import { errorMessage, logAutomation } from "./log";

export const actorOf = (session: { user?: { email?: string | null; name?: string | null } | null } | null) => session?.user?.email || session?.user?.name || "admin";

// Maps service errors to safe HTTP responses without leaking provider or database details.
export async function draftErrorResponse(error: unknown) {
  if (error instanceof DraftError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof AIConfigError) return NextResponse.json({ error: error.message }, { status: 503 });
  if (error instanceof AIBudgetError) return NextResponse.json({ error: error.message }, { status: 429 });
  await logAutomation("draft.failed", errorMessage(error), { level: "ERROR" });
  return NextResponse.json({ error: "The request failed. See the automation log." }, { status: 502 });
}
