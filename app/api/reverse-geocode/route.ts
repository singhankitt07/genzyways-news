import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 500;
type Place = { city: string; region?: string; country?: string };
const cache = new Map<string, { expires: number; value: Place }>();

function parse(value: string | null, min: number, max: number) {
  const parsed = value === null || value.trim() === "" ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

async function lookup(lat: number, lon: number): Promise<Place | null> {
  const openWeatherKey = process.env.OPENWEATHER_API_KEY;
  if (openWeatherKey) {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${encodeURIComponent(openWeatherKey)}`, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const [match] = await response.json() as { name?: string; state?: string; country?: string }[];
      if (match?.name) return { city: match.name, region: match.state, country: match.country };
    }
  }

  const bigDataKey = process.env.BIGDATACLOUD_API_KEY;
  const base = bigDataKey ? "https://api.bigdatacloud.net/data/reverse-geocode" : "https://api.bigdatacloud.net/data/reverse-geocode-client";
  const response = await fetch(`${base}?latitude=${lat}&longitude=${lon}&localityLanguage=en${bigDataKey ? `&key=${encodeURIComponent(bigDataKey)}` : ""}`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return null;
  const data = await response.json() as { city?: string; locality?: string; principalSubdivision?: string; countryName?: string };
  const city = data.city || data.locality || data.principalSubdivision;
  return city ? { city, region: data.principalSubdivision, country: data.countryName } : null;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rawLat = parse(params.get("lat"), -90, 90);
  const rawLon = parse(params.get("lon"), -180, 180);
  if (rawLat === null || rawLon === null) return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });

  const lat = Number(rawLat.toFixed(2));
  const lon = Number(rawLon.toFixed(2));
  const key = `${lat},${lon}`;
  const now = Date.now();
  const hit = cache.get(key);
  const headers = { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" };
  if (hit && hit.expires > now) return NextResponse.json(hit.value, { headers });

  try {
    const value = await lookup(lat, lon);
    if (!value) return NextResponse.json({ error: "No place found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
    cache.set(key, { expires: now + TTL_MS, value });
    return NextResponse.json(value, { headers });
  } catch {
    return NextResponse.json({ error: "Reverse geocoding failed." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
