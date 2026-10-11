"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { call, fmt, RISK_STYLE } from "./api";

type Cluster = { id: string; title: string; category: string; status: string; importance: number; riskLevel: string; sourceCount: number; itemCount: number; existingArticleId: string | null; lastSeenAt: string; researchFailure: { retryable: boolean; message: string } | null; items: { id: string; title: string; originalUrl: string; source: { name: string } }[] };

export function Badge({ children, tone = "border-line text-ink/60" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`inline-block border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${tone}`}>{children}</span>;
}

export default function StoriesTab({ canWrite, onMessage }: { canWrite: boolean; onMessage: (m: string) => void }) {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [status, setStatus] = useState("NEW");
  const [risk, setRisk] = useState("");
  const [busy, setBusy] = useState("");
  const [open, setOpen] = useState("");

  const load = useCallback(async () => {
    const query = new URLSearchParams(); if (status) query.set("status", status); if (risk) query.set("risk", risk);
    const result = await call<{ clusters: Cluster[] }>(`/api/admin/ai-news/clusters?${query}`);
    if (result.ok) setClusters(result.data.clusters); else onMessage(result.data.error || "Unable to load stories.");
  }, [status, risk, onMessage]);
  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "research" | "draft" | "ignore" | "restore") {
    setBusy(`${id}:${action}`); onMessage("");
    const result = action === "research" ? await call(`/api/admin/ai-news/clusters/${id}/research`, "POST")
      : action === "draft" ? await call<{ draft?: { id: string } }>(`/api/admin/ai-news/clusters/${id}/draft`, "POST", {})
      : await call(`/api/admin/ai-news/clusters/${id}`, "PATCH", { status: action === "ignore" ? "IGNORED" : "NEW" });
    setBusy("");
    if (!result.ok) {
      onMessage(result.data.error || "Action failed.");
      if (action === "research") load();
      return;
    }
    if (action === "draft") onMessage("Draft created. Open the Drafts tab to review it.");
    if (action === "research") onMessage("Research complete.");
    load();
  }

  return <section className="space-y-4">
    <div className="flex flex-wrap gap-3 text-sm">
      <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-1 border border-line bg-surface px-2 py-1.5"><option value="">All</option>{["NEW", "RESEARCHING", "RESEARCHED", "DRAFTED", "PUBLISHED", "IGNORED"].map((s) => <option key={s}>{s}</option>)}</select></label>
      <label>Risk <select value={risk} onChange={(e) => setRisk(e.target.value)} className="ml-1 border border-line bg-surface px-2 py-1.5"><option value="">All</option>{["HIGH", "MEDIUM", "LOW"].map((s) => <option key={s}>{s}</option>)}</select></label>
    </div>
    {!clusters.length && <p className="text-sm text-ink/60">No stories match. Add a source and use “Fetch &amp; group now”.</p>}
    <ul className="divide-y divide-line border-y border-line">
      {clusters.map((c) => <li key={c.id} className="py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg leading-snug">{c.title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink/60"><Badge tone={RISK_STYLE[c.riskLevel]}>{c.riskLevel} risk</Badge><Badge>{c.status}</Badge><span>{c.category}</span><span>Score {c.importance}/10</span><span>{c.sourceCount} source{c.sourceCount === 1 ? "" : "s"}</span><span>{fmt(c.lastSeenAt)}</span>{c.existingArticleId && <Badge tone="border-gold text-ink">Already covered</Badge>}</p>
            {c.researchFailure && <p className="mt-2 text-sm text-red-700">{c.researchFailure.retryable ? "AI provider busy, will retry automatically" : `Research failed: ${c.researchFailure.message}`}</p>}
            <button type="button" onClick={() => setOpen(open === c.id ? "" : c.id)} className="mt-2 text-xs underline">{open === c.id ? "Hide" : "Show"} source items ({c.items.length})</button>
            {open === c.id && <ul className="mt-2 space-y-1 text-sm">{c.items.map((i) => <li key={i.id}><a href={i.originalUrl} target="_blank" rel="noopener noreferrer" className="underline">{i.title}</a> <span className="text-ink/50">— {i.source.name}</span></li>)}</ul>}
          </div>
          {canWrite && <div className="flex flex-wrap gap-2 text-sm">
            {["NEW", "RESEARCHED"].includes(c.status) && <button type="button" disabled={!!busy} onClick={() => act(c.id, "research")} className="button-secondary disabled:opacity-50">{busy === `${c.id}:research` ? "Researching…" : c.researchFailure ? "Retry" : c.status === "NEW" ? "Research" : "Re-research"}</button>}
            {c.status === "RESEARCHED" && <button type="button" disabled={!!busy} onClick={() => act(c.id, "draft")} className="button-primary disabled:opacity-50">{busy === `${c.id}:draft` ? "Drafting…" : "Create draft"}</button>}
            {c.status === "NEW" && <button type="button" disabled={!!busy} onClick={() => act(c.id, "ignore")} className="button-secondary disabled:opacity-50">Ignore</button>}
            {c.status === "IGNORED" && <button type="button" disabled={!!busy} onClick={() => act(c.id, "restore")} className="button-secondary disabled:opacity-50">Restore</button>}
          </div>}
        </div>
        {c.status === "DRAFTED" && <p className="mt-2 text-sm"><Link href="/admin/ai-news?tab=drafts" className="underline">View draft →</Link></p>}
      </li>)}
    </ul>
  </section>;
}
