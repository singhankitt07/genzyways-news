"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Current Affairs", "Tech News", "AI World", "Business", "Opinion", "Cricket", "India News", "Entertainment", "World News", "Lifestyle"];

type Initial = {
  id?: string;
  title?: string;
  titleHi?: string | null;
  summary?: string;
  summaryHi?: string | null;
  content?: string;
  contentHi?: string | null;
  category?: string;
  imageUrl?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  author?: string;
  breaking?: boolean;
  live?: boolean;
  subscriberOnly?: boolean;
  published?: boolean;
  publishedHi?: boolean;
  media?: { id?: string; type: "IMAGE" | "VIDEO"; url: string; caption?: string | null; paragraphIndex: number }[];
};

type MediaDraft = { type: "IMAGE" | "VIDEO"; url: string; caption: string; paragraphIndex: number };

export default function ArticleForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    title: initial?.title || "",
    titleHi: initial?.titleHi || "",
    summary: initial?.summary || "",
    summaryHi: initial?.summaryHi || "",
    content: initial?.content || "",
    contentHi: initial?.contentHi || "",
    category: initial?.category || CATEGORIES[0],
    imageUrl: initial?.imageUrl || "",
    sourceName: initial?.sourceName || "",
    sourceUrl: initial?.sourceUrl || "",
    author: initial?.author || "Staff Reporter",
    breaking: initial?.breaking || false,
    live: initial?.live || false,
    subscriberOnly: initial?.subscriberOnly || false,
    published: initial?.published || false
    ,publishedHi: initial?.publishedHi || false
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [media, setMedia] = useState<MediaDraft[]>(initial?.media?.map((item) => ({ type: item.type, url: item.url, caption: item.caption || "", paragraphIndex: item.paragraphIndex })) || []);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after: string = before) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.content.slice(start, end) || "text";
    const next = form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    setForm({ ...form, content: next });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed.");
      return;
    }
    setForm({ ...form, imageUrl: data.url });
    setUploadedFileName(file.name);
  }

  async function uploadArticleMedia(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    body.append("kind", media[index]?.type === "VIDEO" ? "video" : "image");
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Media upload failed.");
      return;
    }
    setMedia((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: data.url } : item));
  }

  async function handleSubmit(e: React.FormEvent, publishOverride?: boolean) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, media, published: publishOverride ?? form.published };
    const res = await fetch(isEdit ? `/api/articles/${initial!.id}` : "/api/articles", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (!res.ok) {
      setError("Something went wrong saving this article.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function enhanceWithAi() {
    if (!initial?.id) return;
    setEnhancing(true);
    setError("");
    const response = await fetch(`/api/admin/articles/${initial.id}/ai`, { method: "POST" });
    const data = await response.json();
    setEnhancing(false);
    if (!response.ok) {
      setError(data.error || "AI enhancement failed.");
      return;
    }
    setForm((current) => ({ ...current, title: data.title || current.title, titleHi: data.titleHi || current.titleHi, summary: data.summary || current.summary, summaryHi: data.summaryHi || current.summaryHi, content: data.content || current.content, contentHi: data.contentHi || current.contentHi, category: data.category || current.category, published: false, publishedHi: false }));
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="admin-editor-form space-y-5">
      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2"><label className="block text-sm">Headline</label>{isEdit && <button type="button" onClick={enhanceWithAi} disabled={enhancing} className="button-secondary text-xs disabled:opacity-60">{enhancing ? "Enhancing..." : "Enhance with AI"}</button>}</div>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-line bg-surface px-3 py-2 text-lg font-serif"
        />
      </div>
      <section className="border-t border-line pt-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><p className="section-kicker mb-1">Story media</p><h2 className="font-serif text-2xl">Photos and video</h2><p className="text-sm text-ink/60">Add media after a paragraph. Paragraph 1 means after the first paragraph.</p></div><button type="button" onClick={() => setMedia((current) => [...current, { type: "IMAGE", url: "", caption: "", paragraphIndex: 1 }])} className="button-secondary text-sm">+ Add media</button></div>
        <div className="space-y-3">
          {media.map((item, index) => <div key={`${item.url}-${index}`} className="border border-line bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-[140px_1fr_120px_auto]">
              <select value={item.type} onChange={(event) => setMedia((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, type: event.target.value as MediaDraft["type"] } : entry))} className="border border-line bg-paper px-3 py-2"><option value="IMAGE">Photo</option><option value="VIDEO">Video</option></select>
              <input value={item.url} onChange={(event) => setMedia((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, url: event.target.value } : entry))} placeholder="Paste media URL or upload a file" className="min-w-0 border border-line bg-paper px-3 py-2" />
              <label className="cursor-pointer border border-line px-3 py-2 text-center text-sm hover:bg-ink/5">Upload<input type="file" accept={item.type === "VIDEO" ? "video/mp4,video/webm,video/quicktime" : "image/*"} onChange={(event) => uploadArticleMedia(index, event)} disabled={uploading} className="hidden" /></label>
              <button type="button" onClick={() => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-sm text-press underline">Remove</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]"><input value={item.caption} onChange={(event) => setMedia((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, caption: event.target.value } : entry))} placeholder="Caption (optional)" className="border border-line bg-paper px-3 py-2" /><label className="text-sm">After paragraph<input type="number" min="1" value={item.paragraphIndex} onChange={(event) => setMedia((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, paragraphIndex: Math.max(1, Number(event.target.value) || 1) } : entry))} className="mt-1 w-full border border-line bg-paper px-3 py-2" /></label></div>
            {item.url && <p className="mt-2 truncate text-xs text-ink/55">{item.url}</p>}
          </div>)}
          {!media.length && <p className="border border-dashed border-line p-5 text-sm text-ink/60">No inline media added yet.</p>}
        </div>
      </section>
      {form.publishedHi && <div className="border-t border-line pt-5"><p className="section-kicker mb-3">Hindi newsroom version</p><label className="block text-sm mb-3">Hindi headline<input required value={form.titleHi} onChange={(e) => setForm({ ...form, titleHi: e.target.value })} placeholder="हिंदी हेडलाइन" className="mt-1 w-full border border-line bg-surface px-3 py-2 text-lg font-serif" /></label><label className="block text-sm mb-3">Hindi summary<textarea required rows={2} value={form.summaryHi} onChange={(e) => setForm({ ...form, summaryHi: e.target.value })} placeholder="हिंदी सारांश" className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label><label className="block text-sm">Hindi article body<textarea required rows={10} value={form.contentHi} onChange={(e) => setForm({ ...form, contentHi: e.target.value })} placeholder="हिंदी में पूरा लेख लिखें। पैराग्राफ के बीच खाली लाइन रखें।" className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label></div>}
      <div>
        <label className="block text-sm mb-1">Summary (shown on homepage / listings)</label>
        <textarea
          required
          rows={2}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="w-full border border-line bg-surface px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Article body (blank line = new paragraph)</label>
        <div className="flex flex-wrap gap-2 mb-1.5">
          <button type="button" onClick={() => wrapSelection("**")} className="border border-line px-2.5 py-1 text-sm font-bold hover:bg-ink/5">
            B
          </button>
          <button type="button" onClick={() => wrapSelection("*")} className="border border-line px-2.5 py-1 text-sm italic hover:bg-ink/5">
            I
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt("Link URL:");
              if (url) wrapSelection("[", `](${url})`);
            }}
            className="border border-line px-2.5 py-1 text-sm hover:bg-ink/5"
          >
            Link
          </button>
        </div>
        <textarea
          ref={contentRef}
          required
          rows={12}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full border border-line bg-surface px-3 py-2"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-line bg-surface px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Byline</label>
          <input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="w-full border border-line bg-surface px-3 py-2"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Source name<input value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} placeholder="Official source or publication" className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label><label className="block text-sm">Source URL<input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://source.example/article" className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label></div>
      <div>
        <label className="block text-sm mb-1">Cover image</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={form.imageUrl}
            onChange={(e) => {
              setForm({ ...form, imageUrl: e.target.value });
              setUploadedFileName("");
            }}
            placeholder="Paste an image URL, or upload a file"
            className="w-full min-w-0 flex-1 border border-line bg-surface px-3 py-2"
          />
          <label className="w-full sm:w-auto border border-line px-3 py-2 text-sm text-center cursor-pointer hover:bg-ink/5 whitespace-nowrap">
            {uploading ? "Uploading..." : "Upload file"}
            <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
        {uploadedFileName && <p className="mt-1 text-xs text-ink/60">Uploaded: {uploadedFileName}</p>}
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.imageUrl} alt="" className="mt-2 h-32 object-cover border border-line" />
        )}
      </div>
      <div className="flex flex-wrap gap-4 sm:gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.breaking}
            onChange={(e) => setForm({ ...form, breaking: e.target.checked })}
          />
          Mark as Breaking News
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.live} onChange={(e) => setForm({ ...form, live: e.target.checked })} />
          Mark as Live coverage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.subscriberOnly} onChange={(e) => setForm({ ...form, subscriberOnly: e.target.checked })} />
          Subscribers only
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.publishedHi} onChange={(event) => setForm({ ...form, publishedHi: event.target.checked })} />Publish to Hindi Newsroom</label>
      </div>
      {error && <p className="text-press text-sm">{error}</p>}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          disabled={saving}
          onClick={(e) => handleSubmit(e as any, false)}
          className="button-secondary w-full sm:w-auto"
        >
          Save as Draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={(e) => handleSubmit(e as any, true)}
          className="button-primary"
        >
          {saving ? "Saving..." : "Publish"}
        </button>
      </div>
    </form>
  );
}
