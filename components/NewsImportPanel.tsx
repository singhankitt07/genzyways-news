"use client";

import { useState } from "react";

const CATEGORIES = ["Current Affairs", "Tech News", "AI World", "Business", "Opinion", "Cricket", "India News", "Entertainment", "World News", "Lifestyle"];

export default function NewsImportPanel() {
  const [feedUrl, setFeedUrl] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function importFeed(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/news-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedUrl, category, maxItems: 10 })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Import failed.");
      return;
    }
    setMessage(`${data.imported} draft${data.imported === 1 ? "" : "s"} imported from ${data.feedTitle}; ${data.skipped} skipped.`);
    setFeedUrl("");
  }

  return (
    <section className="mb-8 rounded-xl border border-line bg-surface p-5">
      <div className="mb-4"><p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">News automation</p><h2 className="font-serif text-2xl">Import feed stories</h2><p className="mt-1 text-sm text-ink/60">Stories are saved as drafts for editorial review. Nothing is published automatically.</p></div>
      <form onSubmit={importFeed} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input required type="url" value={feedUrl} onChange={(event) => setFeedUrl(event.target.value)} placeholder="https://example.com/feed.xml" className="min-w-0 rounded-lg border border-line bg-paper px-3 py-2.5" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-line bg-paper px-3 py-2.5">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
        <button disabled={loading} className="button-primary whitespace-nowrap disabled:opacity-60">{loading ? "Importing..." : "Import drafts"}</button>
      </form>
      {message && <p className="mt-3 text-sm text-press">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}