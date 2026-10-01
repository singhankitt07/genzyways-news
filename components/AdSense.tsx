"use client";

import { useEffect, useRef } from "react";
import { PRIVACY_CONSENT_EVENT, PRIVACY_CONSENT_KEY, setAdPersonalization, type PrivacyConsent } from "@/lib/privacy-consent";

type AdSenseProps = {
  slot: string | undefined;
  format?: string;
  isPremiumSubscriber?: boolean;
};

export default function AdSense({ slot, format = "auto", isPremiumSubscriber = false }: AdSenseProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = useRef<HTMLModElement>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (!client || !slot || isPremiumSubscriber || !adSlot.current || requested.current) return;
    requested.current = true;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, [client, isPremiumSubscriber, slot]);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(PRIVACY_CONSENT_KEY);
    const consent: PrivacyConsent | null = storedConsent === "accepted" || storedConsent === "rejected" ? storedConsent : null;
    setAdPersonalization(consent);
    const onConsent = (event: Event) => setAdPersonalization((event as CustomEvent<PrivacyConsent>).detail);
    window.addEventListener(PRIVACY_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(PRIVACY_CONSENT_EVENT, onConsent);
  }, []);

  if (!client || !slot || isPremiumSubscriber) return null;

  return (
    <div className="my-8 min-h-[90px] overflow-hidden text-center no-print" aria-label="Advertisement">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-ink/30">Advertisement</p>
      <ins
        ref={adSlot}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
