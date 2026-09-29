"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const categories = ["Current Affairs", "Tech News", "AI World", "Business", "Opinion", "Cricket", "India News", "Entertainment", "World News", "Lifestyle"];
type Item = { article: { title: string; slug: string; summary: string; imageUrl?: string | null }; progress?: number };

export default function ProfileEngagement() {
  const [data, setData] = useState<{ bookmarks: Item[]; history: Item[]; follows: string[] }>({ bookmarks: [], history: [], follows: [] });
  const [message, setMessage] = useState("");
  async function load() { const response = await fetch("/api/engagement/profile"); if (response.ok) setData(await response.json()); }
  useEffect(() => { load(); }, []);
  async function follow(category: string) { const response = await fetch("/api/engagement/follows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category }) }); if (response.ok) load(); else setMessage((await response.json()).error || "Unable to update follows."); }
  const cards = (title: string, items: Item[]) => <section className="border-t border-line pt-5"><h2 className="font-serif text-2xl">{title}</h2>{items.length ? <div className="mt-4 space-y-3">{items.map((item) => <Link key={item.article.slug} href={`/article/${item.article.slug}`} className="block border-b border-line pb-3 hover:text-press"><span className="font-semibold">{item.article.title}</span>{typeof item.progress === "number" && <span className="ml-2 text-xs text-ink/50">{item.progress}% read</span>}</Link>)}</div> : <p className="mt-3 text-sm text-ink/60">Nothing here yet.</p>}</section>;
  return <div className="mt-12 space-y-10">{cards("Saved for later", data.bookmarks)}{cards("Continue reading", data.history)}<section className="border-t border-line pt-5"><h2 className="font-serif text-2xl">Follow categories</h2><p className="mt-2 text-sm text-ink/60">Your For you feed will use these choices.</p><div className="mt-4 flex flex-wrap gap-2">{categories.map((category) => <button key={category} type="button" onClick={() => follow(category)} className={`rounded-full border px-3 py-2 text-xs ${data.follows.includes(category) ? "border-press bg-press text-on-accent" : "border-line hover:border-press"}`}>{category}</button>)}</div>{message && <p className="mt-3 text-sm text-press">{message}</p>}</section></div>;
}
