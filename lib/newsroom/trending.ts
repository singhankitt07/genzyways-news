import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 3;

export type TrendingSignals = { views: Array<{ ageDays: number; views: number }>; reactions: number; bookmarks: number; comments: number };

// Views decay by half each day; deliberate actions (reaction, bookmark, comment) count for more than a passive view.
export function trendingScore(signals: TrendingSignals): number {
  const views = signals.views.reduce((sum, entry) => sum + entry.views * Math.pow(0.5, Math.max(entry.ageDays, 0)), 0);
  return views + signals.reactions * 3 + signals.bookmarks * 5 + signals.comments * 4;
}

export type TrendingArticle = { id: string; title: string; slug: string; category: string };

export function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Ranks published articles by recent engagement and fills any gap with the newest stories.
// It never throws: if tracking tables are unavailable the homepage falls back to "latest".
export async function getTrending(latest: TrendingArticle[], size = 5): Promise<TrendingArticle[]> {
  const fallback = latest.slice(0, size);
  try {
    const today = startOfUtcDay();
    const since = new Date(today.getTime() - (WINDOW_DAYS - 1) * DAY);
    const [views, reactions, bookmarks, comments] = await Promise.all([
      prisma.articleView.findMany({ where: { day: { gte: since }, article: { published: true } }, select: { articleId: true, day: true, views: true } }),
      prisma.articleReaction.groupBy({ by: ["articleId"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.bookmark.groupBy({ by: ["articleId"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.comment.groupBy({ by: ["articleId"], where: { createdAt: { gte: since }, deletedAt: null, moderationStatus: "VISIBLE" }, _count: { _all: true } })
    ]);

    const signals = new Map<string, TrendingSignals>();
    const entry = (id: string) => signals.get(id) ?? signals.set(id, { views: [], reactions: 0, bookmarks: 0, comments: 0 }).get(id)!;
    for (const row of views) entry(row.articleId).views.push({ ageDays: Math.round((today.getTime() - row.day.getTime()) / DAY), views: row.views });
    for (const row of reactions) entry(row.articleId).reactions = row._count._all;
    for (const row of bookmarks) entry(row.articleId).bookmarks = row._count._all;
    for (const row of comments) entry(row.articleId).comments = row._count._all;
    if (!signals.size) return fallback;

    const ranked = [...signals.entries()].map(([id, value]) => ({ id, score: trendingScore(value) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, size);
    if (!ranked.length) return fallback;

    const articles = await prisma.article.findMany({ where: { id: { in: ranked.map((item) => item.id) }, published: true }, select: { id: true, title: true, slug: true, category: true } });
    const byId = new Map(articles.map((article) => [article.id, article]));
    const result = ranked.map((item) => byId.get(item.id)).filter((article): article is TrendingArticle => !!article);
    for (const article of latest) {
      if (result.length >= size) break;
      if (!result.some((item) => item.id === article.id)) result.push(article);
    }
    return result.slice(0, size);
  } catch (error) {
    console.error("[trending] falling back to latest", error);
    return fallback;
  }
}
