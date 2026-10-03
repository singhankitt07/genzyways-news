import Parser from "rss-parser";
import { safeFetchText } from "../http";
import type { NewsProvider, RawNewsItem } from "./types";

const parser = new Parser();

// Works for RSS, Atom, and official/government feeds. Only headline, link and a short description are kept.
export const rssProvider: NewsProvider = {
  id: "rss",
  label: "RSS / Atom feed",
  async fetchItems(source, { limit }) {
    const feed = await parser.parseString(await safeFetchText(source.url));
    const items: RawNewsItem[] = [];
    for (const item of feed.items.slice(0, limit)) {
      const url = (item.link || item.guid || "").trim();
      const title = (item.title || "").trim();
      if (!title || !/^https?:\/\//i.test(url)) continue;
      const published = item.isoDate || item.pubDate;
      const date = published ? new Date(published) : undefined;
      items.push({
        externalId: item.guid?.slice(0, 300),
        url,
        title,
        description: item.contentSnippet || item.summary || item.content,
        publishedAt: date && !Number.isNaN(date.getTime()) ? date : undefined,
        meta: { author: item.creator || (item as { author?: string }).author, tags: item.categories?.slice(0, 8), feed: feed.title }
      });
    }
    return items;
  }
};
