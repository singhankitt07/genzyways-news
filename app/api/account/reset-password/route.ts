import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[a-f0-9]{64}$/i.test(token) || password.length < 8) {
      return NextResponse.json({ error: "Use a valid reset link and a password of at least 8 characters." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: passwordHash } }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    ]);
    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset your password right now." }, { status: 500 });
  }
}