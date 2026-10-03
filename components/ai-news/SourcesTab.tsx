"use client";

import { useCallback, useEffect, useState } from "react";
import { call, fmt } from "./api";

type Source = { id: string; name: string; provider: string; kind: string; url: string; category: string; enabled: boolean; pollMinutes: number; lastFetchedAt: string | null; lastStatus: string | null; lastError: string | null; _count: { items: number } };
type Meta = { providers: { id: string; label: string }[]; kinds: string[] };

const field = "mt-1 w-full border border-line bg-surface px-3 py-2";

export default function SourcesTab({ canWrite, onMessage }: { canWrite: boolean; onMessage: (m: string) => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [meta, setMeta] = useState<Meta>({ providers: [], kinds: [] });
  const [form, setForm] = useState({ name: "", provider: "rss", kind: "PUBLISHER", url: "", category: "Current Affairs", pollMinutes: 30 });
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const result = await call<{ sources: Source[] } & Meta>("/api/admin/ai-news/sources");
    if (result.ok) { setSources(result.data.sources); setMeta({ providers: result.data.providers, kinds: result.data.kinds }); } else onMessage(result.data.error || "Unable to load sources.");
  }, [onMessage]);
  useEffect(() => { load(); }, [load]);

  async function add(event: React.FormEvent) {
    event.preventDefault(); onMessage("");
    const result = await call("/api/admin/ai-news/sources", "POST", form);
    if (!result.ok) { onMessage(result.data.error || "Unable to add source."); return; }
    setForm({ ...form, name: "", url: "" }); load();
  }
  async function run(id: string, action: "ingest" | "toggle" | "delete", source?: Source) {
    if (action === "delete" && !window.confirm("Delete this source and all its collected items?")) return;
    setBusy(id); onMessage("");
    const result = action === "ingest" ? await call<{ result?: { created: number; fetched: number } }>(`/api/admin/ai-news/sources/${id}/ingest`, "POST")
      : action === "toggle" ? await call(`/api/admin/ai-news/sources/${id}`, "PATCH", { enabled: !source?.enabled })
      : await call(`/api/admin/ai-news/sources/${id}`, "DELETE");
    setBusy("");
    if (!result.ok) onMessage(result.data.error || "Action failed.");
    else if (action === "ingest") { const r = (result.data as { result?: { created: number; fetched: number } }).result; onMessage(`Fetched ${r?.fetched ?? 0} items, ${r?.created ?? 0} new.`); }
    load();
  }

  return <section className="space-y-6">
    {canWrite && <form onSubmit={add} className="grid gap-3 border border-line p-4 sm:grid-cols-2">
      <label className="text-sm">Name<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} /></label>
      <label className="text-sm">Provider<select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={field}>{meta.providers.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
      {form.provider !== "newsapi" && <label className="text-sm sm:col-span-2">Feed URL<input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/rss.xml" className={field} /></label>}
      <label className="text-sm">Source type<select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={field}>{meta.kinds.map((k) => <option key={k}>{k}</option>)}</select></label>
      <label className="text-sm">Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={field} /></label>
      <label className="text-sm">Check every (minutes)<input type="number" min={5} max={1440} value={form.pollMinutes} onChange={(e) => setForm({ ...form, pollMinutes: Number(e.target.value) })} className={field} /></label>
      <div className="flex items-end"><button type="submit" className="button-primary">Add source</button></div>
    </form>}
    {!sources.length && <p className="text-sm text-ink/60">No sources yet.</p>}
    <ul className="divide-y divide-line border-y border-line">
      {sources.map((s) => <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium">{s.name} <span className="text-xs uppercase text-ink/50">{s.provider} · {s.kind}{s.enabled ? "" : " · paused"}</span></p>
          <p className="break-all text-xs text-ink/60">{s.provider === "newsapi" ? "NewsAPI" : s.url}</p>
          <p className="mt-1 text-xs text-ink/60">{s._count.items} items · every {s.pollMinutes} min · last {fmt(s.lastFetchedAt)} · <span className={s.lastStatus === "OK" ? "" : "text-red-700"}>{s.lastStatus ?? "never run"}</span></p>
          {s.lastError && <p className="mt-1 text-xs text-red-700">{s.lastError}</p>}
        </div>
        {canWrite && <div className="flex gap-2 text-sm">
          <button type="button" disabled={busy === s.id} onClick={() => run(s.id, "ingest")} className="button-secondary disabled:opacity-50">{busy === s.id ? "…" : "Fetch now"}</button>
          <button type="button" disabled={busy === s.id} onClick={() => run(s.id, "toggle", s)} className="button-secondary">{s.enabled ? "Pause" : "Resume"}</button>
          <button type="button" disabled={busy === s.id} onClick={() => run(s.id, "delete")} className="button-secondary text-red-700">Delete</button>
        </div>}
      </li>)}
    </ul>
  </section>;
}
