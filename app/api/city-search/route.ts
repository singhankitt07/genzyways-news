import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GeoResult = { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string };

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (query.length < 2) return NextResponse.json({ results: [] });

  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Search failed");
    const data = await response.json() as { results?: GeoResult[] };
    const results = (data.results || []).map((item) => ({ city: item.name, region: item.admin1, country: item.country, latitude: item.latitude, longitude: item.longitude, timezone: item.timezone }));
    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ results: [], error: "City search is unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
