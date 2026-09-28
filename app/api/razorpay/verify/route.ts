import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in before subscribing." }, { status: 401 });

  const body = await request.json();
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "Incomplete payment response." }, { status: 400 });

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return NextResponse.json({ error: "Razorpay is not configured yet." }, { status: 503 });

  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.razorpayOrderId !== orderId) return NextResponse.json({ error: "Payment order could not be matched." }, { status: 400 });

  await prisma.subscription.update({ where: { userId }, data: { plan: "FULL_ACCESS", status: "ACTIVE", razorpayPaymentId: paymentId } });
  return NextResponse.json({ ok: true });
}
