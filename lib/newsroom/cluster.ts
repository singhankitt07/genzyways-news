import { prisma } from "@/lib/prisma";
import { errorMessage, logAutomation } from "./log";
import { runIdempotentJob } from "./jobs";
import { titleFingerprint } from "./text";
import { assessRisk, maxRisk, type RiskLevel } from "./risk";

const WINDOW_MS = 72 * 60 * 60 * 1000;
const BATCH = 300;

const tokens = (fingerprint: string) => new Set(fingerprint.split(" ").filter(Boolean));

// Two headlines describe the same story when they share most of their meaningful words.
export function similarity(a: Set<string>, b: Set<string>): { jaccard: number; overlap: number; containment: number } {
  if (!a.size || !b.size) return { jaccard: 0, overlap: 0, containment: 0 };
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap++;
  return { jaccard: overlap / (a.size + b.size - overlap), overlap, containment: overlap / Math.min(a.size, b.size) };
}

export function isSameStory(a: Set<string>, b: Set<string>): boolean {
  const { jaccard, overlap, containment } = similarity(a, b);
  return jaccard >= 0.5 || (overlap >= 4 && containment >= 0.75);
}

const KIND_WEIGHT: Record<string, number> = { OFFICIAL: 2, GOVERNMENT: 2, PUBLISHER: 1, AGGREGATOR: 0 };

// 0-10 score used to rank clusters for editors: corroboration, source authority, freshness and sensitivity.
export function scoreImportance(input: { sourceCount: number; bestKindWeight: number; lastSeenAt: Date; risk: RiskLevel }, now = Date.now()): number {
  let score = 1 + Math.min(input.sourceCount - 1, 4) + input.bestKindWeight;
  if (now - input.lastSeenAt.getTime() < 6 * 60 * 60 * 1000) score += 1;
  if (input.risk === "HIGH") score += 1;
  return Math.max(0, Math.min(10, score));
}

type Open = { id: string; tokens: Set<string>; sources: Set<string>; itemCount: number; risk: RiskLevel; bestKind: number; lastSeenAt: Date; dirty: boolean; isNew: boolean; title: string; fingerprint: string; category: string; firstSeenAt: Date; existingArticleId: string | null; importance: number };

export type ClusterResult = { processed: number; created: number; merged: number; flaggedExisting: number };

// Assigns every un-clustered NewsItem to a story cluster. Re-running is safe: only items with no cluster are touched.
export async function clusterNewItems(): Promise<ClusterResult> {
  const items = await prisma.newsItem.findMany({ where: { clusterId: null }, orderBy: { publishedAt: "asc" }, take: BATCH, include: { source: { select: { id: true, kind: true } } } });
  if (!items.length) return { processed: 0, created: 0, merged: 0, flaggedExisting: 0 };

  const since = new Date(Date.now() - WINDOW_MS);
  const existing = await prisma.storyCluster.findMany({ where: { lastSeenAt: { gte: since }, status: { not: "IGNORED" } }, include: { items: { select: { sourceId: true } } } });
  const open: Open[] = existing.map((cluster) => ({
    id: cluster.id, tokens: tokens(cluster.titleFingerprint), sources: new Set(cluster.items.map((item) => item.sourceId)), itemCount: cluster.itemCount,
    risk: cluster.riskLevel as RiskLevel, bestKind: 0, lastSeenAt: cluster.lastSeenAt, dirty: false, isNew: false, title: cluster.title, fingerprint: cluster.titleFingerprint,
    category: cluster.category, firstSeenAt: cluster.firstSeenAt, existingArticleId: cluster.existingArticleId, importance: cluster.importance
  }));

  const articles = await prisma.article.findMany({ where: { createdAt: { gte: since } }, select: { id: true, title: true }, take: 500 });
  const articleTokens = articles.map((article) => ({ id: article.id, tokens: tokens(titleFingerprint(article.title)) }));

  const assignments: Array<{ itemId: string; cluster: Open }> = [];
  let created = 0, merged = 0, flagged = 0;

  for (const item of items) {
    const itemTokens = tokens(item.titleFingerprint);
    const when = item.publishedAt ?? item.retrievedAt;
    const risk = assessRisk(`${item.title} ${item.description ?? ""}`);
    const kind = KIND_WEIGHT[item.source.kind] ?? 0;

    let best: Open | undefined;
    let bestScore = 0;
    for (const cluster of open) {
      const { jaccard } = similarity(itemTokens, cluster.tokens);
      if (isSameStory(itemTokens, cluster.tokens) && jaccard >= bestScore) { best = cluster; bestScore = jaccard; }
    }

    if (best) {
      best.itemCount += 1;
      best.sources.add(item.sourceId);
      best.risk = maxRisk(best.risk, risk);
      best.bestKind = Math.max(best.bestKind, kind);
      if (when > best.lastSeenAt) best.lastSeenAt = when;
      best.dirty = true;
      merged++;
      assignments.push({ itemId: item.id, cluster: best });
      continue;
    }

    const match = articleTokens.find((article) => isSameStory(itemTokens, article.tokens));
    if (match) flagged++;
    const cluster: Open = {
      id: "", tokens: itemTokens, sources: new Set([item.sourceId]), itemCount: 1, risk, bestKind: kind, lastSeenAt: when, dirty: true, isNew: true,
      title: item.title, fingerprint: item.titleFingerprint, category: item.category, firstSeenAt: when, existingArticleId: match?.id ?? null, importance: 0
    };
    open.push(cluster);
    created++;
    assignments.push({ itemId: item.id, cluster });
  }

  for (const cluster of open.filter((entry) => entry.dirty)) {
    const data = {
      sourceCount: cluster.sources.size, itemCount: cluster.itemCount, riskLevel: cluster.risk, lastSeenAt: cluster.lastSeenAt,
      importance: Math.max(cluster.importance, scoreImportance({ sourceCount: cluster.sources.size, bestKindWeight: cluster.bestKind, lastSeenAt: cluster.lastSeenAt, risk: cluster.risk }))
    };
    if (cluster.isNew) {
      const row = await prisma.storyCluster.create({ data: { ...data, title: cluster.title.slice(0, 300), titleFingerprint: cluster.fingerprint, category: cluster.category, firstSeenAt: cluster.firstSeenAt, existingArticleId: cluster.existingArticleId } });
      cluster.id = row.id;
      cluster.isNew = false;
    } else {
      await prisma.storyCluster.update({ where: { id: cluster.id }, data });
    }
  }

  const byCluster = new Map<string, string[]>();
  for (const { itemId, cluster } of assignments) byCluster.set(cluster.id, [...(byCluster.get(cluster.id) ?? []), itemId]);
  for (const [clusterId, ids] of byCluster) await prisma.newsItem.updateMany({ where: { id: { in: ids }, clusterId: null }, data: { clusterId } });

  const result = { processed: items.length, created, merged, flaggedExisting: flagged };
  await logAutomation("cluster.ok", `Clustered ${items.length} items: ${created} new stories, ${merged} merged`, { meta: result });
  return result;
}

// Cron/admin entry point. The time bucket makes overlapping invocations collapse into one run.
export async function runClustering(): Promise<ClusterResult | { skipped: true } | { error: string }> {
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const job = await runIdempotentJob("cluster", `cluster:${bucket}`, () => clusterNewItems());
  if (job.status === "done" && job.value) return job.value;
  if (job.status === "skipped") return { skipped: true };
  const message = job.error ?? errorMessage("cluster failed");
  return { error: message };
}
