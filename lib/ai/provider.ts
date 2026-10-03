export type SourceMaterial = { index: number; sourceName: string; kind: string; title: string; snippet: string | null; publishedAt: string | null };

export type ExtractedClaim = { text: string; sources: number[]; conflicts?: boolean; note?: string };
export type ResearchAnalysis = { summary: string; claims: ExtractedClaim[]; conflicts: string[] };

// Provider-neutral contract. Later phases add generateArticle / generateSEO to this same interface.
export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generateDraft(input: DraftInput): Promise<{ draft: GeneratedDraft; tokens: number }>;
  analyzeSources(input: { headline: string; sources: SourceMaterial[] }): Promise<{ analysis: ResearchAnalysis; tokens: number }>;
}

export type DraftClaim = { text: string; status: string; sources: string[] };
export type DraftInput = { headline: string; category: string; summary: string; claims: DraftClaim[]; sourceNames: string[]; conflicts: string[] };
export type GeneratedDraft = { title: string; summary: string; content: string; titleHi: string; summaryHi: string; contentHi: string; category: string; seoTitle: string; seoDescription: string; keywords: string[] };

export class AIConfigError extends Error {}
export class AIBudgetError extends Error {}
