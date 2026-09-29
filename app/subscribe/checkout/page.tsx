import Link from "next/link";

export default function CheckoutPlaceholder() {
  return <main className="mx-auto max-w-2xl px-4 py-16"><p className="section-kicker mb-3">Supporter plans</p><h1 className="font-serif text-4xl">Checkout is not enabled yet.</h1><p className="mt-4 text-ink/70">Paid plans are configured but this project does not connect a payment provider for them yet. The free newsletter is available now.</p><Link href="/subscribe" className="button-primary mt-8">Return to plans</Link></main>;
}
