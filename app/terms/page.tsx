export default function TermsPage() {
  return (
    <article className="prose-content mx-auto max-w-2xl py-12">
      <h1 className="mb-6 font-serif text-4xl">Terms of Use</h1>
      <p className="mb-8 text-sm text-ink/60">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
      <div className="space-y-6 text-ink/80 leading-relaxed">
        <section><h2 className="mb-2 font-serif text-xl text-ink">Using this website</h2><p>GenzyWayNews provides news, analysis, and related services for personal, non-commercial use. Please use the website lawfully and do not interfere with its operation or security.</p></section>
        <section><h2 className="mb-2 font-serif text-xl text-ink">Content and copyright</h2><p>Articles, branding, logos, images, and other content belong to GenzyWayNews or their respective rights holders. You may read and share links to our stories, but may not reproduce or commercially redistribute our content without permission.</p></section>
        <section><h2 className="mb-2 font-serif text-xl text-ink">Accounts and subscriptions</h2><p>You are responsible for keeping account credentials confidential and for activity under your account. Subscription access is personal and may not be transferred or shared.</p></section>
        <section><h2 className="mb-2 font-serif text-xl text-ink">External links</h2><p>Our stories and footer may link to third-party websites and social networks. We do not control or guarantee the content, availability, or policies of those services.</p></section>
        <section><h2 className="mb-2 font-serif text-xl text-ink">Contact</h2><p>Questions about these terms can be sent through our <a href="/contact" className="underline hover:text-press">Contact Us</a> page.</p></section>
      </div>
    </article>
  );
}