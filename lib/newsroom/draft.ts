import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createOpenAICompatibleProvider } from "@/lib/ai/openai-compatible";
import { runIdempotentJob } from "./jobs";
import { logAutomation } from "./log";
import { assertBudget } from "./research";
import { getSettings } from "./settings";
import { slugify } from "./text";
import { maxRisk, type RiskLevel } from "./risk";

export class DraftError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

const ACTIVE = ["IN_REVIEW", "APPROVED", "PUBLISHED"];

async function audit(draftId: string, action: string, actor: string, note?: string) {
  await prisma.aIReview.create({ data: { draftId, action, actor, note: note?.slice(0, 500) } });
}

// Turns the latest verified research for a story into a draft. Drafts always start IN_REVIEW; nothing here publishes.
export async function generateDraft(clusterId: string, actor: string, options: { regenerate?: boolean } = {}) {
  const cluster = await prisma.storyCluster.findUnique({ where: { id: clusterId } });
  if (!cluster) throw new DraftError("Story not found.", 404);
  const report = await prisma.researchReport.findFirst({ where: { clusterId, status: "DONE" }, orderBy: { createdAt: "desc" }, include: { sources: { orderBy: { position: "asc" } }, claims: true, result: true } });
  if (!report || !report.result) throw new DraftError("Research this story before drafting it.", 409);
  const result = report.result;
  if (result.verdict === "UNVERIFIED" || !report.claims.length) throw new DraftError("There are no verifiable claims to draft from.", 409);

  const active = await prisma.articleDraft.findFirst({ where: { clusterId, status: { in: ACTIVE } } });
  if (active && !options.regenerate) throw new DraftError("A draft already exists for this story.", 409);
  if (active?.status === "PUBLISHED") throw new DraftError("This story is already published.", 409);

  const settings = await getSettings();
  const provider = createOpenAICompatibleProvider(settings.aiModel);
  await assertBudget(settings.maxRequestsPerDay, settings.maxTokensPerDay);

  const names = (refs: number[]) => refs.map((i) => report.sources.find((s) => s.position === i)?.sourceName).filter((n): n is string => !!n);
  const { draft, tokens } = await provider.generateDraft({
    headline: cluster.title, category: cluster.category, summary: report.summary, conflicts: result.conflicts,
    claims: report.claims.map((c) => ({ text: c.text, status: c.status, sources: names(c.sourceRefs) })),
    sourceNames: [...new Set(report.sources.map((s) => s.sourceName))]
  });
  await logAutomation("ai.call", `Draft generation for story ${clusterId}`, { entity: "StoryCluster", entityId: clusterId, meta: { tokens, model: provider.model } });

  const risk = maxRisk(cluster.riskLevel as RiskLevel, result.riskLevel as RiskLevel);
  const created = await prisma.$transaction(async (tx) => {
    if (active) {
      await tx.articleDraft.update({ where: { id: active.id }, data: { status: "REJECTED", reviewNote: "Superseded by a regenerated draft." } });
      await tx.aIReview.create({ data: { draftId: active.id, action: "REGENERATED", actor } });
    }
    const row = await tx.articleDraft.create({
      data: {
        clusterId, reportId: report.id, title: draft.title, summary: draft.summary, content: draft.content,
        titleHi: draft.titleHi || null, summaryHi: draft.summaryHi || null, contentHi: draft.contentHi || null,
        category: draft.category, slug: slugify(draft.title) || `story-${Date.now().toString(36)}`, seoTitle: draft.seoTitle, seoDescription: draft.seoDescription, keywords: draft.keywords,
        riskLevel: risk, needsHuman: risk === "HIGH" || result.needsHuman, verdict: result.verdict, confidence: result.confidence, model: provider.model
      }
    });
    await tx.aIReview.create({ data: { draftId: row.id, action: "CREATED", actor } });
    await tx.storyCluster.update({ where: { id: clusterId }, data: { status: "DRAFTED" } });
    return row;
  });
  await logAutomation("draft.created", `${created.title} (${risk} risk, ${result.verdict})`, { entity: "ArticleDraft", entityId: created.id });
  return created;
}

export type DraftEdit = Partial<Pick<Prisma.ArticleDraftUncheckedUpdateInput, "title" | "summary" | "content" | "titleHi" | "summaryHi" | "contentHi" | "category" | "slug" | "seoTitle" | "seoDescription">> & { keywords?: string[] };

const LIMITS: Record<string, number> = { title: 240, summary: 600, content: 20000, titleHi: 240, summaryHi: 600, contentHi: 20000, category: 60, slug: 90, seoTitle: 70, seoDescription: 170 };

export function parseDraftEdit(body: unknown): DraftEdit | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request." };
  const input = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    if (!(key in input)) continue;
    const value = input[key];
    if (typeof value !== "string") return { error: `${key} must be text.` };
    const trimmed = value.trim();
    if (["title", "summary", "content", "category", "seoTitle", "seoDescription", "slug"].includes(key) && !trimmed) return { error: `${key} cannot be empty.` };
    if (trimmed.length > max) return { error: `${key} is too long.` };
    out[key] = key === "slug" ? slugify(trimmed) : trimmed || (key.endsWith("Hi") ? null : trimmed);
  }
  if ("keywords" in input) {
    if (!Array.isArray(input.keywords)) return { error: "keywords must be a list." };
    out.keywords = [...new Set(input.keywords.filter((k): k is string => typeof k === "string").map((k) => k.trim().toLowerCase().slice(0, 40)).filter(Boolean))].slice(0, 10);
  }
  if (!Object.keys(out).length) return { error: "Nothing to update." };
  if ("slug" in out && !out.slug) return { error: "slug is invalid." };
  return out as DraftEdit;
}

