import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashNewsletterToken } from "@/lib/newsletter-tokens";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const tokenFromUrl = url.searchParams.get("token") || "";
  const body = await request.text();
  let tokenFromBody = "";
  try {
    tokenFromBody = JSON.parse(body).token || "";
  } catch {
    tokenFromBody = new URLSearchParams(body).get("token") || "";
  }
  const token = tokenFromUrl || tokenFromBody;
  if (!/^[a-f0-9]{64}$/i.test(token)) return NextResponse.json({ error: "Unsubscribe link is invalid." }, { status: 400 });
  const tokenHash = hashNewsletterToken(token);
  const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeTokenHash: tokenHash } });
  if (!subscriber) return NextResponse.json({ ok: true });
  await prisma.subscriber.update({ where: { id: subscriber.id }, data: { status: "UNSUBSCRIBED", unsubscribeTokenHash: null, confirmationTokenHash: null, confirmationExpiresAt: null } });
  return NextResponse.json({ ok: true });
}