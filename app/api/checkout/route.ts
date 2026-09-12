import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const paidPlans = {
  "e-news": { priceEnv: "STRIPE_PRICE_E_NEWS", label: "E-News" },
  "offline-access": { priceEnv: "STRIPE_PRICE_OFFLINE_ACCESS", label: "Offline Access" }
} as const;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in before choosing a plan." }, { status: 401 });

  const { plan } = await request.json();
  if (plan === "daily-news") {
    await prisma.subscription.upsert({
      where: { userId },
      update: { plan: "DAILY_NEWS", status: "ACTIVE" },
      create: { userId, plan: "DAILY_NEWS", status: "ACTIVE" }
    });
    return NextResponse.json({ url: "/plans?activated=daily" });
  }

  const selected = paidPlans[plan as keyof typeof paidPlans];
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = selected && process.env[selected.priceEnv];
  if (!selected || !secret || !price) {
    return NextResponse.json({ error: "This plan is not configured for checkout yet." }, { status: 503 });
  }

  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/plans?success=1`,
    cancel_url: `${origin}/plans?cancelled=1`,
    customer_creation: "always",
    "metadata[userId]": userId,
    "metadata[plan]": plan,
    "subscription_data[metadata][userId]": userId,
    "subscription_data[metadata][plan]": plan
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const checkout = await response.json();
  if (!response.ok) return NextResponse.json({ error: checkout.error?.message || "Unable to start checkout." }, { status: 502 });
  return NextResponse.json({ url: checkout.url });
}
