"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CashfreeClient = { checkout: (options: { paymentSessionId: string; redirectTarget: "_modal" }) => Promise<{ error?: { message?: string }; paymentDetails?: { paymentMessage?: string } } | void> };
declare global { interface Window { Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeClient; } }

export default function CashfreeCheckout({ email }: { email?: string | null }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    const normalizedPhone = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(normalizedPhone)) { setError("Enter a valid 10-digit mobile number."); return; }
    setLoading(true); setError("");
    try {
      if (!window.Cashfree) await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: normalizedPhone }) });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Unable to create payment order.");
      const cashfree = window.Cashfree!({ mode: order.environment });
      const result = await cashfree.checkout({ paymentSessionId: order.paymentSessionId, redirectTarget: "_modal" });
      if (result?.error) throw new Error(result.error.message || "Cashfree checkout failed.");
      const verification = await fetch("/api/cashfree/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.orderId }) });
      const data = await verification.json();
      if (!verification.ok) throw new Error(data.error || "Payment verification is still pending. Please refresh after payment.");
      router.push("/plans?subscribed=1"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to start payment."); setLoading(false); }
  }

  return <div className="space-y-3"><label htmlFor="cashfree-phone" className="block text-sm font-semibold">Mobile number</label><input id="cashfree-phone" type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile number" className="w-full border border-line bg-surface px-3 py-2.5" required /><button type="button" onClick={subscribe} disabled={loading} className="button-primary w-full">{loading ? "Opening secure checkout..." : "Pay ₹99 with Cashfree"}</button>{error && <p className="text-press text-xs" role="alert">{error}</p>}</div>;
}

function loadScript(src: string) { return new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = src; script.onload = () => resolve(); script.onerror = () => reject(new Error("Unable to load Cashfree checkout.")); document.body.appendChild(script); }); }
