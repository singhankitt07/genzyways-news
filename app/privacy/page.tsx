export default function PrivacyPage() {
  return (
    <div className="py-12 max-w-2xl mx-auto prose-content">
      <h1 className="font-serif text-4xl mb-6">Privacy Policy</h1>
      <p className="text-ink/50 text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="space-y-6 text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Information We Collect</h2>
          <p>
            GenzyWayNews collects minimal information: your language preference (stored
            locally in your browser), and any information you voluntarily submit through
            our Contact Us form (name, email, message).
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">How We Use It</h2>
          <p>
            We use contact form submissions solely to respond to your query. We do not
            sell or share personal information with third parties for marketing purposes.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Cookies &amp; Local Storage</h2>
          <p>
            We use your browser's local storage to remember your chosen display language.
            This stays on your device and is not transmitted to our servers. If we later
            add advertising (e.g. Google AdSense), that provider may set its own cookies —
            this policy will be updated at that time.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Third-Party Links</h2>
          <p>
            Articles may link to external sites. We are not responsible for the privacy
            practices of those sites.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Contact</h2>
          <p>
            Questions about this policy? Reach us via our <a href="/contact" className="underline hover:text-press">Contact Us</a> page.
          </p>
        </section>
      </div>

      <p className="text-xs text-ink/40 mt-10 border-t border-line pt-4">
        This is a starter privacy policy template, not legal advice. Have a lawyer review
        it before relying on it for a live, public site — especially once you add ads,
        analytics, or user accounts.
      </p>
    </div>
  );
}
