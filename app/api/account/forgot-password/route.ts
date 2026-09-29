import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.email === "string" ? body.email.trim() : "";

    if (!identifier) {
      return NextResponse.json({ error: "Enter your email address or username." }, { status: 400 });
    }

    const normalized = identifier.toLowerCase();
    const user = await prisma.user.findFirst({ where: { OR: [{ email: normalized }, { name: identifier }] } });
    const genericResponse = NextResponse.json({ ok: true, message: "If an account matches, a password reset link has been sent." });
    if (!user) return genericResponse;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    await sendPasswordResetEmail(user.email, `${baseUrl}/account/reset-password?token=${rawToken}`);

    return genericResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process your password reset request right now." }, { status: 500 });
  }
}
