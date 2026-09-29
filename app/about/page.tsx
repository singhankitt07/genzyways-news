import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GenzyWays News",
  description: "Learn about GenzyWays News, our editorial focus, and how to contact the newsroom."
};

export default function AboutPage() {
  return (
    <article className="py-12 max-w-2xl mx-auto prose-content">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">The newsroom</p>
      <h1 className="font-serif text-4xl sm:text-5xl mb-6">About GenzyWays News</h1>
      <div className="space-y-6 text-ink/80 leading-relaxed">
        <p>
          GenzyWays News is an independent digital news publication focused on current affairs,
          technology, artificial intelligence, business, and opinion.
        </p>
        <p>
          We aim to make fast-moving stories easier to understand through clear reporting,
          useful context, and transparent bylines. Every published story identifies its author
          and publication date, and our newsroom welcomes corrections and reader feedback.
        </p>
        <section>
          <h2 className="font-serif text-2xl text-ink mb-2">Editorial standards</h2>
          <p>
            We separate reporting from opinion, check claims before publication, and update
            articles when material facts change. Sponsored or commercial material will be
            labeled clearly.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-ink mb-2">Contact the newsroom</h2>
          <p>
            For story tips, corrections, or partnership enquiries, visit our <a href="/contact" className="underline hover:text-press">Contact Us</a> page.
          </p>
        </section>
      </div>
    </article>
  );
}