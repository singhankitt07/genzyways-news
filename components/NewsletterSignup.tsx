"use client";
import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error || "Something went wrong.");
      return;
    }
    setStatus("done");
    setEmail("");
  }

  if (status === "done") {
    return (
      <div className="newsletter-box p-6 text-center sm:p-8 no-print">
        <p className="newsletter-heading font-serif text-xl">You're subscribed!</p>
        <p className="newsletter-description mt-1 text-sm">We'll send new stories straight to your inbox.</p>
      </div>
    );
  }

  return (
    <div className="newsletter-box p-6 sm:p-8 no-print">
      <p className="newsletter-heading font-serif text-xl mb-1">Never miss a story</p>
      <p className="newsletter-description text-sm mb-4">
        Get Current Affairs, Tech, and AI World updates in your inbox — no spam, unsubscribe any time.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="newsletter-input flex-1 border border-line px-3 py-2.5 focus:border-press"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="button-primary w-full whitespace-nowrap px-5 py-2.5 sm:w-auto"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-sm text-press">{errorMsg}</p>}
    </div>
  );
}
