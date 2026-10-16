import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });

  const rawBody = await request.text();
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let payload: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const payment = payload.payload?.payment?.entity;
  const orderId = payment?.order_id;
  if (!orderId) return NextResponse.json({ ok: true });

  if ((payload.event === "payment.captured" || payload.event === "order.paid") && payment.status !== "failed") {
    await prisma.subscription.updateMany({ where: { razorpayOrderId: orderId }, data: { status: "ACTIVE", razorpayPaymentId: payment.id || undefined } });
  } else if (payload.event === "payment.failed") {
    await prisma.subscription.updateMany({ where: { razorpayOrderId: orderId, status: "PENDING" }, data: { status: "INACTIVE" } });
  }

  return NextResponse.json({ ok: true });
}
