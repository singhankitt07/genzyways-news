import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalUrl, hashUrl, slugify, titleFingerprint } from "../lib/newsroom/text";
import { isSameStory, scoreImportance } from "../lib/newsroom/cluster";
import { assessRisk } from "../lib/newsroom/risk";
import { verifyClaims } from "../lib/newsroom/verify";
import { sanitizeAnalysis, sanitizeDraft } from "../lib/ai/openai-compatible";
import { parseDraftEdit } from "../lib/newsroom/draft";
import { trendingScore } from "../lib/newsroom/trending";
import { parseSettingsInput } from "../lib/newsroom/settings";
import { AIProviderError, AIBudgetError, type AIProvider } from "../lib/ai/provider";
import { AllProvidersFailedError, classifyProviderError, runWithProviders } from "../lib/ai/retry";

const tokens = (s: string) => new Set(titleFingerprint(s).split(" "));
const sources = [{ index: 1, sourceName: "A", kind: "PUBLISHER" }, { index: 2, sourceName: "B", kind: "PUBLISHER" }, { index: 3, sourceName: "PIB", kind: "GOVERNMENT" }];
const fakeProvider = (name: string): AIProvider => ({
  name,
  model: `${name}-model`,
  async generateDraft() { throw new Error("not used"); },
  async analyzeSources() { throw new Error("not used"); }
});

test("URL hashing ignores tracking params, fragments and www", () => {
  assert.equal(hashUrl("https://www.a.com/x/?utm_source=1#f"), hashUrl("https://a.com/x"));
  assert.notEqual(hashUrl("https://a.com/x"), hashUrl("https://a.com/y"));
  assert.equal(canonicalUrl("https://a.com/p?b=2&a=1"), "https://a.com/p?a=1&b=2");
});

test("slugify", () => assert.equal(slugify("RBI keeps repo rate at 6.5%!"), "rbi-keeps-repo-rate-at-6-5"));

test("clustering matches the same story and not different ones", () => {
  assert.ok(isSameStory(tokens("RBI keeps repo rate unchanged at 6.5 percent"), tokens("RBI keeps repo rate unchanged at 6.5%: Governor")));
  assert.ok(!isSameStory(tokens("RBI keeps repo rate unchanged"), tokens("India beat Australia in Perth Test")));
  assert.ok(scoreImportance({ sourceCount: 9, bestKindWeight: 2, lastSeenAt: new Date(), risk: "HIGH" }) <= 10);
});

test("risk assessment", () => {
  assert.equal(assessRisk("Man arrested over fraud"), "HIGH");
  assert.equal(assessRisk("Parliament passes bill"), "MEDIUM");
  assert.equal(assessRisk("Cricket team wins final"), "LOW");
});

test("verification rules", () => {
  let v = verifyClaims([{ text: "x", sources: [1, 2] }, { text: "y", sources: [3] }], sources, [], "LOW", false);
  assert.equal(v.verdict, "VERIFIED"); assert.equal(v.needsHuman, false);
  assert.equal(verifyClaims([{ text: "x", sources: [1, 2] }], sources, [], "HIGH", false).needsHuman, true);
  v = verifyClaims([{ text: "x", sources: [1] }, { text: "y", sources: [1, 2] }], sources, [], "LOW", false);
  assert.equal(v.verdict, "PARTIAL"); assert.equal(v.needsHuman, true);
  assert.equal(verifyClaims([{ text: "x", sources: [1, 2], conflicts: true }], sources, [], "LOW", false).verdict, "CONFLICTING");
  assert.equal(verifyClaims([], sources, [], "LOW", false).verdict, "UNVERIFIED");
  assert.equal(verifyClaims([{ text: "x", sources: [1, 2] }], sources, [], "LOW", true).needsHuman, true);
});

test("AI output is sanitised", () => {
  const a = sanitizeAnalysis({ summary: "s", claims: [{ text: "ok", sources: [1, 9, "x"] }, { text: "bad", sources: [7] }, { text: "", sources: [1] }] }, 3);
  assert.equal(a.claims.length, 1); assert.deepEqual(a.claims[0].sources, [1]);
  assert.equal(sanitizeDraft({ title: "t" }, "Business"), null);
  const d = sanitizeDraft({ title: "T", summary: "S", content: "x".repeat(100), category: "Nope", keywords: ["K", "k"] }, "Business")!;
  assert.equal(d.category, "Business"); assert.deepEqual(d.keywords, ["k"]);
});

test("draft edit validation", () => {
  assert.ok("error" in parseDraftEdit({ title: "  " }));
  assert.ok("error" in parseDraftEdit({}));
  assert.ok("error" in parseDraftEdit({ title: 5 }));
  const e = parseDraftEdit({ title: " Hi ", slug: "My Slug!", titleHi: "", keywords: ["A", "a", 3] }) as Record<string, unknown>;
  assert.equal(e.title, "Hi"); assert.equal(e.slug, "my-slug"); assert.equal(e.titleHi, null); assert.deepEqual(e.keywords, ["a"]);
});

