import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import NewsletterSignup from "@/components/NewsletterSignup";

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

  return (
    <div className="py-8">
      <div className="mb-10 pb-10 border-b border-line">
        <ArticleCard {...lead} size="lead" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-14">
        {rest.map((a) => (
          <ArticleCard key={a.id} {...a} />
        ))}
      </div>
      <NewsletterSignup />
    </div>
  );
}
