import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RazorpayCheckout from "@/components/RazorpayCheckout";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/account/login?callbackUrl=/subscribe/checkout");

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="section-kicker mb-3">Secure checkout</p>
      <h1 className="font-serif text-4xl">Support the newsroom.</h1>
      <p className="mt-4 max-w-xl text-ink/70">Make a one-time ₹99 payment to unlock the full GenzyWays News archive and live coverage.</p>
      <section className="mt-8 max-w-md border border-line bg-surface p-6">
        <div className="flex items-center justify-between gap-4"><span className="font-semibold">Full Access</span><strong className="font-serif text-3xl">₹99</strong></div>
        <ul className="mt-5 space-y-2 text-sm text-ink/70"><li>Complete access to every article</li><li>Breaking and live coverage</li><li>One-time payment, no recurring commitment</li></ul>
        <div className="mt-6"><RazorpayCheckout email={session.user.email} /></div>
      </section>
      <p className="mt-6 text-xs text-ink/50">Payments are processed securely by Razorpay. Your access activates only after server-side verification.</p>
      <Link href="/subscribe" className="mt-6 inline-block text-sm text-press underline">Return to plans</Link>
    </main>
  );
}
