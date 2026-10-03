import { prisma } from "@/lib/prisma";
import { logAutomation } from "./log";

const DAY = 24 * 60 * 60 * 1000;

// Keeps the automation tables from growing forever. Only operational data is pruned; stories, reports and drafts are kept.
export async function runCleanup(now = Date.now()) {
  const ago = (days: number) => new Date(now - days * DAY);
  const [logs, jobs, failedJobs, items] = await Promise.all([
    prisma.automationLog.deleteMany({ where: { createdAt: { lt: ago(30) } } }),
    prisma.aIProcessingJob.deleteMany({ where: { status: "DONE", updatedAt: { lt: ago(7) } } }),
    prisma.aIProcessingJob.deleteMany({ where: { status: "FAILED", updatedAt: { lt: ago(30) } } }),
    // Collected items older than 60 days that never joined a story worth keeping.
    prisma.newsItem.deleteMany({ where: { retrievedAt: { lt: ago(60) }, cluster: { is: { status: { in: ["NEW", "IGNORED"] } } } } })
  ]);
  const result = { logs: logs.count, jobs: jobs.count + failedJobs.count, items: items.count };
  if (result.logs || result.jobs || result.items) await logAutomation("cleanup.ok", `Pruned ${result.logs} logs, ${result.jobs} jobs, ${result.items} old items`, { meta: result });
  return result;
}
