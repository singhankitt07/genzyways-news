"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OPEN_PRIVACY_SETTINGS_EVENT, PRIVACY_CONSENT_EVENT, PRIVACY_CONSENT_KEY, setAdPersonalization, type PrivacyConsent } from "@/lib/privacy-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(PRIVACY_CONSENT_KEY) === null);
    const openSettings = () => setVisible(true);
    window.addEventListener(OPEN_PRIVACY_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_PRIVACY_SETTINGS_EVENT, openSettings);
  }, []);

  function choose(value: PrivacyConsent) {
    window.localStorage.setItem(PRIVACY_CONSENT_KEY, value);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `privacy_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    setAdPersonalization(value);
    window.dispatchEvent(new CustomEvent(PRIVACY_CONSENT_EVENT, { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-2xl border border-line bg-paper p-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-4 sm:p-5 no-print" aria-label="Cookie preferences">
      <p className="text-sm leading-relaxed text-ink/80">We use analytics and personalized ads only if you accept. Ads may still appear without personalization for non-subscribers; ad providers may use limited storage for frequency and reporting where permitted. Weather location is requested separately.</p>
      <p className="mt-2 text-xs text-ink/60">Read our <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => choose("accepted")} className="button-primary w-full text-sm sm:w-auto">Accept all</button>
        <button onClick={() => choose("rejected")} className="w-full border border-line px-4 py-2 text-sm text-ink sm:w-auto">Reject optional</button>
      </div>
    </aside>
  );
}
