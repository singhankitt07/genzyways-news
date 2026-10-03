import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BYTES = 2 * 1024 * 1024;
export const USER_AGENT = "GenzyWays-Newsroom/1.0 (+newsroom ingestion; respects provider terms)";

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    if (a.startsWith("::ffff:")) return isPrivateAddress(a.slice(7));
    return a === "::1" || a === "::" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe80");
  }
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

// Validates a user-supplied URL and blocks loopback/private targets (SSRF protection).
export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) URLs are allowed.");
  if (url.username || url.password) throw new Error("URLs with credentials are not allowed.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("Private hosts are not allowed.");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) throw new Error("Private hosts are not allowed.");
  return url;
}

export class HttpError extends Error {
  constructor(message: string, readonly status: number, readonly retryAfterSeconds?: number) {
    super(message);
  }
}

// Fetch with SSRF check, redirect re-validation, timeout and a response size cap.
export async function safeFetchText(raw: string, init: { headers?: Record<string, string>; timeoutMs?: number } = {}): Promise<string> {
  let url = await assertPublicUrl(raw);
  for (let hop = 0; hop < 4; hop += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(init.timeoutMs ?? 12000),
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/atom+xml, application/xml, application/json, text/xml;q=0.9, */*;q=0.5", ...init.headers }
    });
    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      url = await assertPublicUrl(new URL(response.headers.get("location")!, url).toString());
      continue;
    }
    if (response.status === 429) throw new HttpError("Rate limited by provider.", 429, Number(response.headers.get("retry-after")) || undefined);
    if (!response.ok) throw new HttpError(`Provider returned HTTP ${response.status}.`, response.status);
    const length = Number(response.headers.get("content-length"));
    if (length && length > MAX_BYTES) throw new HttpError("Response too large.", 413);
    const text = await response.text();
    if (text.length > MAX_BYTES) throw new HttpError("Response too large.", 413);
    return text;
  }
  throw new HttpError("Too many redirects.", 310);
}
