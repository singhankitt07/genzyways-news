"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type AdSenseProps = {
  slot: string | undefined;
  format?: string;
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSense({ slot, format = "auto" }: AdSenseProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setConsent(window.localStorage.getItem("genzywaynews-analytics-consent") === "accepted");
    const onConsent = (event: Event) => setConsent((event as CustomEvent<string>).detail === "accepted");
    window.addEventListener("analytics-consent", onConsent);
    return () => window.removeEventListener("analytics-consent", onConsent);
  }, []);

  if (!client || !slot || !consent) return null;

  return (
    <div className="my-8 min-h-[90px] overflow-hidden text-center no-print" aria-label="Advertisement">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-ink/30">Advertisement</p>
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} crossOrigin="anonymous" strategy="afterInteractive" />
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <Script id={`adsense-${slot}`} strategy="afterInteractive">
        {`(window.adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
