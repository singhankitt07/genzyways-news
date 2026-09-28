import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import NewsletterSignup from "@/components/NewsletterSignup";
import AdSense from "@/components/AdSense";
import Trending from "@/components/Trending";

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 13
  });

  if (articles.length === 0) {
    return <EmptyState variant="home" />;
  }

  const [lead, ...rest] = articles;
  const supporting = rest.slice(0, 4);
  const remaining = rest.slice(4);

  return (
    <div className="py-8">
      <div className="mb-10 grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ArticleCard {...lead} size="lead" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {supporting.map((article) => <ArticleCard key={article.id} {...article} />)}
        </div>
      </div>
      <AdSense slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] mb-14">
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
        {remaining.map((a) => (
          <ArticleCard key={a.id} {...a} />
        ))}
        </div>
        <Trending items={articles.slice(0, 5).map(({ title, slug, category }) => ({ title, slug, category }))} />
      </div>
      <NewsletterSignup />
    </div>
  );
}
