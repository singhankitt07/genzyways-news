"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { PRIVACY_CONSENT_EVENT, PRIVACY_CONSENT_KEY, type PrivacyConsent } from "@/lib/privacy-consent";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setConsent(window.localStorage.getItem(PRIVACY_CONSENT_KEY) === "accepted");
    const onConsent = (event: Event) => setConsent((event as CustomEvent<PrivacyConsent>).detail === "accepted");
    window.addEventListener(PRIVACY_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(PRIVACY_CONSENT_EVENT, onConsent);
  }, []);

  if (!measurementId || !consent) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}