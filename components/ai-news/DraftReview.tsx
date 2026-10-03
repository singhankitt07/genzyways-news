"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { call, fmt, RISK_STYLE } from "./api";
import { Badge } from "./StoriesTab";

type Draft = { id: string; title: string; summary: string; content: string; titleHi: string | null; summaryHi: string | null; contentHi: string | null; category: string; slug: string; seoTitle: string; seoDescription: string; keywords: string[]; status: string; riskLevel: string; needsHuman: boolean; verdict: string | null; confidence: number; articleId: string | null; reviewNote: string | null; reviews: { id: string; action: string; actor: string; note: string | null; createdAt: string }[] };
type Report = { summary: string; sources: { id: string; position: number; sourceName: string; kind: string; title: string; url: string; credibility: number }[]; claims: { id: string; text: string; status: string; sourceRefs: number[] }[]; result: { verdict: string; confidence: number; conflicts: string[]; notes: string | null } | null };

const field = "mt-1 w-full border border-line bg-surface px-3 py-2";
const CLAIM_TONE: Record<string, string> = { SUPPORTED: "border-line text-ink/60", SINGLE_SOURCE: "border-gold text-ink", CONFLICTING: "border-red-600 text-red-700" };

export default function DraftReview({ id, canWrite }: { id: string; canWrite: boolean }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [form, setForm] = useState<Partial<Draft>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function load() {
    const result = await call<{ draft: Draft; report: Report | null }>(`/api/admin/ai-news/drafts/${id}`);
    if (!result.ok) { setMessage(result.data.error || "Unable to load draft."); return; }
    setDraft(result.data.draft); setReport(result.data.report); setForm(result.data.draft);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);
  if (!draft) return <div className="admin-page py-8">{message || "Loading…"}</div>;

  const locked = draft.status === "PUBLISHED" || !canWrite;
  const set = (key: keyof Draft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value });

  async function act(label: string, fn: () => Promise<{ ok: boolean; data: { error?: string } }>, success: string) {
    setBusy(true); setMessage("");
    const result = await fn();
    setBusy(false);
    if (!result.ok) { setMessage(result.data.error || `${label} failed.`); return; }
    setMessage(success); await load();
  }
  const save = () => act("Save", () => call(`/api/admin/ai-news/drafts/${id}`, "PATCH", {
    title: form.title, summary: form.summary, content: form.content, titleHi: form.titleHi ?? "", summaryHi: form.summaryHi ?? "", contentHi: form.contentHi ?? "", category: form.category, slug: form.slug, seoTitle: form.seoTitle, seoDescription: form.seoDescription, keywords: typeof form.keywords === "string" ? (form.keywords as string).split(",") : form.keywords
  }), "Saved. The draft is back in review.");
  const review = (decision: "APPROVED" | "REJECTED") => act("Review", () => call(`/api/admin/ai-news/drafts/${id}/review`, "POST", { decision, note }), decision === "APPROVED" ? "Approved." : "Rejected.");
  const publish = (live: boolean) => {
    if (live && !window.confirm("Publish this article on the live site now?")) return;
    return act("Publish", () => call(`/api/admin/ai-news/drafts/${id}/publish`, "POST", { live }), live ? "Published live." : "Saved as an unpublished article.");
  };
  const dirty = JSON.stringify([form.title, form.summary, form.content, form.titleHi ?? "", form.summaryHi ?? "", form.contentHi ?? "", form.category, form.slug, form.seoTitle, form.seoDescription, String(form.keywords)]) !== JSON.stringify([draft.title, draft.summary, draft.content, draft.titleHi ?? "", draft.summaryHi ?? "", draft.contentHi ?? "", draft.category, draft.slug, draft.seoTitle, draft.seoDescription, String(draft.keywords)]);

  return <div className="admin-page max-w-5xl space-y-6 py-8">
    <Link href="/admin/ai-news?tab=drafts" className="text-sm underline">← All drafts</Link>
    <header className="space-y-2">
      <h1 className="font-serif text-3xl leading-tight">Review draft</h1>
      <p className="flex flex-wrap items-center gap-2 text-xs"><Badge>{draft.status.replace("_", " ")}</Badge><Badge tone={RISK_STYLE[draft.riskLevel]}>{draft.riskLevel} risk</Badge>{draft.needsHuman && <Badge tone="border-gold text-ink">Needs human review</Badge>}<span className="text-ink/60">{draft.verdict ?? "—"} · {draft.confidence}% confidence</span></p>
      {draft.riskLevel === "HIGH" && <p className="border-l-2 border-red-600 pl-3 text-sm">High-risk topic. Check every claim against the sources before approving.</p>}
      {draft.articleId && <p className="text-sm"><Link href={`/admin/articles/${draft.articleId}`} className="underline">Open the resulting article →</Link></p>}
    </header>
    {message && <p role="status" className="border-l-2 border-gold pl-3 text-sm">{message}</p>}

    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <label className="block text-sm">Headline<input disabled={locked} value={form.title ?? ""} onChange={set("title")} className={field} /></label>
        <label className="block text-sm">Summary<textarea disabled={locked} rows={3} value={form.summary ?? ""} onChange={set("summary")} className={field} /></label>
        <label className="block text-sm">Article (markdown)<textarea disabled={locked} rows={16} value={form.content ?? ""} onChange={set("content")} className={`${field} font-mono text-sm`} /></label>
        <details className="border border-line p-3"><summary className="cursor-pointer text-sm font-medium">Hindi version</summary>
          <label className="mt-3 block text-sm">Headline (Hindi)<input disabled={locked} value={form.titleHi ?? ""} onChange={set("titleHi")} className={field} /></label>
          <label className="mt-3 block text-sm">Summary (Hindi)<textarea disabled={locked} rows={2} value={form.summaryHi ?? ""} onChange={set("summaryHi")} className={field} /></label>
          <label className="mt-3 block text-sm">Article (Hindi)<textarea disabled={locked} rows={10} value={form.contentHi ?? ""} onChange={set("contentHi")} className={field} /></label>
        </details>
        <details className="border border-line p-3"><summary className="cursor-pointer text-sm font-medium">SEO</summary>
          <label className="mt-3 block text-sm">Category<input disabled={locked} value={form.category ?? ""} onChange={set("category")} className={field} /></label>
          <label className="mt-3 block text-sm">URL slug<input disabled={locked} value={form.slug ?? ""} onChange={set("slug")} className={field} /></label>
          <label className="mt-3 block text-sm">SEO title ({(form.seoTitle ?? "").length}/60)<input disabled={locked} maxLength={70} value={form.seoTitle ?? ""} onChange={set("seoTitle")} className={field} /></label>
          <label className="mt-3 block text-sm">Meta description ({(form.seoDescription ?? "").length}/155)<textarea disabled={locked} rows={2} maxLength={170} value={form.seoDescription ?? ""} onChange={set("seoDescription")} className={field} /></label>
          <label className="mt-3 block text-sm">Keywords (comma separated)<input disabled={locked} value={Array.isArray(form.keywords) ? form.keywords.join(", ") : String(form.keywords ?? "")} onChange={(e) => setForm({ ...form, keywords: e.target.value as unknown as string[] })} className={field} /></label>
        </details>

        {!locked && <div className="space-y-3 border-t border-line pt-4">
          <label className="block text-sm">Reviewer note (optional)<input maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className={field} /></label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !dirty} onClick={save} className="button-secondary disabled:opacity-50">Save edits</button>
            <button type="button" disabled={busy || dirty || draft.status === "APPROVED"} onClick={() => review("APPROVED")} className="button-primary disabled:opacity-50">Approve</button>
            <button type="button" disabled={busy || draft.status === "REJECTED"} onClick={() => review("REJECTED")} className="button-secondary text-red-700 disabled:opacity-50">Reject</button>
          </div>
          {dirty && <p className="text-xs text-ink/60">Save your edits before approving, so the approved text is exactly what gets published.</p>}
          {draft.status === "APPROVED" && <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            <button type="button" disabled={busy} onClick={() => publish(false)} className="button-secondary">Save as unpublished article</button>
            <button type="button" disabled={busy} onClick={() => publish(true)} className="button-primary">Publish live</button>
          </div>}
        </div>}
      </div>

      <aside className="space-y-6 text-sm">
        <section><h2 className="mb-2 font-medium">Verification</h2>
          {report?.result ? <><p className="text-ink/70">{report.result.notes}</p>{report.result.conflicts.length > 0 && <ul className="mt-2 list-disc pl-5 text-red-700">{report.result.conflicts.map((c) => <li key={c}>{c}</li>)}</ul>}</> : <p className="text-ink/60">No research report.</p>}
        </section>
        <section><h2 className="mb-2 font-medium">Claims</h2>
          <ul className="space-y-2">{report?.claims.map((c) => <li key={c.id}><Badge tone={CLAIM_TONE[c.status]}>{c.status.replace("_", " ")}</Badge><p className="mt-1">{c.text}</p><p className="text-xs text-ink/50">Sources: {c.sourceRefs.join(", ") || "—"}</p></li>)}</ul>
        </section>
        <section><h2 className="mb-2 font-medium">Sources</h2>
          <ol className="space-y-2">{report?.sources.map((s) => <li key={s.id}><span className="text-xs text-ink/50">[{s.position}] {s.sourceName} · {s.kind}</span><br /><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-words underline">{s.title}</a></li>)}</ol>
        </section>
        <section><h2 className="mb-2 font-medium">History</h2>
          <ul className="space-y-1 text-xs text-ink/60">{draft.reviews.map((r) => <li key={r.id}>{fmt(r.createdAt)} — {r.action} by {r.actor}{r.note ? ` (${r.note})` : ""}</li>)}</ul>
        </section>
      </aside>
    </div>
  </div>;
}