test("trending score favours fresh views and deliberate actions", () => {
  const fresh = trendingScore({ views: [{ ageDays: 0, views: 10 }], reactions: 0, bookmarks: 0, comments: 0 });
  const old = trendingScore({ views: [{ ageDays: 2, views: 10 }], reactions: 0, bookmarks: 0, comments: 0 });
  assert.ok(fresh > old);
  assert.equal(trendingScore({ views: [], reactions: 1, bookmarks: 1, comments: 1 }), 12);
});

test("settings input is clamped and ignores unknown keys", () => {
  const current = { enabled: false, pollMinutes: 30, categories: [], minImportance: 2, autoResearch: false, autoDraft: false, requireApproval: true, aiProvider: "openai-compatible", aiModel: null, maxRequestsPerDay: 200, maxTokensPerDay: 200000 };
  const next = parseSettingsInput({ enabled: true, pollMinutes: 1, minImportance: 99, maxRequestsPerDay: -5, apiKey: "secret", requireApproval: "no" }, current);
  assert.equal(next.enabled, true); assert.equal(next.pollMinutes, 5); assert.equal(next.minImportance, 5);
  assert.equal(next.maxRequestsPerDay, 0); assert.equal(next.requireApproval, true);
  assert.ok(!("apiKey" in next));
});

test("provider errors distinguish temporary, quota, auth, fatal, and per-minute limits", () => {
  assert.equal(classifyProviderError(new AIProviderError("AI provider returned 503", 503)), "temporary");
  assert.equal(classifyProviderError(new AIProviderError("429 quota exceeded for today", 429)), "quota");
  assert.equal(classifyProviderError(new AIProviderError("429 per-minute rate limit", 429)), "temporary");
  assert.equal(classifyProviderError(new AIProviderError("AI provider returned 401", 401)), "auth");
  assert.equal(classifyProviderError(new AIProviderError("AI provider returned 422", 422)), "fatal");
  assert.equal(classifyProviderError(new AIBudgetError("Daily AI request limit reached.")), "switch");
});

test("provider runner retries a temporary failure, cools it down, and switches providers", async () => {
  const statuses = new Map<string, { blockedUntil: Date; reason: string | null }>();
  const events: { action: string; provider: string; attempt: number }[] = [];
  const [primary, backup] = [fakeProvider("primary"), fakeProvider("backup")];
  let primaryCalls = 0;
  const result = await runWithProviders([primary, backup], async (provider) => {
    if (provider.name === "primary") {
      primaryCalls++;
      throw new AIProviderError("AI provider returned 503", 503);
    }
    return provider.name;
  }, {
    getStatus: async (name) => statuses.get(name) ?? null,
    setCooldown: async (name, blockedUntil, reason) => { statuses.set(name, { blockedUntil, reason }); },
    wait: async () => {},
    random: () => 0,
    onEvent: (event) => { events.push(event); }
  });
  assert.equal(primaryCalls, 4);
  assert.equal(result.provider.name, "backup");
  assert.equal(result.result, "backup");
  assert.equal(events.filter((event) => event.action === "ai.retry").length, 3);
  assert.ok((statuses.get("primary")?.blockedUntil.getTime() ?? 0) > Date.now());
});

test("quota exhaustion sets cooldown and a later story skips that provider", async () => {
  const statuses = new Map<string, { blockedUntil: Date; reason: string | null }>();
  const [primary, backup] = [fakeProvider("primary"), fakeProvider("backup")];
  let primaryCalls = 0;
  const options = {
    getStatus: async (name: string) => statuses.get(name) ?? null,
    setCooldown: async (name: string, blockedUntil: Date, reason: string) => { statuses.set(name, { blockedUntil, reason }); },
    wait: async () => {},
    random: () => 0
  };
  const first = await runWithProviders([primary, backup], async (provider) => {
    if (provider.name === "primary") {
      primaryCalls++;
      throw new AIProviderError("429 daily quota exceeded", 429);
    }
    return provider.name;
  }, options);
  const second = await runWithProviders([primary, backup], async (provider) => provider.name, options);
  assert.equal(first.provider.name, "backup");
  assert.equal(second.provider.name, "backup");
  assert.equal(primaryCalls, 1);
  assert.ok((statuses.get("primary")?.blockedUntil.getTime() ?? 0) - Date.now() > 5 * 60 * 60_000);
});

test("provider runner reports all failures and does not retry its own budget errors", async () => {
  const [primary, backup] = [fakeProvider("primary"), fakeProvider("backup")];
  const statuses = new Map<string, { blockedUntil: Date; reason: string | null }>();
  let primaryCalls = 0;
  let backupCalls = 0;
  const options = {
    getStatus: async (name: string) => statuses.get(name) ?? null,
    setCooldown: async (name: string, blockedUntil: Date, reason: string) => { statuses.set(name, { blockedUntil, reason }); },
    wait: async () => {},
    random: () => 0
  };
  await assert.rejects(
    () => runWithProviders([primary, backup], async (provider) => {
      if (provider.name === "primary") { primaryCalls++; throw new AIBudgetError("Daily request limit reached."); }
      backupCalls++;
      throw new AIProviderError("429 quota exceeded", 429);
    }, options),
    (error: unknown) => error instanceof AllProvidersFailedError && /primary: Daily request limit reached/.test(error.message) && /backup: 429 quota exceeded/.test(error.message)
  );
  assert.equal(primaryCalls, 1);
  assert.equal(backupCalls, 1);
});
