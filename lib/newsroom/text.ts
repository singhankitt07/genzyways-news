import { createHash } from "node:crypto";

const TRACKING_PARAMS = /^(utm_|fbclid|gclid|mc_|ref$|ref_|cmpid|ocid|taid)/i;

// Canonical form used for duplicate detection: lowercase host, no fragment, no tracking params, no trailing slash.
export function canonicalUrl(input: string): string {
  const url = new URL(input);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  for (const key of [...url.searchParams.keys()]) if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const query = url.searchParams.toString();
  return `${url.protocol}//${url.host}${path}${query ? `?${query}` : ""}`;
}

export function hashUrl(input: string): string {
  return createHash("sha256").update(canonicalUrl(input)).digest("hex");
}

export function stripHtml(value: string): string {
  return value
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set("a an the and or but of in on at to for from by with as is are was were be been it its this that these those after before over under says say said new amid into about".split(" "));

// Normalised token string used to compare headlines across publishers.
export function titleFingerprint(title: string): string {
  return stripHtml(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .join(" ");
}

// Keeps stored descriptions short: we index and link to stories, we do not mirror copyrighted articles.
export function snippet(value: string | undefined | null, max = 500): string | null {
  const text = stripHtml(value || "");
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function slugify(title: string): string {
  return title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
}
