"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { call, fmt, RISK_STYLE } from "./api";
import { Badge } from "./StoriesTab";

type Draft = { id: string; title: string; summary: string; category: string; status: string; riskLevel: string; needsHuman: boolean; verdict: string | null; confidence: number; articleId: string | null; createdAt: string };

export default function DraftsTab({ onMessage }: { onMessage: (m: string) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [status, setStatus] = useState("IN_REVIEW");

  const load = useCallback(async () => {
    const result = await call<{ drafts: Draft[] }>(`/api/admin/ai-news/drafts${status ? `?status=${status}` : ""}`);
    if (result.ok) setDrafts(result.data.drafts); else onMessage(result.data.error || "Unable to load drafts.");
  }, [status, onMessage]);
  useEffect(() => { load(); }, [load]);

  return <section className="space-y-4">
    <label className="block text-sm">Status <select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-1 border border-line bg-surface px-2 py-1.5"><option value="">All</option>{["IN_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"].map((s) => <option key={s}>{s}</option>)}</select></label>
    {!drafts.length && <p className="text-sm text-ink/60">No drafts here yet.</p>}
    <ul className="divide-y divide-line border-y border-line">
      {drafts.map((d) => <li key={d.id} className="py-4">
        <Link href={`/admin/ai-news/drafts/${d.id}`} className="font-serif text-lg leading-snug hover:underline">{d.title}</Link>
        <p className="mt-1 line-clamp-2 text-sm text-ink/70">{d.summary}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/60"><Badge>{d.status.replace("_", " ")}</Badge><Badge tone={RISK_STYLE[d.riskLevel]}>{d.riskLevel} risk</Badge>{d.needsHuman && <Badge tone="border-gold text-ink">Needs human review</Badge>}<span>{d.verdict ?? "—"} · {d.confidence}% confidence</span><span>{d.category}</span><span>{fmt(d.createdAt)}</span></p>
      </li>)}
    </ul>
  </section>;
}
