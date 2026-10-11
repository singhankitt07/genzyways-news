import { prisma } from "@/lib/prisma";
import type { OpenAICompatibleProviderConfig } from "./openai-compatible";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export type ProviderStatusView = { name: string; state: "active" | "resting"; blockedUntil: string | null; reason: string | null };

export function getProviderChain(modelOverride?: string | null): OpenAICompatibleProviderConfig[] {
  const names = process.env.AI_PROVIDERS;
  if (names === undefined) {
    const apiKey = process.env.AI_API_KEY?.trim();
    if (!apiKey) return [];
    return [{
      name: "openai-compatible",
      baseUrl: (process.env.AI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
      apiKey,
      model: modelOverride?.trim() || process.env.AI_MODEL?.trim() || DEFAULT_MODEL
    }];
  }

  const chain: OpenAICompatibleProviderConfig[] = [];
  const seen = new Set<string>();
  for (const rawName of names.split(",")) {
    const name = rawName.trim();
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(name) || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const prefix = `AI_${name.toUpperCase().replace(/-/g, "_")}`;
    const baseUrl = process.env[`${prefix}_URL`]?.trim();
    const apiKey = process.env[`${prefix}_KEY`]?.trim();
    const configuredModel = process.env[`${prefix}_MODEL`]?.trim();
    if (!baseUrl || !apiKey || !configuredModel) continue;
    chain.push({ name, baseUrl: baseUrl.replace(/\/$/, ""), apiKey, model: modelOverride?.trim() || configuredModel });
  }
  return chain;
}

export async function getProviderStatuses(): Promise<ProviderStatusView[]> {
  const chain = getProviderChain();
  const names = chain.map((provider) => provider.name);
  if (!names.length) return [];
  const now = new Date();
  const statuses = await prisma.providerStatus.findMany({ where: { name: { in: names } } });
  const byName = new Map(statuses.map((status) => [status.name, status]));
  return chain.map(({ name }) => {
    const status = byName.get(name);
    const resting = !!status && status.blockedUntil > now;
    return {
      name,
      state: resting ? "resting" : "active",
      blockedUntil: status?.blockedUntil.toISOString() ?? null,
      reason: status?.reason ?? null
    };
  });
}
