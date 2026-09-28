import Link from "next/link";

type TrendingItem = { title: string; slug: string; category: string };

export default function Trending({ items }: { items: TrendingItem[] }) {
  return (
    <aside className="rounded-xl border border-line bg-surface p-5" aria-label="Trending stories">
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3"><h2 className="font-serif text-2xl">ट्रेंडिंग</h2><span className="text-xs font-semibold uppercase tracking-widest text-press">Now</span></div>
      <ol className="space-y-4">{items.map((item, index) => <li key={item.slug} className="flex gap-3"><span className="font-serif text-2xl text-press/70">{String(index + 1).padStart(2, "0")}</span><div><p className="text-[11px] uppercase tracking-wide text-ink/50">{item.category}</p><Link href={`/article/${item.slug}`} className="font-semibold leading-snug hover:text-press">{item.title}</Link></div></li>)}</ol>
    </aside>
  );
}