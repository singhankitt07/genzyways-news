import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PlanCheckout from "@/components/PlanCheckout";

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const subscription = userId ? await prisma.subscription.findUnique({ where: { userId } }) : null;

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto">
      <div className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">Membership</p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight">News that keeps up with you.</h1>
        <p className="text-ink/65 mt-4">Start free, add the briefing, or take the daily edition offline.</p>
      </div>
      {subscription?.status === "ACTIVE" && <p className="border-l-2 border-gold pl-4 text-sm mb-8">Your active plan: <strong>{subscription.plan.replaceAll("_", " ")}</strong></p>}
      {!session?.user && <p className="text-sm mb-8">Sign in first to activate a plan. <Link href="/account/login" className="text-press underline">Reader sign in</Link></p>}
      <div className="grid md:grid-cols-3 gap-4">
        <PlanCheckout plan="daily-news" label="Daily News" price="Free" description="Read the daily public edition and follow the newsroom." />
        <PlanCheckout plan="e-news" label="E-News" price="From your Stripe price" description="Get the curated email digest and subscriber-only reporting." />
        <PlanCheckout plan="offline-access" label="Offline Access" price="From your Stripe price" description="Unlock subscriber stories and future downloadable daily editions." />
      </div>
      <p className="text-xs text-ink/45 mt-8">Payments are securely handled by Stripe. E-News and Offline Access require Stripe price IDs in the deployment environment.</p>
    </div>
  );
}
