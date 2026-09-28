import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in before choosing a plan." }, { status: 401 });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay is not configured yet." }, { status: 503 });

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 9900, currency: "INR", receipt: `news_${userId.slice(-12)}_${Date.now()}`, notes: { userId, plan: "FULL_ACCESS" } })
  });
  const checkout = await response.json();
  if (!response.ok) return NextResponse.json({ error: checkout.error?.description || "Unable to start Razorpay checkout." }, { status: 502 });
  await prisma.subscription.upsert({ where: { userId }, update: { plan: "FULL_ACCESS", status: "PENDING", razorpayOrderId: checkout.id }, create: { userId, plan: "FULL_ACCESS", status: "PENDING", razorpayOrderId: checkout.id } });
  const email = session?.user?.email ?? undefined;
  return NextResponse.json({ orderId: checkout.id, amount: checkout.amount, currency: checkout.currency, keyId, name: "GenzyWayNews", email });
}
