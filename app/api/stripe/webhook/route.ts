import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const userId = checkout.metadata?.userId;
    const plan = checkout.metadata?.plan;
    if (userId && plan) {
      await prisma.subscription.upsert({
        where: { userId },
        update: { plan, status: "ACTIVE", stripeCustomerId: String(checkout.customer || ""), stripeSubscriptionId: String(checkout.subscription || "") },
        create: { userId, plan, status: "ACTIVE", stripeCustomerId: String(checkout.customer || ""), stripeSubscriptionId: String(checkout.subscription || "") }
      });
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription & { current_period_end?: number };
    const userId = subscription.metadata?.userId;
    if (userId) {
      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          status: subscription.status === "active" || subscription.status === "trialing" ? "ACTIVE" : "INACTIVE",
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
          stripeSubscriptionId: subscription.id
        }
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
    if (invoice.subscription) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: String(invoice.subscription) },
        data: { status: "PAST_DUE" }
      });
    }
  }

  return NextResponse.json({ received: true });
}
