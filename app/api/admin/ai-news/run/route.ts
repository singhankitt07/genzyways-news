import { NextResponse } from "next/server";
import { requireNewsroomAccess, rateLimit, tooManyRequests } from "@/lib/newsroom/guard";
import { runDueIngestion } from "@/lib/newsroom/ingest";
import { runClustering } from "@/lib/newsroom/cluster";

export const maxDuration = 60;

// Manual "fetch and group now" for admins. It ignores the automation switch for ingestion only; research and drafting stay explicit.
export async function POST() {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  if (!rateLimit("run-now", 2, 60_000)) return tooManyRequests();
  const ingestion = await runDueIngestion({ force: true });
  const clustering = await runClustering();
  return NextResponse.json({ ingestion: { ran: ingestion.ran, created: ingestion.created }, clustering });
}
