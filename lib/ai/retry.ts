import { prisma } from "@/lib/prisma";
import { AIBudgetError, AIProviderError, AIResponseError } from "./provider";
import type { AIProvider } from "./provider";
import { errorMessage } from "@/lib/newsroom/log";

export type FailureClass = "temporary" | "quota" | "auth" | "fatal" | "switch";
export type RetryEvent = { action: "ai.retry" | "ai.switch"; provider: string; attempt: number; error: string };
type ProviderStatus = { blockedUntil: Date; reason: string | null };
type RetryOptions = {
  onEvent?: (event: RetryEvent) => Promise<void> | void;
  getStatus?: (name: string) => Promise<ProviderStatus | null>;
  setCooldown?: (name: string, blockedUntil: Date, reason: string) => Promise<void>;
  wait?: (ms: number) => Promise<void>;
  random?: () => number;
};

export class AllProvidersFailedError extends Error {
  constructor(readonly reasons: string[]) {
    super(`All AI providers failed: ${reasons.join("; ")}`);
    this.name = "AllProvidersFailedError";
  }
}

function statusOf(error: unknown): number | null {
  if (error instanceof AIProviderError) return error.status;
  const match = errorMessage(error).match(/\b(?:returned|HTTP)\s+(\d{3})\b/i);
  return match ? Number(match[1]) : null;
}

function nestedMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = "cause" in error ? error.cause : undefined;
  const errorCode = "code" in error ? String(error.code) : "";
  const causeCode = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
  return `${error.name} ${error.message} ${errorCode} ${cause instanceof Error ? `${cause.name} ${cause.message}` : String(cause ?? "")} ${causeCode}`;
}

export function classifyProviderError(error: unknown): FailureClass {
  if (error instanceof AIBudgetError || error instanceof AIResponseError) return "switch";
  const message = nestedMessage(error).toLowerCase();
  const status = statusOf(error);
  if (status === 429) {
    if (/per[- ]minute|requests per minute|\brpm\b/.test(message)) return "temporary";
    return /quota|exceeded|daily|billing|insufficient|credit/.test(message) ? "quota" : "temporary";
  }
  if (status === 401 || status === 402 || status === 403 || status === 404) return "auth";
  if (status === 400 || status === 422) return "fatal";
  if (status === 500 || status === 502 || status === 503 || status === 504) return "temporary";
  if (/timeout|timed out|aborterror|timeouterror|econnreset|fetch failed|overloaded/.test(message)) return "temporary";
  if (/malformed[- ]input|invalid input|bad request/.test(message)) return "fatal";
  return "fatal";
}

export function isRetryableProviderError(error: unknown): boolean {
  const classification = classifyProviderError(error);
  return classification === "temporary" || classification === "quota" || classification === "auth" || classification === "switch";
}

async function emit(options: RetryOptions, event: RetryEvent) {
  await options.onEvent?.(event);
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runWithProviders<T>(
  chain: readonly AIProvider[],
  work: (provider: AIProvider) => Promise<T>,
  options: RetryOptions = {}
): Promise<{ result: T; provider: AIProvider }> {
  const reasons: string[] = [];
  const maxAttempts = 4;

  for (let index = 0; index < chain.length; index++) {
    const provider = chain[index];
    const status = await (options.getStatus
      ? options.getStatus(provider.name)
      : prisma.providerStatus.findUnique({ where: { name: provider.name }, select: { blockedUntil: true, reason: true } }));
    if (status && status.blockedUntil > new Date()) {
      const reason = `resting until ${status.blockedUntil.toISOString()}${status.reason ? ` (${status.reason})` : ""}`;
      reasons.push(`${provider.name}: ${reason}`);
      await emit(options, { action: "ai.switch", provider: provider.name, attempt: 0, error: reason });
      continue;
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return { result: await work(provider), provider };
      } catch (error) {
        const failure = classifyProviderError(error);
        const message = errorMessage(error);
        if (error instanceof AIBudgetError) {
          reasons.push(`${provider.name}: ${message}`);
          await emit(options, { action: "ai.switch", provider: provider.name, attempt, error: message });
          break;
        }
        if (failure === "fatal") throw error;
        if (failure === "temporary" && attempt < maxAttempts) {
          await emit(options, { action: "ai.retry", provider: provider.name, attempt, error: message });
          await (options.wait ?? wait)(1500 * (3 ** (attempt - 1)) + Math.floor((options.random ?? Math.random)() * 500));
          continue;
        }

        const cooldownMs = failure === "quota" ? 6 * 60 * 60_000 : failure === "auth" ? 12 * 60 * 60_000 : failure === "temporary" ? 5 * 60_000 : 0;
        if (cooldownMs) {
          const blockedUntil = new Date(Date.now() + cooldownMs);
          const reason = `${statusOf(error) ?? "Provider"}: ${message}`.slice(0, 500);
          if (options.setCooldown) await options.setCooldown(provider.name, blockedUntil, reason);
          else {
            await prisma.providerStatus.upsert({
              where: { name: provider.name },
              update: { blockedUntil, reason },
              create: { name: provider.name, blockedUntil, reason }
            });
          }
        }
        reasons.push(`${provider.name}: ${message}`);
        if (chain[index + 1]) await emit(options, { action: "ai.switch", provider: provider.name, attempt, error: message });
        break;
      }
    }
  }

  throw new AllProvidersFailedError(reasons.length ? reasons : ["No AI providers are configured."]);
}
