import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type LogLevel = "INFO" | "WARN" | "ERROR";

// Logging must never break the pipeline, so failures here are swallowed (and echoed to the console).
export async function logAutomation(action: string, message: string, options: { level?: LogLevel; entity?: string; entityId?: string; meta?: Prisma.InputJsonValue } = {}) {
  try {
    await prisma.automationLog.create({ data: { action, message: message.slice(0, 1000), level: options.level ?? "INFO", entity: options.entity, entityId: options.entityId, meta: options.meta } });
  } catch (error) {
    console.error("[newsroom] could not write automation log", action, error);
  }
}

export function errorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}
