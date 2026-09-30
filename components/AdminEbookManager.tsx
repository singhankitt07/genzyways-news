"use client";

import { useEffect, useState } from "react";

type Ebook = {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  summary: string;
  summaryHi?: string | null;
  category: string;
  author: string;
  language: string;
  format: "PDF" | "EPUB";
  fileUrl: string;
  coverUrl?: string | null;
  sources?: string | null;
  published: boolean;
  updatedAt: string;
};

type EbookDraft = Omit<Ebook, "id" | "updatedAt">;

const blank: EbookDraft = {
  slug: "",
  title: "",
  titleHi: "",
  summary: "",
  summaryHi: "",
  category: "Current Affairs",
  author: "GenzyWays News Desk",
  language: "both",
  format: "PDF",
  fileUrl: "",
  coverUrl: "",
  sources: "",
  published: false
};

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

async function uploadFile(file: File, kind: "ebook" | "image") {
  const form = new FormData();
  form.set("file", file);
  form.set("kind", kind);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Upload failed.");
  return data.url as string;
}

export default function AdminEbookManager() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [draft, setDraft] = useState<EbookDraft>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/ebooks?admin=1");
    if (response.ok) setEbooks((await response.json()).ebooks || []);
  }

  useEffect(() => { void load(); }, []);

  function update<K extends keyof EbookDraft>(key: K, value: EbookDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function edit(ebook: Ebook) {
    setEditingId(ebook.id);
    setDraft({
      slug: ebook.slug,
      title: ebook.title,
      titleHi: ebook.titleHi || "",
      summary: ebook.summary,
      summaryHi: ebook.summaryHi || "",
      category: ebook.category,
      author: ebook.author,
      language: ebook.language,
      format: ebook.format,
      fileUrl: ebook.fileUrl,
      coverUrl: ebook.coverUrl || "",
      sources: ebook.sources || "",
      published: ebook.published
    });
    setFile(null);
    setCover(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(blank);
    setFile(null);
    setCover(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const fileUrl = file ? await uploadFile(file, "ebook") : draft.fileUrl;
      const coverUrl = cover ? await uploadFile(cover, "image") : draft.coverUrl;
      const payload = {
        ...draft,
        slug: draft.slug || slugify(draft.title),
        fileUrl,
        coverUrl: coverUrl || null
      };
      const response = await fetch(editingId ? `/api/ebooks/${editingId}` : "/api/ebooks", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save ebook.");
      setMessage(editingId ? "Guide updated." : "Guide saved as a draft.");
      resetForm();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save ebook.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(ebook: Ebook) {
    const response = await fetch(`/api/ebooks/${ebook.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !ebook.published })
    });
    if (response.ok) await load();
    else setMessage((await response.json()).error || "Unable to update publication status.");
  }

  async function remove(ebook: Ebook) {
    if (!window.confirm(`Delete “${ebook.title}”?`)) return;
    const response = await fetch(`/api/ebooks/${ebook.id}`, { method: "DELETE" });
    if (response.ok) {
      if (editingId === ebook.id) resetForm();
      setMessage("Guide deleted.");
      await load();
    } else setMessage((await response.json()).error || "Unable to delete guide.");
  }

  return (
    <div className="space-y-10">
      <form onSubmit={save} className="admin-editor-form space-y-5 border border-line bg-surface p-5" aria-label={editingId ? "Edit guide" : "Create guide"}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker mb-1">{editingId ? "Edit publication" : "New publication"}</p>
            <h2 className="font-serif text-2xl">{editingId ? "Edit guide" : "Add a guide or eBook"}</h2>
          </div>
          {editingId && <button type="button" className="button-secondary text-sm" onClick={resetForm}>Cancel edit</button>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Title (English)<input required value={draft.title} onChange={(event) => update("title", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
          <label className="text-sm">URL slug<input value={draft.slug} onChange={(event) => update("slug", event.target.value)} placeholder={slugify(draft.title) || "generated-from-title"} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
          <label className="text-sm">Title (Hindi, optional)<input value={draft.titleHi || ""} onChange={(event) => update("titleHi", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
          <label className="text-sm">Category<input required value={draft.category} onChange={(event) => update("category", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
          <label className="text-sm">Author / editor<input required value={draft.author} onChange={(event) => update("author", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
          <label className="text-sm">Language<select value={draft.language} onChange={(event) => update("language", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2"><option value="en">English</option><option value="hi">Hindi</option><option value="both">English and Hindi</option></select></label>
          <label className="text-sm">Format<select value={draft.format} onChange={(event) => update("format", event.target.value as EbookDraft["format"])} className="mt-1 w-full border border-line bg-surface px-3 py-2"><option value="PDF">PDF</option><option value="EPUB">EPUB</option></select></label>
          <label className="text-sm">Guide file (PDF/EPUB, max 50 MB)<input type="file" accept=".pdf,.epub,application/pdf,application/epub+zip" onChange={(event) => { const selected = event.target.files?.[0] || null; setFile(selected); if (selected?.name.toLowerCase().endsWith(".epub")) update("format", "EPUB"); if (selected?.name.toLowerCase().endsWith(".pdf")) update("format", "PDF"); }} className="mt-1 block w-full border border-line bg-surface px-3 py-2" required={!draft.fileUrl && !file} /></label>
          <label className="text-sm">Cover image (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setCover(event.target.files?.[0] || null)} className="mt-1 block w-full border border-line bg-surface px-3 py-2" /></label>
          <label className="text-sm sm:col-span-2">Hosted file URL (optional alternative to upload)<input type="url" value={draft.fileUrl} onChange={(event) => update("fileUrl", event.target.value)} placeholder="https://…/guide.pdf" className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        </div>
        {draft.fileUrl && <p className="text-xs text-muted">Current file: <a href={draft.fileUrl} target="_blank" rel="noreferrer" className="underline">Open file</a></p>}
        <label className="block text-sm">Summary (English)<textarea required rows={3} value={draft.summary} onChange={(event) => update("summary", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="block text-sm">Summary (Hindi, optional)<textarea rows={3} value={draft.summaryHi || ""} onChange={(event) => update("summaryHi", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="block text-sm">Sources and editorial notes (one per line)<textarea rows={3} value={draft.sources || ""} onChange={(event) => update("sources", event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={(event) => update("published", event.target.checked)} />Publish to the public library</label>
        <button type="submit" className="button-primary text-sm" disabled={busy}>{busy ? "Saving…" : editingId ? "Save guide" : "Create guide"}</button>
        {message && <p className="text-sm text-muted" role="status">{message}</p>}
      </form>

      <section aria-labelledby="ebook-manager-heading">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="section-kicker mb-1">Publishing</p><h2 id="ebook-manager-heading" className="font-serif text-2xl">Guides & eBooks</h2></div><span className="text-sm text-muted">{ebooks.length} item{ebooks.length === 1 ? "" : "s"}</span></div>
        {ebooks.length ? <ul className="space-y-3">{ebooks.map((ebook) => <li key={ebook.id} className="flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="section-kicker">{ebook.format} · {ebook.language.toUpperCase()} · {ebook.published ? "Published" : "Draft"}</p><h3 className="mt-1 truncate font-serif text-lg">{ebook.title}</h3><p className="mt-1 text-xs text-muted">/{ebook.slug} · Updated {new Date(ebook.updatedAt).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2"><button type="button" className="button-secondary text-sm" onClick={() => edit(ebook)}>Edit</button><button type="button" className="button-secondary text-sm" onClick={() => togglePublished(ebook)}>{ebook.published ? "Unpublish" : "Publish"}</button><button type="button" className="button-secondary text-sm" onClick={() => remove(ebook)}>Delete</button></div></li>)}</ul> : <p className="border border-line bg-surface p-4 text-sm text-muted">No guides yet. Add a reviewed PDF or EPUB above to start the library.</p>}
      </section>
    </div>
  );
}