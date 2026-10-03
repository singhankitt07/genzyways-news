import { newsApiProvider } from "./newsapi";
import { rssProvider } from "./rss";
import type { NewsProvider } from "./types";

// Register new providers here; nothing else in the pipeline needs to change.
const providers: Record<string, NewsProvider> = { [rssProvider.id]: rssProvider, [newsApiProvider.id]: newsApiProvider };

export const providerIds = Object.keys(providers);
export const getProvider = (id: string): NewsProvider | undefined => providers[id];
export const listProviders = () => Object.values(providers).map(({ id, label }) => ({ id, label }));
export type { NewsProvider, RawNewsItem, ProviderSource } from "./types";
