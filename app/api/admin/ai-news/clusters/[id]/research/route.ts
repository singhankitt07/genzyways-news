import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNewsroomAccess, rateLimit, tooManyRequests } from "@/lib/newsroom/guard";
import { researchCluster } from "@/lib/newsroom/research";
import { AIBudgetError, AIConfigError } from "@/lib/ai/provider";
import { AllProvidersFailedError, isRetryableProviderError } from "@/lib/ai/retry";
import { errorMessage } from "@/lib/newsroom/log";

export const maxDuration = 60;

// Latest research report with its sources, claims and verification result.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  const { id } = await params;
  const report = await prisma.researchReport.findFirst({ where: { clusterId: id }, orderBy: { createdAt: "desc" }, include: { sources: { orderBy: { position: "asc" } }, claims: true, result: true } });
  return NextResponse.json({ report });
}

// Manual (re)run of research for one story.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const { id } = await params;
  if (!rateLimit(`research:${id}`, 2, 60_000)) return tooManyRequests();
  try {
    return NextResponse.json({ result: await researchCluster(id) });
  } catch (error) {
    if (error instanceof AIConfigError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof AllProvidersFailedError || error instanceof AIBudgetError || isRetryableProviderError(error)) {
      return NextResponse.json({ error: "AI provider busy, will retry automatically", retryable: true }, { status: 502 });
    }
    const message = errorMessage(error);
    return NextResponse.json({ error: message }, { status: /not found/i.test(message) ? 404 : 502 });
  }
}
