import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendNewsletterEmail } from "@/lib/resend";

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
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing?.status === "ACTIVE") return NextResponse.json({ ok: true });
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (existing) {
      await prisma.subscriber.update({ where: { email }, data: { status: "PENDING", confirmationTokenHash: tokenHash, confirmationExpiresAt: expiresAt } });
    } else {
      await prisma.subscriber.create({ data: { email, status: "PENDING", confirmationTokenHash: tokenHash, confirmationExpiresAt: expiresAt } });
    }
    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const confirmationUrl = `${base}/api/newsletter/confirm?token=${token}`;
    const sent = await sendNewsletterEmail({
      to: email,
      subject: "Confirm your GenzyWays News newsletter subscription",
      text: `Confirm your subscription by opening this link: ${confirmationUrl}\n\nThis link expires in 24 hours.`,
      html: `<p>Confirm your GenzyWays News newsletter subscription.</p><p><a href="${confirmationUrl}">Confirm subscription</a></p><p>This link expires in 24 hours.</p>`,
    });
    if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pendingConfirmation: true });
}
