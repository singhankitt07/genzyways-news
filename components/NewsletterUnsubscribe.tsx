"use client";

import { useState } from "react";

export default function NewsletterUnsubscribe({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function unsubscribe() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Unable to unsubscribe right now.");
      else setDone(true);
    } catch {
      setError("Unable to unsubscribe right now.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="mx-auto max-w-xl px-4 py-20 text-center"><p className="section-kicker mb-3">Newsletter</p><h1 className="font-serif text-3xl">{done ? "You are unsubscribed" : "Unsubscribe"}</h1><p className="mt-3 text-ink/65">{done ? "You will no longer receive newsletter emails." : "Confirm that you want to stop receiving newsroom updates."}</p>{!done && <button type="button" disabled={!token || loading} onClick={unsubscribe} className="button-primary mt-8 disabled:opacity-50">{loading ? "Updating..." : "Unsubscribe"}</button>}{error && <p role="alert" className="mt-4 text-sm text-press">{error}</p>}</main>;
}