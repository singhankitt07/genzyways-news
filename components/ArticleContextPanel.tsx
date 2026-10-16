type ArticleContextPanelProps = {
  summary: string;
  sourceName?: string | null;
  sourceUrl?: string | null;
  publishedAt: Date;
  updatedAt: Date;
  live?: boolean;
};

function formatDate(value: Date) {
  return value.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  });
}

export default function ArticleContextPanel({ summary, sourceName, sourceUrl, publishedAt, updatedAt, live }: ArticleContextPanelProps) {
  const wasUpdated = updatedAt.getTime() - publishedAt.getTime() > 60_000;
  return (
    <aside className="mb-8 grid gap-4 border-y border-line bg-surface/60 px-4 py-4 text-sm sm:grid-cols-[1fr_auto] sm:px-5" aria-label="Article context">
      <div>
        <p className="section-kicker mb-2">At a glance</p>
        <p className="leading-relaxed text-ink/80">{summary}</p>
      </div>
      <dl className="grid gap-2 border-t border-line pt-3 text-xs text-ink/60 sm:min-w-56 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div><dt className="font-semibold uppercase tracking-[0.12em] text-ink/45">{live ? "Live coverage" : "Published"}</dt><dd className="mt-0.5">{formatDate(publishedAt)}</dd></div>
        {wasUpdated ? <div><dt className="font-semibold uppercase tracking-[0.12em] text-ink/45">Updated</dt><dd className="mt-0.5">{formatDate(updatedAt)}</dd></div> : null}
        {(sourceName || sourceUrl) ? <div><dt className="font-semibold uppercase tracking-[0.12em] text-ink/45">Source</dt><dd className="mt-0.5 break-words">{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-press underline underline-offset-2">{sourceName || "Original source"}</a> : sourceName}</dd></div> : null}
      </dl>
    </aside>
  );
}
