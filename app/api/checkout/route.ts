import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in before choosing a plan." }, { status: 401 });

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: "Cashfree is not configured yet." }, { status: 503 });

  const body = await request.json().catch(() => ({})) as { phone?: unknown };
  const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  if (!/^\d{10}$/.test(phone)) return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });

  const environment = process.env.CASHFREE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const baseUrl = environment === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const orderId = `news_${userId.slice(-12)}_${Date.now()}`;

  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: { "x-client-id": clientId, "x-client-secret": clientSecret, "x-api-version": "2025-01-01", "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ order_id: orderId, order_amount: 99, order_currency: "INR", customer_details: { customer_id: userId, customer_email: session?.user?.email || undefined, customer_phone: phone }, order_meta: { return_url: `${siteUrl}/subscribe/checkout?cashfree_order_id={order_id}`, notify_url: `${siteUrl}/api/cashfree/webhook` }, order_note: "GenzyWays News Full Access", order_tags: { userId, plan: "FULL_ACCESS" } })
  });
  const checkout = await response.json();
  if (!response.ok) return NextResponse.json({ error: checkout.message || "Unable to start Cashfree checkout." }, { status: 502 });
  await prisma.subscription.upsert({ where: { userId }, update: { plan: "FULL_ACCESS", status: "PENDING", cashfreeOrderId: orderId }, create: { userId, plan: "FULL_ACCESS", status: "PENDING", cashfreeOrderId: orderId } });
  const email = session?.user?.email ?? undefined;
  return NextResponse.json({ orderId, paymentSessionId: checkout.payment_session_id, environment, name: "GenzyWays News", email });
}
