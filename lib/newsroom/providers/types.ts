export type RawNewsItem = {
  externalId?: string;
  url: string;
  title: string;
  description?: string;
  publishedAt?: Date;
  category?: string;
  meta?: Record<string, string | string[] | undefined>;
};

export type ProviderSource = {
  id: string;
  name: string;
  url: string;
  category: string;
  config: Record<string, unknown> | null;
};

export interface NewsProvider {
  readonly id: string;
  readonly label: string;
  // Returns normalised items. Must throw (never return partial garbage) on transport or parse errors.
  fetchItems(source: ProviderSource, options: { limit: number }): Promise<RawNewsItem[]>;
}
