export type PrivacyConsent = "accepted" | "rejected";

export const PRIVACY_CONSENT_KEY = "genzywaynews-privacy-choice-v2";
export const PRIVACY_CONSENT_EVENT = "privacy-consent";
export const OPEN_PRIVACY_SETTINGS_EVENT = "open-privacy-settings";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  }
}

export function setAdPersonalization(consent: PrivacyConsent | null) {
  if (typeof window === "undefined") return;
  const ads = window.adsbygoogle || [];
  ads.requestNonPersonalizedAds = consent === "accepted" ? 0 : 1;
  window.adsbygoogle = ads;
}