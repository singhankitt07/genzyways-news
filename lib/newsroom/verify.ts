import type { ExtractedClaim } from "@/lib/ai/provider";
import type { RiskLevel } from "./risk";

export const CREDIBILITY: Record<string, number> = { OFFICIAL: 90, GOVERNMENT: 90, PUBLISHER: 65, AGGREGATOR: 40 };
const AUTHORITATIVE = new Set(["OFFICIAL", "GOVERNMENT"]);

export type VerifySource = { index: number; sourceName: string; kind: string };
export type VerifiedClaim = { text: string; status: "SUPPORTED" | "SINGLE_SOURCE" | "CONFLICTING"; sourceCount: number; sourceRefs: number[]; note?: string };
export type Verdict = "VERIFIED" | "PARTIAL" | "UNVERIFIED" | "CONFLICTING";
export type Verification = { claims: VerifiedClaim[]; verdict: Verdict; confidence: number; conflicts: string[]; needsHuman: boolean; notes: string };

// A claim counts as supported when two independent publishers state it, or one official/government source does.
export function verifyClaims(claims: ExtractedClaim[], sources: VerifySource[], conflicts: string[], risk: RiskLevel, requireApproval: boolean): Verification {
  const byIndex = new Map(sources.map((s) => [s.index, s]));
  const verified: VerifiedClaim[] = claims.map((claim) => {
    const cited = claim.sources.map((i) => byIndex.get(i)).filter((s): s is VerifySource => !!s);
    const publishers = new Set(cited.map((s) => s.sourceName));
    const authoritative = cited.some((s) => AUTHORITATIVE.has(s.kind));
    const status = claim.conflicts ? "CONFLICTING" : publishers.size >= 2 || authoritative ? "SUPPORTED" : "SINGLE_SOURCE";
    return { text: claim.text, status, sourceCount: publishers.size, sourceRefs: cited.map((s) => s.index), note: claim.note };
  });

  const total = verified.length;
  const supported = verified.filter((c) => c.status === "SUPPORTED").length;
  const conflicting = verified.some((c) => c.status === "CONFLICTING") || conflicts.length > 0;
  const verdict: Verdict = !total ? "UNVERIFIED" : conflicting ? "CONFLICTING" : supported === total ? "VERIFIED" : supported > 0 ? "PARTIAL" : "UNVERIFIED";

  const cred = sources.length ? sources.reduce((sum, s) => sum + (CREDIBILITY[s.kind] ?? 40), 0) / sources.length : 0;
  let confidence = total ? Math.round((supported / total) * 70 + cred * 0.3) : 0;
  if (conflicting) confidence = Math.min(confidence, 40);

  // HIGH-risk stories can never skip a human, regardless of settings or confidence.
  const needsHuman = risk === "HIGH" || verdict !== "VERIFIED" || confidence < 80 || requireApproval;
  const notes = `${supported}/${total} claims corroborated across ${new Set(sources.map((s) => s.sourceName)).size} publisher(s).`;
  return { claims: verified, verdict, confidence, conflicts, needsHuman, notes };
}
