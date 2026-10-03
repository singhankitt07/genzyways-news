"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoriesTab from "./StoriesTab";
import DraftsTab from "./DraftsTab";
import SourcesTab from "./SourcesTab";
import { LogsTab, SettingsTab } from "./SettingsLogsTabs";
import { call } from "./api";

const TABS = [["stories", "Stories"], ["drafts", "Drafts"], ["sources", "Sources"], ["settings", "Settings"], ["logs", "Activity log"]] as const;

export default function AiNewsDashboard({ canWrite }: { canWrite: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const tab = TABS.some(([id]) => id === params.get("tab")) ? params.get("tab")! : "stories";
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const notify = useCallback((value: string) => setMessage(value), []);

  async function runNow() {
    setRunning(true); setMessage("");
    const result = await call<{ ingestion?: { ran: number; created: number } }>("/api/admin/ai-news/run", "POST");
    setRunning(false);
    if (!result.ok) { setMessage(result.data.error || "Run failed."); return; }
    setMessage(`Checked ${result.data.ingestion?.ran ?? 0} source(s), ${result.data.ingestion?.created ?? 0} new item(s). Stories updated.`);
    setRefresh((n) => n + 1);
  }

  return <div className="admin-page max-w-5xl space-y-6 py-8">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="section-kicker mb-2">Newsroom</p>
        <h1 className="font-serif text-3xl">AI News</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">AI finds and drafts stories. Nothing is published without a person approving it.</p>
      </div>
      {canWrite && <button type="button" onClick={runNow} disabled={running} className="button-secondary disabled:opacity-50">{running ? "Working…" : "Fetch & group now"}</button>}
    </header>
    <nav className="flex flex-wrap gap-1 border-b border-line text-sm" aria-label="AI News sections">
      {TABS.map(([id, label]) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => router.replace(`/admin/ai-news?tab=${id}`)} className={`px-3 py-2 ${tab === id ? "border-b-2 border-ink font-medium" : "text-ink/60 hover:text-ink"}`}>{label}</button>)}
    </nav>
    {message && <p role="status" className="border-l-2 border-gold pl-3 text-sm">{message}</p>}
    {tab === "stories" && <StoriesTab key={refresh} canWrite={canWrite} onMessage={notify} />}
    {tab === "drafts" && <DraftsTab onMessage={notify} />}
    {tab === "sources" && <SourcesTab canWrite={canWrite} onMessage={notify} />}
    {tab === "settings" && <SettingsTab canWrite={canWrite} onMessage={notify} />}
    {tab === "logs" && <LogsTab onMessage={notify} />}
  </div>;
}
