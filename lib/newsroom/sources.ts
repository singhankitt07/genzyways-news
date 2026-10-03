import { Prisma } from "@prisma/client";
import { assertPublicUrl } from "./http";
import { providerIds } from "./providers";

export const SOURCE_KINDS = ["OFFICIAL", "GOVERNMENT", "PUBLISHER", "AGGREGATOR"] as const;
const CONFIG_KEYS = ["country", "category", "language", "query"];

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export type SourceInput = { name: string; provider: string; kind: string; url: string; category: string; pollMinutes: number; enabled: boolean; config: Prisma.InputJsonValue | typeof Prisma.JsonNull };

// Validates untrusted source input (create or partial update). Returns an error string or the cleaned data.
export async function parseSourceInput(body: unknown, partial = false): Promise<{ error: string } | { data: Partial<SourceInput> }> {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const data: Partial<SourceInput> = {};

  if (!partial || input.name !== undefined) { const name = text(input.name, 120); if (!name) return { error: "Name is required." }; data.name = name; }
  if (!partial || input.provider !== undefined) { const provider = text(input.provider, 30) || "rss"; if (!providerIds.includes(provider)) return { error: `Provider must be one of: ${providerIds.join(", ")}.` }; data.provider = provider; }
  if (!partial || input.kind !== undefined) { const kind = text(input.kind, 20) || "PUBLISHER"; if (!(SOURCE_KINDS as readonly string[]).includes(kind)) return { error: `Kind must be one of: ${SOURCE_KINDS.join(", ")}.` }; data.kind = kind; }
  if (!partial || input.category !== undefined) data.category = text(input.category, 60) || "Current Affairs";
  if (input.pollMinutes !== undefined) { const minutes = Number(input.pollMinutes); if (!Number.isFinite(minutes) || minutes < 5 || minutes > 1440) return { error: "Polling interval must be 5-1440 minutes." }; data.pollMinutes = Math.round(minutes); }
  if (typeof input.enabled === "boolean") data.enabled = input.enabled;

  if (input.config !== undefined) {
    const config: Record<string, string> = {};
    if (input.config && typeof input.config === "object") for (const key of CONFIG_KEYS) { const value = text((input.config as Record<string, unknown>)[key], 200); if (value) config[key] = value; }
    data.config = Object.keys(config).length ? config : Prisma.JsonNull;
  }

  const provider = data.provider ?? text(input.provider, 30);
  if (!partial || input.url !== undefined) {
    if (provider === "newsapi") {
      const name = data.name ?? text(input.name, 120);
      data.url = `https://newsapi.org/v2/#${slug(name) || "source"}`;
    } else {
      try { data.url = (await assertPublicUrl(text(input.url, 500))).toString(); } catch (error) { return { error: error instanceof Error && error.message !== "Invalid URL" ? error.message : "Enter a valid public http(s) feed URL." }; }
    }
  }
  return { data };
}
