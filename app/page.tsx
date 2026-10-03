import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import NewsletterSignup from "@/components/NewsletterSignup";
import AdSense from "@/components/AdSense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Trending from "@/components/Trending";
import ForYou from "@/components/ForYou";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";

function StoryMeta({ category, live }: { category: string; live?: boolean }) {
  return <div className="mb-2 flex items-center gap-2"><span className="section-kicker">{category}</span>{live && <span className="live-dot text-[10px] font-bold">LIVE</span>}</div>;
}

function StoryImage({ imageUrl, title }: { imageUrl?: string | null; title: string }) {
  return <div className="home-story-image-wrap"><div className="home-story-image">{imageUrl && <img src={imageUrl} alt={title} className="home-story-image" />}</div></div>;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim();
  const articles = await prisma.article.findMany({ where: { published: true, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }, { category: { contains: query, mode: "insensitive" } }] } : {}) }, orderBy: { createdAt: "desc" }, take: 13 });
  if (articles.length === 0) return <EmptyState variant="home" />;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const subscription = userId ? await prisma.subscription.findUnique({ where: { userId }, select: { status: true } }) : null;
  const isPremiumSubscriber = subscription?.status === "ACTIVE";

  const [lead, ...rest] = articles;
  const supporting = rest.slice(0, 4);
  const opinion = articles.filter((article) => article.category === "Opinion").slice(0, 3);
  const latest = articles.slice(0, 5);
  const remaining = rest.slice(4);

  return (
    <div className="home-page py-8 sm:py-10">
      <ForYou />
      <div className="mb-12 grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(240px,1fr)_minmax(240px,1.05fr)]">
        <Reveal as="article" className="min-w-0">
          <Link href={`/article/${lead.slug}`} className="group block"><StoryImage imageUrl={lead.imageUrl} title={lead.title} /><div className="mt-4"><StoryMeta category={lead.category} live={lead.live} /><h1 className="font-serif text-3xl leading-tight transition-colors group-hover:text-press sm:text-4xl lg:text-[2.75rem]">{lead.title}</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">{lead.summary}</p></div></Link>
        </Reveal>
        <section aria-labelledby="top-stories-heading"><h2 id="top-stories-heading" className="section-kicker mb-3">Top stories</h2><Stagger delay={0.1}>{supporting.map((article) => <StaggerItem as="article" key={article.id} className="home-news-item py-4 first:pt-0"><Link href={`/article/${article.slug}`} className="group block"><StoryMeta category={article.category} live={article.live} /><h3 className="font-serif text-xl leading-snug group-hover:text-press">{article.title}</h3><p className="home-time mt-2">By {article.author}</p></Link></StaggerItem>)}</Stagger></section>
        <aside className="border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-6"><section aria-labelledby="editorials-heading"><h2 id="editorials-heading" className="section-kicker mb-3">Editorials / Opinion</h2><Stagger>{(opinion.length ? opinion : supporting.slice(0, 2)).map((article) => <StaggerItem as="article" key={article.id} className="home-news-item py-4 first:pt-0"><Link href={`/article/${article.slug}`} className="group block"><h3 className="font-serif text-xl leading-snug group-hover:text-press">{article.title}</h3><p className="home-time mt-2">By {article.author}</p></Link></StaggerItem>)}</Stagger></section><section className="mt-8 border-t border-line pt-4" aria-labelledby="latest-heading"><h2 id="latest-heading" className="section-kicker mb-3">Latest news</h2><Stagger gap={0.08}>{latest.slice(0, 3).map((article) => <StaggerItem key={article.id}><Link href={`/article/${article.slug}`} className="mb-3 flex items-start justify-between gap-3 text-sm hover:text-press"><span>{article.title}</span><span className="home-time shrink-0">{article.live ? "LIVE" : "12 mins ago"}</span></Link></StaggerItem>)}</Stagger></section></aside>
      </div>
      <AdSense slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} isPremiumSubscriber={isPremiumSubscriber} />
      <div className="mb-14 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]"><section aria-labelledby="more-stories-heading"><div className="mb-5 flex items-end justify-between border-b-2 border-press pb-3"><h2 id="more-stories-heading" className="font-serif text-2xl">More stories</h2><Link href="/category/current-affairs" className="text-xs font-semibold text-press hover:underline">Browse all</Link></div><div className="grid gap-8 sm:grid-cols-2">{remaining.map((article) => <ArticleCard key={article.id} {...article} />)}</div></section><Trending items={articles.slice(0, 5).map(({ title, slug, category }) => ({ title, slug, category }))} /></div>
      <NewsletterSignup />
    </div>
  );
}
