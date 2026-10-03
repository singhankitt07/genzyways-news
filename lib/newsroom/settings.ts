import { prisma } from "@/lib/prisma";

export type NewsroomSettings = {
  enabled: boolean;
  pollMinutes: number;
  categories: string[];
  minImportance: number;
  autoResearch: boolean;
  autoDraft: boolean;
  requireApproval: boolean;
  aiProvider: string;
  aiModel: string | null;
  maxRequestsPerDay: number;
  maxTokensPerDay: number;
};

export async function getSettings(): Promise<NewsroomSettings> {
  const row = await prisma.automationSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  return { enabled: row.enabled, pollMinutes: row.pollMinutes, categories: row.categories, minImportance: row.minImportance, autoResearch: row.autoResearch, autoDraft: row.autoDraft, requireApproval: row.requireApproval, aiProvider: row.aiProvider, aiModel: row.aiModel, maxRequestsPerDay: row.maxRequestsPerDay, maxTokensPerDay: row.maxTokensPerDay };
}

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(Math.round(number), min), max) : fallback;
};

// Validates untrusted input; unknown keys are ignored and secrets are never accepted here.
export function parseSettingsInput(body: unknown, current: NewsroomSettings): NewsroomSettings {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const bool = (key: "enabled" | "autoResearch" | "autoDraft" | "requireApproval") => (typeof input[key] === "boolean" ? (input[key] as boolean) : current[key]);
  return {
    enabled: bool("enabled"),
    pollMinutes: clamp(input.pollMinutes, 5, 1440, current.pollMinutes),
    categories: Array.isArray(input.categories) ? input.categories.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 60)).filter(Boolean).slice(0, 30) : current.categories,
    minImportance: clamp(input.minImportance, 1, 5, current.minImportance),
    autoResearch: bool("autoResearch"),
    autoDraft: bool("autoDraft"),
    // The review gate for HIGH-risk stories is enforced separately in code, regardless of this flag.
    requireApproval: bool("requireApproval"),
    aiProvider: typeof input.aiProvider === "string" && /^[a-z0-9-]{2,40}$/.test(input.aiProvider) ? input.aiProvider : current.aiProvider,
    aiModel: typeof input.aiModel === "string" ? input.aiModel.trim().slice(0, 80) || null : current.aiModel,
    maxRequestsPerDay: clamp(input.maxRequestsPerDay, 0, 100000, current.maxRequestsPerDay),
    maxTokensPerDay: clamp(input.maxTokensPerDay, 0, 50000000, current.maxTokensPerDay)
  };
}

export async function saveSettings(next: NewsroomSettings) {
  await prisma.automationSettings.upsert({ where: { id: "default" }, update: next, create: { id: "default", ...next } });
}
