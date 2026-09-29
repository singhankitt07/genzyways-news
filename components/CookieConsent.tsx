"use client";

import { useEffect, useState } from "react";

const consentKey = "genzywaynews-analytics-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(consentKey) === null);
  }, []);

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(consentKey, value);
    document.cookie = `analytics_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("analytics-consent", { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl border border-line bg-paper p-4 shadow-lg no-print" aria-label="Cookie preferences">
      <p className="text-sm text-ink/80 leading-relaxed">We use optional analytics cookies to understand visits and improve GenzyWayNews. We do not collect precise location through this feature.</p>
      <div className="mt-3 flex gap-3">
        <button onClick={() => choose("accepted")} className="button-primary text-sm">Allow analytics</button>
        <button onClick={() => choose("rejected")} className="border border-line px-4 py-2 text-sm text-ink">Reject</button>
      </div>
    </aside>
  );
}
