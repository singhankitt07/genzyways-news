"use client";

import Link from "next/link";
import { useState } from "react";
import type { Plan } from "@/lib/plans";

const benefits = [
  { title: "Daily newsletter", text: "A concise briefing delivered to your inbox.", icon: "✉" },
  { title: "Breaking news alerts", text: "Follow the stories marked breaking or live in the newsroom.", icon: "!" },
  { title: "Hindi and Hinglish", text: "Read the newsroom in the language that suits you.", icon: "अ" },
  { title: "Live coverage", text: "Keep up with stories that are actively being updated.", icon: "•" }
];
const faqs = [{ question: "What do I get?", answer: "The free plan gives you the daily newsletter and access to GenzyWays News language modes." }, { question: "Is it free?", answer: "Yes. Free Newsletter has no payment or commitment." }, { question: "How do I unsubscribe?", answer: "Use the unsubscribe link in a newsletter email, or contact us through the contact page." }, { question: "How is my email used?", answer: "It is used to send the newsletter you request. Read our privacy policy for more information." }, { question: "How do I contact support?", answer: "Send a message through our contact page and the newsroom will receive it." }];
type Props = { plans: Plan[] };

export default function SubscribeExperience({ plans }: Props) {
  const [selectedId, setSelectedId] = useState(plans[0].id);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const selected = plans.find((plan) => plan.id === selectedId) || plans[0];

  async function subscribe(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to subscribe right now.");
      setStatus("done"); setEmail(""); setWebsite("");
    } catch (submitError) {
      setStatus("error"); setError(submitError instanceof Error ? submitError.message : "Unable to subscribe right now.");
    }
  }

  return <div className="subscribe-page"><section className="subscribe-hero border-b border-line bg-surface-hover"><div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-12 sm:py-16"><span className="benefit-icon h-16 w-16 shrink-0"><span className="font-serif text-2xl">G</span></span><div><p className="section-kicker mb-2">GenzyWays News</p><h1 className="max-w-2xl font-serif text-3xl leading-tight sm:text-5xl">Stay ahead of the noise. Get the signal.</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">Choose a simple way to keep up with credible daily news in English, Hindi, or Hinglish.</p></div></div></section><main className="mx-auto max-w-7xl px-4 py-12 sm:py-16"><section aria-labelledby="plans-heading"><div className="mb-7"><p className="section-kicker mb-2">Membership</p><h2 id="plans-heading" className="font-serif text-3xl sm:text-4xl">Choose your plan</h2></div><div className="mb-7 flex flex-wrap gap-1 border-b border-line" role="tablist" aria-label="Subscription plans">{plans.map((plan) => <button key={plan.id} type="button" role="tab" aria-selected={selected.id === plan.id} onClick={() => setSelectedId(plan.id)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${selected.id === plan.id ? "border-press text-press" : "border-transparent text-ink/60 hover:text-ink"}`}>{plan.name}</button>)}</div><div className="grid gap-8 border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_280px]"><div><p className="section-kicker mb-3">Who is this for?</p><h3 className="font-serif text-2xl">{selected.audience}</h3><p className="mt-3 max-w-2xl text-ink/70">{selected.description}</p><h4 className="mt-8 text-sm font-bold uppercase tracking-[0.12em]">What is included</h4><ul className="mt-3 space-y-2 text-sm text-ink/75">{selected.included.map((item) => <li key={item} className="flex gap-2"><span className="text-press">&#10003;</span>{item}</li>)}</ul></div><div className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8"><p className="font-serif text-4xl">{selected.price}</p><p className="mt-1 text-sm text-ink/60">per {selected.interval}</p>{selected.paid ? <Link href={`/subscribe/checkout?plan=${selected.id}`} className="button-primary mt-6 w-full">Continue to checkout</Link> : <form onSubmit={subscribe} className="mt-6 space-y-3"><label className="block text-sm font-semibold" htmlFor="subscribe-email">Email address</label><input id="subscribe-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-line bg-surface px-3 py-2.5" placeholder="you@example.com" /><label className="sr-only" htmlFor="subscribe-website">Leave this field empty</label><input id="subscribe-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} className="absolute -left-[9999px] h-px w-px" aria-hidden="true" /><button type="submit" disabled={status === "loading"} className="button-primary w-full">{status === "loading" ? "Subscribing..." : "Join free"}</button>{status === "done" && <p className="text-sm text-press">You are subscribed. Check your inbox for the next briefing.</p>}{status === "error" && <p className="text-sm text-press">{error}</p>}</form>}<p className="mt-4 text-xs text-ink/55">{selected.cancelNote}</p></div></div></section><section className="mt-16 border-t border-line pt-10" aria-labelledby="benefits-heading"><h2 id="benefits-heading" className="font-serif text-3xl">Subscription benefits</h2><p className="mt-2 text-sm text-ink/70">Join readers who want credible daily news.</p><div className="mt-8 grid gap-8 sm:grid-cols-2">{benefits.map((benefit) => <div key={benefit.title} className="flex gap-4"><span className="benefit-icon shrink-0" aria-hidden="true">{benefit.icon}</span><div><h3 className="font-serif text-xl">{benefit.title}</h3><p className="mt-1 text-sm text-ink/70">{benefit.text}</p></div></div>)}</div></section><section className="mt-16 border-t border-line pt-10" aria-labelledby="faqs-heading"><h2 id="faqs-heading" className="font-serif text-3xl">Frequently asked questions</h2><div className="mt-6 max-w-3xl">{faqs.map((faq) => <details key={faq.question} className="border-b border-line py-4"><summary className="cursor-pointer font-semibold">{faq.question}</summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">{faq.answer} {faq.question === "How do I unsubscribe?" && <Link href="/contact" className="text-press underline">Contact support.</Link>}{faq.question === "How is my email used?" && <Link href="/privacy" className="text-press underline">Read our privacy policy.</Link>}</p></details>)}</div></section><section className="mt-16 flex flex-col items-start justify-between gap-5 border-t-2 border-press pt-8 sm:flex-row sm:items-center"><div><p className="section-kicker mb-2">Keep reading</p><h2 className="font-serif text-3xl">Make room for better news.</h2></div><Link href="/" className="button-primary">Back to the newsroom</Link></section></main></div>;
}
