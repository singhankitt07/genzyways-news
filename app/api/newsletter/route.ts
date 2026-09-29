import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const requests = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (requests.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    requests.set(key, recent);
    return true;
  }
  recent.push(now);
  requests.set(key, recent);
  return false;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const requestKey = forwardedFor || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(requestKey)) return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  if (body?.website) return NextResponse.json({ ok: true });
  const email = body?.email?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email }
    });
  } catch (e) {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
