import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");
  if (!secret || !signature || !timestamp) return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  const rawBody = await request.text();
  const expected = crypto.createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });

  let payload: { type?: string; data?: { order?: { order_id?: string }; payment?: { cf_payment_id?: string; payment_status?: string } } };
  try { payload = JSON.parse(rawBody) as typeof payload; } catch { return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 }); }
  const orderId = payload.data?.order?.order_id;
  const payment = payload.data?.payment;
  if (!orderId) return NextResponse.json({ ok: true });
  const paymentStatus = payment?.payment_status;
  const paymentId = payment?.cf_payment_id ? String(payment.cf_payment_id) : undefined;
  if (paymentStatus === "SUCCESS" || payload.type === "PAYMENT_SUCCESS_WEBHOOK") await prisma.subscription.updateMany({ where: { cashfreeOrderId: orderId }, data: { status: "ACTIVE", cashfreePaymentId: paymentId } });
  else if (paymentStatus === "FAILED" || payload.type === "PAYMENT_FAILED_WEBHOOK") await prisma.subscription.updateMany({ where: { cashfreeOrderId: orderId, status: "PENDING" }, data: { status: "INACTIVE" } });
  return NextResponse.json({ ok: true });
}
