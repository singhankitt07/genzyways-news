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
            We use your browser's local storage to remember your chosen display language
            and analytics consent. This stays on your device and is not transmitted to our
            servers. When enabled after consent, Google AdSense may set cookies or use
            similar technologies to serve and measure advertising.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Reader accounts</h2>
          <p>
            Reader account passwords are stored as one-way bcrypt hashes. We use the account
            only to authenticate access to full articles. We do not collect precise location
            data for this feature; standard server and security logs may contain technical
            information handled by our hosting provider.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Profile and weather</h2>
          <p>
            Profile details are optional and used to personalize your account. If you allow
            browser location access, the weather widget requests current conditions from
            Open-Meteo. GenzyWayNews does not store your precise coordinates.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Analytics</h2>
          <p>
            With your consent and when enabled, we use Google Analytics to understand visits,
            page views, and general traffic patterns. Google may process technical information
            such as device and browser details. You can control cookies through your browser.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Advertising</h2>
          <p>
            Google AdSense and its partners may use cookies or similar technologies to serve
            and measure advertisements. Advertising scripts load only after the site's consent
            choice and are subject to Google's policies. You can change your browser cookie
            settings at any time.
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
