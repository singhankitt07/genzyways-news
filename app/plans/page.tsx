import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RazorpayCheckout from "@/components/RazorpayCheckout";

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const subscription = userId ? await prisma.subscription.findUnique({ where: { userId } }) : null;
  const active = subscription?.status === "ACTIVE";

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto">
      <div className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">Membership</p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight">News that keeps up with you.</h1>
        <p className="text-ink/65 mt-4">New readers can preview 20% of every article. Subscribe once for ₹99 and unlock the full newsroom.</p>
      </div>
      {active && <p className="border-l-2 border-gold pl-4 text-sm mb-8">Your subscription is active. All articles are unlocked.</p>}
      {!session?.user && <p className="text-sm mb-8">Sign in before subscribing. <Link href="/account/login" className="text-press underline">Reader sign in</Link></p>}
      <article className="max-w-md border border-line bg-white p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Full Access</p>
        <p className="font-serif text-5xl mt-4">₹99 <span className="text-base font-sans text-ink/55">one-time</span></p>
        <ul className="text-sm text-ink/70 space-y-2 mt-6 mb-8"><li>Complete access to every article</li><li>Breaking and live coverage</li><li>No recurring subscription commitment</li></ul>
        {session?.user && !active ? <RazorpayCheckout email={session.user.email} /> : active ? <p className="text-sm text-gold font-semibold">Subscription active</p> : <Link href="/account/login" className="block text-center bg-ink text-white py-3">Sign in to subscribe</Link>}
      </article>
      <p className="text-xs text-ink/45 mt-8">Payments are processed securely by Razorpay. Your subscription activates only after server-side signature verification.</p>
    </div>
  );
}
