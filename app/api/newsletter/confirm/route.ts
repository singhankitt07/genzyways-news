import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const validToken = /^[a-f0-9]{64}$/i.test(token);
  const tokenHash = validToken ? createHash("sha256").update(token).digest("hex") : "";
  const subscriber = validToken ? await prisma.subscriber.findUnique({ where: { confirmationTokenHash: tokenHash } }) : null;
  const valid = subscriber?.confirmationExpiresAt && subscriber.confirmationExpiresAt > new Date();
  if (subscriber && valid) {
    await prisma.subscriber.update({ where: { id: subscriber.id }, data: { status: "ACTIVE", confirmationTokenHash: null, confirmationExpiresAt: null } });
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || new URL(request.url).origin;
  return NextResponse.redirect(new URL(`/newsletter/confirmed?status=${subscriber && valid ? "success" : "invalid"}`, base));
}