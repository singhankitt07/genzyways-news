import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runDueIngestion } from "@/lib/newsroom/ingest";
import { runClustering } from "@/lib/newsroom/cluster";
import { runAutoResearch } from "@/lib/newsroom/research";
import { runAutoDraft } from "@/lib/newsroom/draft";
import { runCleanup } from "@/lib/newsroom/cleanup";
import { errorMessage, logAutomation } from "@/lib/newsroom/log";

export const maxDuration = 60;

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const supplied = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

// Called daily by netlify/functions/newsroom-cron.mts (and Vercel Cron via vercel.json). Each stage is its own idempotent job, so overlapping runs are harmless.
export async function GET(request: Request) {
  const ok = authorised(request);
  if (ok === null) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stage = async <T,>(name: string, work: () => Promise<T>): Promise<T | { error: string }> => {
    try { return await work(); } catch (error) {
      await logAutomation("cron.stage_failed", `${name}: ${errorMessage(error)}`, { level: "ERROR" });
      return { error: `${name} failed` };
    }
  };
  // One failing stage must not block the others; each is idempotent and retried on the next run.
  const ingestion = await stage("ingestion", () => runDueIngestion());
  const disabled = "disabled" in ingestion && ingestion.disabled;
  const clustering = disabled ? undefined : await stage("clustering", () => runClustering());
  const research = disabled ? undefined : await stage("research", () => runAutoResearch(3));
  const drafts = disabled ? undefined : await stage("drafts", () => runAutoDraft());
  const now = new Date();
  const cleanup = now.getUTCHours() === 3 && now.getUTCMinutes() < 15 ? await stage("cleanup", () => runCleanup()) : undefined;
  return NextResponse.json({ ingestion, clustering, research, drafts, cleanup });
}