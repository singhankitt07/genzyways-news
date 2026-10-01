import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function coordinate(value: string | null, min: number, max: number) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function decodeHeader(value: string | null) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(request: Request) {
  const headers = request.headers;
  const latitude = coordinate(headers.get("x-vercel-ip-latitude"), -90, 90);
  const longitude = coordinate(headers.get("x-vercel-ip-longitude"), -180, 180);
  if (latitude === null || longitude === null) {
    return NextResponse.json({ error: "Approximate location is unavailable." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  const countryCode = headers.get("x-vercel-ip-country") || undefined;
  const country = countryCode ? new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode : undefined;
  return NextResponse.json({
    latitude,
    longitude,
    city: decodeHeader(headers.get("x-vercel-ip-city")),
    region: headers.get("x-vercel-ip-country-region") || undefined,
    country,
    timezone: headers.get("x-vercel-ip-timezone") || undefined,
  }, { headers: { "Cache-Control": "private, no-store" } });
}