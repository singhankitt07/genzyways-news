import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  return { title: `${name} | GenzyWayNews`, description: `Reporting and analysis by ${name} on GenzyWayNews.` };
}

export default async function AuthorPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const articles = await prisma.article.findMany({ where: { published: true, author: name }, orderBy: { createdAt: "desc" } });
  if (!articles.length) notFound();
  return <div className="py-10"><Link href="/search" className="text-sm text-press underline">Search the newsroom</Link><div className="mt-6 border-b-2 border-press pb-6"><p className="section-kicker mb-2">Author</p><h1 className="font-serif text-4xl sm:text-5xl">{name}</h1><p className="mt-3 max-w-2xl text-ink/65">Published reporting and analysis from the GenzyWayNews newsroom.</p></div><div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} {...article} />)}</div></div>;
}
