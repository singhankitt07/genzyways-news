import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AIBudgetError } from "@/lib/ai/provider";
import { createOpenAICompatibleProvider } from "@/lib/ai/openai-compatible";
import { runIdempotentJob } from "./jobs";
import { errorMessage, logAutomation } from "./log";
import { getSettings } from "./settings";
import { CREDIBILITY, verifyClaims } from "./verify";
import type { RiskLevel } from "./risk";

const MAX_SOURCES = 12;

// Enforces the daily request and token caps from the audit log, so limits hold across serverless instances.
export async function assertBudget(requestLimit: number, tokenLimit = Infinity) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const calls = await prisma.automationLog.findMany({ where: { action: "ai.call", createdAt: { gte: start } }, select: { meta: true }, take: Math.max(requestLimit, 1) + 1 });
  if (calls.length >= requestLimit) throw new AIBudgetError("Daily AI request limit reached.");
  const tokens = calls.reduce((sum, row) => sum + (Number((row.meta as { tokens?: number } | null)?.tokens) || 0), 0);
  if (tokens >= tokenLimit) throw new AIBudgetError("Daily AI token limit reached.");
}
function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export type ResearchOutcome = { reportId: string; verdict: string; confidence: number; needsHuman: boolean };

// Builds a research report for one story cluster from its collected sources and verifies each claim.
export async function researchCluster(clusterId: string): Promise<ResearchOutcome> {
  const cluster = await prisma.storyCluster.findUnique({ where: { id: clusterId }, include: { items: { include: { source: { select: { name: true, kind: true } } }, orderBy: { publishedAt: "desc" }, take: MAX_SOURCES } } });
  if (!cluster) throw new Error("Story not found.");
  if (!cluster.items.length) throw new Error("Story has no source items.");

  const settings = await getSettings();
  const provider = createOpenAICompatibleProvider(settings.aiModel);
  await assertBudget(settings.maxRequestsPerDay, settings.maxTokensPerDay);

  await prisma.storyCluster.update({ where: { id: clusterId }, data: { status: "RESEARCHING" } });
  const sources = cluster.items.map((item, i) => ({ index: i + 1, sourceName: item.source.name, kind: item.source.kind, title: item.title, snippet: item.description, publishedAt: item.publishedAt?.toISOString().slice(0, 10) ?? null, url: item.originalUrl }));

  try {
    const { analysis, tokens } = await provider.analyzeSources({ headline: cluster.title, sources });
    await logAutomation("ai.call", `Research analysis for story ${clusterId}`, { entity: "StoryCluster", entityId: clusterId, meta: { tokens, model: provider.model } });

    const verification = verifyClaims(analysis.claims, sources, analysis.conflicts, cluster.riskLevel as RiskLevel, settings.requireApproval);
    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.researchReport.create({
        data: {
          clusterId, summary: analysis.summary || cluster.title, model: provider.model,
          sources: { create: sources.map((s) => ({ position: s.index, title: s.title.slice(0, 300), url: s.url, domain: domainOf(s.url), sourceName: s.sourceName, kind: s.kind, credibility: CREDIBILITY[s.kind] ?? 40, snippet: s.snippet, publishedAt: cluster.items[s.index - 1].publishedAt })) },
          claims: { create: verification.claims.map((c) => ({ text: c.text, status: c.status, sourceCount: c.sourceCount, sourceRefs: c.sourceRefs, note: c.note })) },
          result: { create: { verdict: verification.verdict, confidence: verification.confidence, riskLevel: cluster.riskLevel, needsHuman: verification.needsHuman, conflicts: verification.conflicts, notes: verification.notes } }
        }
      });
      await tx.storyCluster.update({ where: { id: clusterId }, data: { status: "RESEARCHED" } });
      return created;
    });
    await logAutomation("research.ok", `${cluster.title}: ${verification.verdict} (${verification.confidence})`, { entity: "StoryCluster", entityId: clusterId, meta: { verdict: verification.verdict, needsHuman: verification.needsHuman } as Prisma.InputJsonValue });
    return { reportId: report.id, verdict: verification.verdict, confidence: verification.confidence, needsHuman: verification.needsHuman };
  } catch (error) {
    await prisma.storyCluster.update({ where: { id: clusterId }, data: { status: "NEW" } }).catch(() => undefined);
    await logAutomation("research.failed", `${cluster.title}: ${errorMessage(error)}`, { level: "ERROR", entity: "StoryCluster", entityId: clusterId });
    throw error;
  }
}

// Cron step: research the highest-importance unreviewed stories, a few per run to bound cost.
export async function runAutoResearch(limit = 3): Promise<{ researched: number; skipped?: string }> {
  const settings = await getSettings();
  if (!settings.autoResearch) return { researched: 0, skipped: "autoResearch is off" };
  if (!process.env.AI_API_KEY) return { researched: 0, skipped: "AI not configured" };
  const clusters = await prisma.storyCluster.findMany({ where: { status: "NEW", importance: { gte: settings.minImportance }, existingArticleId: null, reports: { none: {} } }, orderBy: [{ importance: "desc" }, { lastSeenAt: "desc" }], take: limit });
  let researched = 0;
  for (const cluster of clusters) {
    const job = await runIdempotentJob("research", `research:${cluster.id}`, () => researchCluster(cluster.id));
    if (job.status === "done") researched++;
    if (job.status === "failed" && /limit reached/i.test(job.error ?? "")) return { researched, skipped: "daily AI limit reached" };
  }
  return { researched };
}