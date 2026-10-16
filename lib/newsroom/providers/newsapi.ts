import { HttpError, safeFetchText } from "../http";
import type { NewsProvider, RawNewsItem } from "./types";

type NewsApiArticle = { source?: { id?: string | null; name?: string }; author?: string | null; title?: string; description?: string | null; url?: string; publishedAt?: string };

// NewsAPI.org adapter. The key is read from NEWS_API_KEY on the server and sent as a header, never stored or exposed.
// Source config (JSON): { "country": "in", "category": "technology", "query": "ai", "language": "en" }
export const newsApiProvider: NewsProvider = {
  id: "newsapi",
  label: "NewsAPI.org",
  async fetchItems(source, { limit }) {
    const key = process.env.NEWS_API_KEY?.trim();
    if (!key) throw new Error("NEWS_API_KEY is not configured.");
    const config = (source.config || {}) as Record<string, unknown>;
    const params = new URLSearchParams({ pageSize: String(Math.min(limit, 50)) });
    const base = config.query ? "everything" : "top-headlines";
    for (const field of ["country", "category", "language"] as const) {
      const value = config[field];
      if (typeof value === "string" && /^[a-z]{2,20}$/i.test(value) && !(base === "everything" && field !== "language")) params.set(field, value.toLowerCase());
    }
    if (typeof config.query === "string") params.set("q", config.query.slice(0, 200));
    if (base === "top-headlines" && !params.has("country") && !params.has("category")) params.set("country", "in");

    const body = JSON.parse(await safeFetchText(`https://newsapi.org/v2/${base}?${params}`, { headers: { "X-Api-Key": key } })) as { status?: string; message?: string; articles?: NewsApiArticle[] };
    if (body.status !== "ok") throw new HttpError(body.message || "NewsAPI returned an error.", 502);

    const items: RawNewsItem[] = [];
    for (const article of body.articles || []) {
      if (!article.title || !article.url || article.title === "[Removed]") continue;
      const date = article.publishedAt ? new Date(article.publishedAt) : undefined;
      items.push({ url: article.url, title: article.title, description: article.description || undefined, publishedAt: date && !Number.isNaN(date.getTime()) ? date : undefined, meta: { publisher: article.source?.name, author: article.author || undefined } });
    }
    return items;
  }
};
