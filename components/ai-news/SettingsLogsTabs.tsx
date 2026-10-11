"use client";

import { useEffect, useState } from "react";
import { call, fmt } from "./api";

type Settings = { enabled: boolean; pollMinutes: number; minImportance: number; autoResearch: boolean; autoDraft: boolean; requireApproval: boolean; aiModel: string | null; maxRequestsPerDay: number; maxTokensPerDay: number; categories: string[] };
type ProviderStatus = { name: string; state: "active" | "resting"; blockedUntil: string | null; reason: string | null };
type Log = { id: string; level: string; action: string; message: string; createdAt: string };

const field = "mt-1 w-full border border-line bg-surface px-3 py-2";

export function SettingsTab({ canWrite, onMessage }: { canWrite: boolean; onMessage: (m: string) => void }) {
  const [s, setS] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  useEffect(() => { call<{ settings: Settings; providers: ProviderStatus[] }>("/api/admin/ai-news/settings").then((r) => (r.ok ? (setS(r.data.settings), setProviders(r.data.providers)) : onMessage(r.data.error || "Unable to load settings."))); }, [onMessage]);
  if (!s) return <p className="text-sm text-ink/60">Loading…</p>;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const result = await call("/api/admin/ai-news/settings", "PUT", s);
    onMessage(result.ok ? "Settings saved." : result.data.error || "Unable to save.");
  }
  const toggle = (key: "enabled" | "autoResearch" | "autoDraft" | "requireApproval", label: string, hint: string) => (
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" disabled={!canWrite} checked={s[key]} onChange={(e) => setS({ ...s, [key]: e.target.checked })} className="mt-1" /><span><span className="font-medium">{label}</span><br /><span className="text-ink/60">{hint}</span></span></label>
  );

  return <form onSubmit={save} className="max-w-2xl space-y-5">
    {toggle("enabled", "Automation on", "Master switch: when off, scheduled runs do nothing.")}
    {toggle("autoResearch", "Auto-research stories", "Researches important new stories on schedule (uses AI).")}
    {toggle("autoDraft", "Auto-create drafts", "Prepares drafts for review. Nothing is ever published automatically.")}
    {toggle("requireApproval", "Require approval", "High-risk stories always need human approval, whatever this is set to.")}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Minimum story score (1-5)<input type="number" min={1} max={5} disabled={!canWrite} value={s.minImportance} onChange={(e) => setS({ ...s, minImportance: Number(e.target.value) })} className={field} /></label>
      <label className="text-sm">AI model (blank = server default)<input maxLength={80} disabled={!canWrite} value={s.aiModel ?? ""} onChange={(e) => setS({ ...s, aiModel: e.target.value })} className={field} /></label>
      <label className="text-sm">Max AI requests per day<input type="number" min={0} disabled={!canWrite} value={s.maxRequestsPerDay} onChange={(e) => setS({ ...s, maxRequestsPerDay: Number(e.target.value) })} className={field} /></label>
    </div>
    <section className="space-y-2 border-t border-line pt-4">
      <h2 className="text-sm font-medium">Providers</h2>
      {!providers.length && <p className="text-sm text-ink/60">No AI providers are configured.</p>}
      <ul className="divide-y divide-line border-y border-line text-sm">
        {providers.map((provider) => <li key={provider.name} className="flex flex-wrap gap-x-3 py-2">
          <span className="font-medium">{provider.name}</span>
          <span className={provider.state === "resting" ? "text-ink/60" : "text-green-700"}>{provider.state === "resting" ? "Resting" : "Active"}</span>
          {provider.blockedUntil && <span className="text-ink/60">{provider.state === "resting" ? "Blocked until" : "Last cooldown ended"} {new Date(provider.blockedUntil).toLocaleString()}</span>}
          {provider.reason && <span className="w-full break-words text-xs text-ink/60">{provider.reason}</span>}
        </li>)}
      </ul>
    </section>
    {canWrite && <button type="submit" className="button-primary">Save settings</button>}
  </form>;
}

export function LogsTab({ onMessage }: { onMessage: (m: string) => void }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [level, setLevel] = useState("");
  useEffect(() => { call<{ logs: Log[] }>(`/api/admin/ai-news/logs${level ? `?level=${level}` : ""}`).then((r) => (r.ok ? setLogs(r.data.logs) : onMessage(r.data.error || "Unable to load log."))); }, [level, onMessage]);
  return <section className="space-y-3">
    <label className="block text-sm">Level <select value={level} onChange={(e) => setLevel(e.target.value)} className="ml-1 border border-line bg-surface px-2 py-1.5"><option value="">All</option><option>ERROR</option><option>WARN</option><option>INFO</option></select></label>
    {!logs.length && <p className="text-sm text-ink/60">No log entries.</p>}
    <ul className="divide-y divide-line border-y border-line text-sm">{logs.map((l) => <li key={l.id} className="flex flex-wrap gap-x-3 py-2"><span className="text-xs text-ink/50">{fmt(l.createdAt)}</span><span className={`text-xs font-medium ${l.level === "ERROR" ? "text-red-700" : l.level === "WARN" ? "text-ink" : "text-ink/50"}`}>{l.level}</span><span className="text-xs text-ink/50">{l.action}</span><span className="min-w-0 flex-1 break-words">{l.message}</span></li>)}</ul>
  </section>;
}
