import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProvider } from "./providers";
import { HttpError } from "./http";
import { runIdempotentJob } from "./jobs";
import { errorMessage, logAutomation } from "./log";
import { getSettings } from "./settings";
import { hashUrl, snippet, titleFingerprint } from "./text";

const ITEMS_PER_SOURCE = 40;

export type IngestResult = { sourceId: string; fetched: number; created: number; duplicates: number; skipped?: boolean; error?: string };

// Fetches one source and stores any new items. Safe to call repeatedly: the unique urlHash makes inserts idempotent.
export async function ingestSource(sourceId: string): Promise<IngestResult> {
  const source = await prisma.newsSource.findUnique({ where: { id: sourceId } });
  if (!source) throw new Error("Source not found.");
  const provider = getProvider(source.provider);
  if (!provider) {
    await prisma.newsSource.update({ where: { id: source.id }, data: { lastFetchedAt: new Date(), lastStatus: "ERROR", lastError: `Unknown provider "${source.provider}".` } });
    return { sourceId, fetched: 0, created: 0, duplicates: 0, error: "Unknown provider." };
  }

  try {
    const items = await provider.fetchItems({ id: source.id, name: source.name, url: source.url, category: source.category, config: (source.config as Record<string, unknown> | null) ?? null }, { limit: ITEMS_PER_SOURCE });
    const seen = new Set<string>();
    const rows: Prisma.NewsItemCreateManyInput[] = [];
    for (const item of items) {
      let urlHash: string;
      try { urlHash = hashUrl(item.url); } catch { continue; }
      if (seen.has(urlHash)) continue;
      seen.add(urlHash);
      rows.push({
        sourceId: source.id,
        externalId: item.externalId,
        originalUrl: item.url.slice(0, 1000),
        urlHash,
        title: item.title.slice(0, 300),
        titleFingerprint: titleFingerprint(item.title).slice(0, 400),
        description: snippet(item.description),
        publishedAt: item.publishedAt,
        category: item.category || source.category,
        meta: item.meta ? (JSON.parse(JSON.stringify(item.meta)) as Prisma.InputJsonValue) : undefined
      });
    }
    const result = rows.length ? await prisma.newsItem.createMany({ data: rows, skipDuplicates: true }) : { count: 0 };
    await prisma.newsSource.update({ where: { id: source.id }, data: { lastFetchedAt: new Date(), lastStatus: "OK", lastError: null } });
    await logAutomation("ingest.ok", `${source.name}: ${result.count} new of ${rows.length} fetched`, { entity: "NewsSource", entityId: source.id, meta: { fetched: rows.length, created: result.count } });
    return { sourceId, fetched: rows.length, created: result.count, duplicates: rows.length - result.count };
  } catch (error) {
    const message = errorMessage(error);
    const rateLimited = error instanceof HttpError && error.status === 429;
    await prisma.newsSource.update({ where: { id: source.id }, data: { lastFetchedAt: new Date(), lastStatus: rateLimited ? "RATE_LIMITED" : "ERROR", lastError: message } });
    await logAutomation("ingest.failed", `${source.name}: ${message}`, { level: rateLimited ? "WARN" : "ERROR", entity: "NewsSource", entityId: source.id });
    return { sourceId, fetched: 0, created: 0, duplicates: 0, error: message };
  }
}

// Ingests every enabled source that is due, honouring each source's polling interval and the global kill switch.
export async function runDueIngestion(options: { force?: boolean } = {}): Promise<{ ran: number; created: number; results: IngestResult[]; disabled?: boolean }> {
  const settings = await getSettings();
  if (!settings.enabled && !options.force) return { ran: 0, created: 0, results: [], disabled: true };

  const now = Date.now();
  const sources = await prisma.newsSource.findMany({ where: { enabled: true }, orderBy: { lastFetchedAt: "asc" } });
  const due = sources.filter((source) => {
    if (settings.categories.length && !settings.categories.includes(source.category)) return false;
    return !source.lastFetchedAt || now - source.lastFetchedAt.getTime() >= Math.max(source.pollMinutes, 1) * 60 * 1000;
  });

  const results: IngestResult[] = [];
  for (const source of due) {
    const bucket = Math.floor(now / (Math.max(source.pollMinutes, 1) * 60 * 1000));
    const job = await runIdempotentJob("ingest", `ingest:${source.id}:${bucket}`, () => ingestSource(source.id), { payload: { sourceId: source.id } });
    if (job.status === "done" && job.value) results.push(job.value);
  }
  return { ran: results.length, created: results.reduce((sum, item) => sum + item.created, 0), results };
}
