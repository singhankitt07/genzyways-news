import { prisma } from "@/lib/prisma";
import ArticleCard from "./ArticleCard";

export default async function RelatedArticles({ category, excludeId }: { category: string; excludeId: string }) {
  const related = await prisma.article.findMany({
    where: { published: true, category, id: { not: excludeId } },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  if (related.length === 0) return null;

  return (
    <div className="border-t border-line pt-8 mt-12">
      <p className="text-xs uppercase tracking-wide text-ink/50 font-semibold mb-5">More in {category}</p>
      <div className="grid sm:grid-cols-3 gap-x-6 gap-y-8">
        {related.map((a) => (
          <ArticleCard key={a.id} {...a} />
        ))}
      </div>
    </div>
  );
}
