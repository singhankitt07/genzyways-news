import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in before subscribing." }, { status: 401 });

  const { orderId } = await request.json().catch(() => ({})) as { orderId?: unknown };
  if (typeof orderId !== "string" || !orderId) return NextResponse.json({ error: "Payment order could not be matched." }, { status: 400 });

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: "Cashfree is not configured yet." }, { status: 503 });
  const baseUrl = process.env.CASHFREE_ENVIRONMENT === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, { headers: { "x-client-id": clientId, "x-client-secret": clientSecret, "x-api-version": "2025-01-01", Accept: "application/json" }, cache: "no-store" });
  const order = await response.json();
  if (!response.ok) return NextResponse.json({ error: order.message || "Unable to verify payment." }, { status: 502 });

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.cashfreeOrderId !== orderId) return NextResponse.json({ error: "Payment order could not be matched." }, { status: 400 });
  if (order.order_status !== "PAID") return NextResponse.json({ error: "Payment is not completed yet." }, { status: 400 });

  const paymentsResponse = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, { headers: { "x-client-id": clientId, "x-client-secret": clientSecret, "x-api-version": "2025-01-01", Accept: "application/json" }, cache: "no-store" });
  const payments = await paymentsResponse.json();
  const successfulPayment = Array.isArray(payments) ? payments.find((payment) => payment.payment_status === "SUCCESS") : null;
  await prisma.subscription.update({ where: { userId }, data: { plan: "FULL_ACCESS", status: "ACTIVE", cashfreePaymentId: successfulPayment?.cf_payment_id ? String(successfulPayment.cf_payment_id) : undefined } });
  return NextResponse.json({ ok: true });
}
