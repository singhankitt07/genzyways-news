"use client";

import { useMemo, useState } from "react";
import ArticleRow from "./ArticleRow";

type Article = { id: string; title: string; category: string; published: boolean; breaking: boolean; createdAt: string };

export default function AdminArticleTable({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => articles.filter((article) => {
    const matchesQuery = `${article.title} ${article.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "published" ? article.published : !article.published);
    return matchesQuery && matchesFilter;
  }), [articles, filter, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <>
    <div className="mb-4 flex flex-wrap gap-3"><label className="flex-1"><span className="sr-only">Search articles</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5" placeholder="Search by title or category" /></label><select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} className="rounded-lg border border-line bg-surface px-3 py-2.5" aria-label="Filter articles"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></div>
    <div className="overflow-x-auto rounded-xl border border-line bg-surface"><table className="w-full min-w-[640px] text-left"><thead><tr className="border-b border-line text-xs uppercase text-ink/50"><th className="py-3 pl-4 font-medium">Title</th><th className="py-3 font-medium">Category</th><th className="py-3 font-medium">Status</th><th /></tr></thead><tbody>{visible.map((article) => <ArticleRow key={article.id} {...article} />)}</tbody></table></div>
    <div className="mt-4 flex items-center justify-between text-sm text-ink/60"><span>{filtered.length} article{filtered.length === 1 ? "" : "s"}</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-40">Previous</button><span>{page} / {pages}</span><button type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-40">Next</button></div></div>
  </>;
}