import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy | GenzyWayNews",
  description: "How GenzyWayNews researches, writes, updates, labels, and corrects newsroom content."
};

export default function EditorialPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl py-12 prose-content">
      <p className="section-kicker mb-3">Newsroom standards</p>
      <h1 className="font-serif text-4xl sm:text-5xl">Editorial Policy</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">GenzyWayNews publishes reporting and clearly labeled opinion about current affairs, technology, artificial intelligence, business, culture, and sport.</p>
      <div className="mt-10 space-y-8 text-ink/80 leading-relaxed">
        <section><h2 className="font-serif text-2xl text-ink">Reporting and sources</h2><p className="mt-2">We research claims using reliable primary sources, public records, official statements, and reputable reporting. Stories should identify important sources and distinguish verified facts from analysis or uncertainty.</p></section>
        <section><h2 className="font-serif text-2xl text-ink">Authorship and updates</h2><p className="mt-2">Every published article carries a byline and publication date. Material updates are reflected in the article timestamp or an update note. Live and breaking labels are used only for stories that are actively developing or meet the newsroom’s publication criteria.</p></section>
        <section><h2 className="font-serif text-2xl text-ink">Opinion and commercial material</h2><p className="mt-2">Opinion is labeled separately from reporting. Sponsored, affiliate, or commercial material is labeled clearly and does not receive undisclosed editorial influence.</p></section>
        <section><h2 className="font-serif text-2xl text-ink">Corrections</h2><p className="mt-2">If we publish a material error, we correct the article and explain the correction when appropriate. Readers can report errors through our <a href="/contact" className="text-press underline">Contact Us</a> page.</p></section>
        <section><h2 className="font-serif text-2xl text-ink">Reader comments</h2><p className="mt-2">Comments require an account. Readers can report abusive or misleading comments for review, and authors can edit or remove their own comments.</p></section>
        <section><h2 className="font-serif text-2xl text-ink">Questions and feedback</h2><p className="mt-2">For a correction, tip, or editorial question, contact the newsroom. We review feedback carefully and update published work when the evidence supports a change.</p></section>
      </div>
    </article>
  );
}
