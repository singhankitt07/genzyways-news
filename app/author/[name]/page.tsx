import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const author = await prisma.author.findUnique({ where: { slug: name } });
  if (!author) return {};
  return { title: `${author.name} | GenzyWays News`, description: author.bio, alternates: { canonical: `/author/${author.slug}` }, openGraph: { title: `${author.name} | GenzyWays News`, description: author.bio, url: `/author/${author.slug}`, type: "profile", siteName: "GenzyWays News" } };
}

export default async function AuthorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const author = await prisma.author.findUnique({ where: { slug: name }, include: { articles: { where: { published: true }, orderBy: { createdAt: "desc" } } } });
  if (!author) notFound();
  const socialLinks = author.socialLinks ? (JSON.parse(author.socialLinks) as Record<string, string>) : {};
  return <div className="py-10"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: author.name, jobTitle: author.role, description: author.bio, image: author.photo || undefined, url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/author/${author.slug}` }) }} /><Link href="/search" className="text-sm text-press underline">Search the newsroom</Link><section className="mt-6 flex flex-col gap-5 border-b-2 border-press pb-7 sm:flex-row sm:items-center">{author.photo ? <img src={author.photo} alt="" className="h-24 w-24 rounded-full object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-hover font-serif text-3xl text-press">{author.name.charAt(0)}</div>}<div><p className="section-kicker mb-2">Author</p><h1 className="font-serif text-4xl sm:text-5xl">{author.name}</h1><p className="mt-2 text-sm font-semibold text-press">{author.role}</p><p className="mt-2 max-w-2xl text-ink/65">{author.bio}</p>{Object.entries(socialLinks).length > 0 && <div className="mt-3 flex gap-3 text-sm">{Object.entries(socialLinks).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="text-press underline">{label}</a>)}</div>}</div></section><p className="mt-6 text-sm text-ink/60">{author.articles.length} published article{author.articles.length === 1 ? "" : "s"}</p><div className="mt-5 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{author.articles.map((article) => <ArticleCard key={article.id} {...article} />)}</div></div>;
}
