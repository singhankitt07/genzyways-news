import Link from "next/link";

export default async function NewsletterConfirmedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const confirmed = status === "success";
  return <main className="mx-auto max-w-xl px-4 py-20 text-center"><p className="section-kicker mb-3">Newsletter</p><h1 className="font-serif text-3xl">{confirmed ? "Subscription confirmed" : "Confirmation link expired"}</h1><p className="mt-3 text-ink/65">{confirmed ? "You are on the list. Watch your inbox for newsroom updates." : "Request a fresh confirmation link from the newsletter signup."}</p><Link href="/" className="button-primary mt-8 inline-flex">Back to the news</Link></main>;
}