// Editing returns an approved draft to review, so approval always applies to the exact text that gets published.
export async function editDraft(id: string, edit: DraftEdit, actor: string) {
  const updated = await prisma.articleDraft.updateMany({ where: { id, status: { in: ["IN_REVIEW", "APPROVED", "REJECTED"] } }, data: { ...(edit as Prisma.ArticleDraftUncheckedUpdateManyInput), status: "IN_REVIEW", reviewedBy: null, reviewedAt: null } });
  if (!updated.count) throw new DraftError("Draft not found or already published.", 404);
  await audit(id, "EDITED", actor, Object.keys(edit).join(", "));
}

export async function reviewDraft(id: string, decision: "APPROVED" | "REJECTED", actor: string, note?: string) {
  const updated = await prisma.articleDraft.updateMany({ where: { id, status: { in: ["IN_REVIEW", "APPROVED", "REJECTED"] } }, data: { status: decision, reviewedBy: actor, reviewedAt: new Date(), reviewNote: note?.slice(0, 500) || null } });
  if (!updated.count) throw new DraftError("Draft not found or already published.", 404);
  await audit(id, decision, actor, note);
  await logAutomation(`draft.${decision.toLowerCase()}`, `Draft ${decision.toLowerCase()} by ${actor}`, { entity: "ArticleDraft", entityId: id });
}

// Copies an APPROVED draft into the real Article table. The claim step makes this safe to call twice.
export async function publishDraft(id: string, actor: string, options: { live: boolean }) {
  const claim = await prisma.articleDraft.updateMany({ where: { id, status: "APPROVED", articleId: null }, data: { status: "PUBLISHED" } });
  if (!claim.count) {
    const existing = await prisma.articleDraft.findUnique({ where: { id }, select: { status: true, articleId: true } });
    if (existing?.articleId) return { articleId: existing.articleId, alreadyPublished: true };
    throw new DraftError(existing ? "Only approved drafts can be published." : "Draft not found.", existing ? 409 : 404);
  }

  try {
    const draft = await prisma.articleDraft.findUniqueOrThrow({ where: { id }, include: { cluster: true } });
    const report = draft.reportId ? await prisma.researchReport.findUnique({ where: { id: draft.reportId }, include: { sources: { orderBy: { position: "asc" } } } }) : null;
    const names = [...new Set((report?.sources ?? []).map((s) => s.sourceName))];
    const attribution = names.length ? `\n\n*Sources: ${names.join(", ")}.*` : "";
    const hiAttribution = names.length ? `\n\n*स्रोत: ${names.join(", ")}।*` : "";

    let slug = draft.slug;
    if (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) slug = `${slug.slice(0, 80)}-${Date.now().toString(36)}`;
    const article = await prisma.article.create({
      data: {
        title: draft.title, titleHi: draft.titleHi, slug, summary: draft.summary, summaryHi: draft.summaryHi,
        content: draft.content + attribution, contentHi: draft.contentHi ? draft.contentHi + hiAttribution : null,
        category: draft.category, sourceName: names.slice(0, 3).join(", ") || null, sourceUrl: report?.sources[0]?.url ?? null,
        published: options.live, publishedHi: options.live && !!draft.contentHi
      }
    });
    await prisma.articleDraft.update({ where: { id }, data: { articleId: article.id } });
    await prisma.storyCluster.update({ where: { id: draft.clusterId }, data: { status: "PUBLISHED", existingArticleId: article.id } });
    await audit(id, "PUBLISHED", actor, options.live ? "live" : "saved unpublished");
    await logAutomation("draft.published", `${article.title} (${options.live ? "live" : "unpublished"}) by ${actor}`, { entity: "Article", entityId: article.id });
    return { articleId: article.id, alreadyPublished: false };
  } catch (error) {
    await prisma.articleDraft.updateMany({ where: { id, articleId: null }, data: { status: "APPROVED" } });
    throw error;
  }
}

// Cron step: prepares drafts for human review. It never approves or publishes.
export async function runAutoDraft(limit = 2): Promise<{ drafted: number; skipped?: string }> {
  const settings = await getSettings();
  if (!settings.autoDraft) return { drafted: 0, skipped: "autoDraft is off" };
  if (!process.env.AI_API_KEY) return { drafted: 0, skipped: "AI not configured" };
  const clusters = await prisma.storyCluster.findMany({ where: { status: "RESEARCHED", drafts: { none: {} }, existingArticleId: null }, orderBy: [{ importance: "desc" }, { lastSeenAt: "desc" }], take: limit });
  let drafted = 0;
  for (const cluster of clusters) {
    const job = await runIdempotentJob("draft", `draft:${cluster.id}`, () => generateDraft(cluster.id, "system"));
    if (job.status === "done") drafted++;
    if (job.status === "failed" && /limit reached/i.test(job.error ?? "")) return { drafted, skipped: "daily AI limit reached" };
  }
  return { drafted };
}
