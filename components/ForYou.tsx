import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentReader } from "@/lib/reader";

export default async function ForYou() {
  const user = await currentReader();
  if (!user) return null;
  const follows = await prisma.categoryFollow.findMany({ where: { userId: user.id }, select: { category: true } });
  if (!follows.length) return null;
  const articles = await prisma.article.findMany({ where: { published: true, category: { in: follows.map((follow) => follow.category) } }, orderBy: { createdAt: "desc" }, take: 4 });
  if (!articles.length) return null;
  return <section className="mb-12 border-y border-line py-6" aria-labelledby="for-you-heading"><div className="mb-4 flex items-end justify-between"><div><p className="section-kicker">Personalized</p><h2 id="for-you-heading" className="font-serif text-2xl">For you</h2></div><Link href="/account/profile" className="text-xs font-semibold text-press hover:underline">Edit follows</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{articles.map((article) => <Link key={article.id} href={`/article/${article.slug}`} className="border-l-2 border-press pl-3 hover:text-press"><p className="text-xs text-ink/55">{article.category}</p><h3 className="mt-1 font-serif text-lg">{article.title}</h3></Link>)}</div></section>;
}
