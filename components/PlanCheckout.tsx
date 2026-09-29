"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlanCheckout({ plan, label, price, description }: { plan: string; label: string; price: string; description: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function choosePlan() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Unable to start checkout.");
      setLoading(false);
      return;
    }
    if (result.url.startsWith("/")) router.push(result.url);
    else window.location.href = result.url;
  }

  return (
    <article className="border border-line bg-surface p-6 flex flex-col min-h-64">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">{label}</p>
      <p className="font-serif text-3xl mt-4">{price}</p>
      <p className="text-sm text-ink/65 mt-3 flex-1">{description}</p>
      <button type="button" onClick={choosePlan} disabled={loading} className="button-primary mt-6">{loading ? "Opening checkout..." : plan === "daily-news" ? "Activate free plan" : "Choose plan"}</button>
      {error && <p className="text-press text-xs mt-3">{error}</p>}
    </article>
  );
}
