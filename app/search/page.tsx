import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";

const categories = ["Current Affairs", "Tech News", "AI World", "Business", "Opinion", "Cricket", "India News", "Entertainment", "World News", "Lifestyle"];

export const metadata: Metadata = { title: "Search News | GenzyWayNews", description: "Search current affairs, technology, AI, business, opinion, and culture on GenzyWayNews." };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; category?: string; from?: string; to?: string } }) {
  const query = searchParams.q?.trim() || "";
  const category = searchParams.category?.trim() || "";
  const from = searchParams.from ? new Date(`${searchParams.from}T00:00:00`) : undefined;
  const to = searchParams.to ? new Date(`${searchParams.to}T23:59:59.999`) : undefined;
  const articles = await prisma.article.findMany({ where: { published: true, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }, { author: { contains: query, mode: "insensitive" } }] } : {}), ...(category ? { category } : {}), ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) }, orderBy: { createdAt: "desc" }, take: 40 });
  return <div className="py-10"><p className="section-kicker mb-2">The newsroom archive</p><h1 className="font-serif text-4xl">Search news</h1><form className="mt-6 grid gap-3 border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5" action="/search"><input name="q" defaultValue={query} placeholder="Search headlines, topics, authors" className="border border-line bg-background px-3 py-2 lg:col-span-2" /><select name="category" defaultValue={category} className="border border-line bg-background px-3 py-2"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><input name="from" type="date" defaultValue={searchParams.from || ""} className="border border-line bg-background px-3 py-2" /><input name="to" type="date" defaultValue={searchParams.to || ""} className="border border-line bg-background px-3 py-2" /><button type="submit" className="button-primary sm:col-span-2 lg:col-span-1">Search</button></form><div className="mt-8 flex items-center justify-between border-b-2 border-press pb-3"><h2 className="font-serif text-2xl">{articles.length} result{articles.length === 1 ? "" : "s"}</h2>{query && <Link href="/search" className="text-sm text-press underline">Clear filters</Link>}</div>{articles.length ? <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} {...article} />)}</div> : <p className="mt-8 text-ink/60">No published stories match these filters.</p>}</div>;
}
