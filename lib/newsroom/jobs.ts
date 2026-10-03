import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorMessage, logAutomation } from "./log";

const STALE_LOCK_MS = 10 * 60 * 1000;
const backoffMs = (attempt: number) => Math.min(60, 2 ** attempt) * 60 * 1000;

export type JobResult = { status: "done" | "skipped" | "failed"; detail?: unknown; error?: string };

// Runs `work` at most once per unique key. Completed jobs are skipped, running jobs are protected by an atomic
// claim, and failed jobs are retried (with backoff) until maxAttempts, so repeated cron hits never double-process a story.
export async function runIdempotentJob<T>(type: string, key: string, work: () => Promise<T>, options: { payload?: Prisma.InputJsonValue; maxAttempts?: number } = {}): Promise<JobResult & { value?: T }> {
  await prisma.aIProcessingJob.upsert({ where: { key }, update: {}, create: { type, key, payload: options.payload, maxAttempts: options.maxAttempts ?? 3, runAt: new Date(Date.now() - 60_000) } });

  const now = new Date();
  const claimed = await prisma.aIProcessingJob.updateMany({
    where: {
      key,
      attempts: { lt: options.maxAttempts ?? 3 },
      OR: [
        { status: "PENDING", runAt: { lte: now } },
        { status: "FAILED", runAt: { lte: now } },
        { status: "RUNNING", lockedAt: { lt: new Date(now.getTime() - STALE_LOCK_MS) } }
      ]
    },
    data: { status: "RUNNING", lockedAt: now, attempts: { increment: 1 } }
  });
  if (claimed.count === 0) return { status: "skipped" };

  try {
    const value = await work();
    await prisma.aIProcessingJob.update({ where: { key }, data: { status: "DONE", error: null, finishedAt: new Date(), lockedAt: null } });
    return { status: "done", value };
  } catch (error) {
    const message = errorMessage(error);
    const job = await prisma.aIProcessingJob.findUnique({ where: { key }, select: { attempts: true } });
    await prisma.aIProcessingJob.update({ where: { key }, data: { status: "FAILED", error: message, lockedAt: null, runAt: new Date(Date.now() + backoffMs(job?.attempts ?? 1)) } });
    await logAutomation("job.failed", `${type} failed: ${message}`, { level: "ERROR", entity: "AIProcessingJob", entityId: key });
    return { status: "failed", error: message };
  }
}
