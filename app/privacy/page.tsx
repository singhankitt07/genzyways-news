export default function PrivacyPage() {
  return (
    <div className="py-12 max-w-2xl mx-auto prose-content">
      <h1 className="font-serif text-4xl mb-6">Privacy Policy</h1>
      <p className="text-ink/50 text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="space-y-6 text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl mb-2 text-ink">Information We Collect</h2>
          <p>
            If you create an account, we store your email, display name, password hash,
            and any profile details you choose to provide. We also store comments and
            reader activity needed for account features. Newsletter subscribers' email
            addresses are stored separately. Contact form submissions include the details
            you provide, such as your name, email, and message.
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
            Essential authentication cookies keep reader and staff accounts signed in.
            Local storage remembers display settings, weather results, and your privacy
            choice. Google Analytics and personalized ads are enabled only after you accept
            optional cookies. If you reject them, non-personalized ads may still appear for
            non-subscribers. Google says non-personalized ads can still use cookies or
            similar storage for frequency capping and aggregate reporting where permitted.
            Use the Privacy settings control in the footer to change your choice.
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
            Profile details are optional and used to personalize your account. The weather
            widget first asks your browser for location access. If allowed, those coordinates
            are sent from your browser to Open-Meteo for weather and air-quality data and to
            BigDataCloud for a place name. If browser location is denied or unavailable, the
            Vercel-hosted app can use Vercel's coarse IP-based coordinates as an approximate
            fallback. Those approximate coordinates are sent to Open-Meteo for weather and
            air-quality data. GenzyWays News does not store precise coordinates; it caches
            returned weather and place details in your browser. IP-based location may be less
            accurate, especially on mobile networks or VPNs. You can deny or revoke precise
            browser location in your browser settings.
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
            Active paid subscribers do not receive ad slots. Other visitors may receive
            non-personalized ads before choosing optional cookies; accepting enables ad
            personalization. Ad delivery transmits technical request data such as IP address,
            and Google or its partners may use cookies or similar storage for frequency and
            reporting purposes subject to applicable rules. See Google's policies and local
            requirements for details.
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
