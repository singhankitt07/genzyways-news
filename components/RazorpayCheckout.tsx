"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
};

declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void }; } }

export default function RazorpayCheckout({ email }: { email?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    setLoading(true);
    setError("");
    try {
      if (!window.Razorpay) {
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      }
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Unable to create payment order.");
      const payment = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: "GenzyWays News full article access",
        order_id: order.orderId,
        prefill: { email: order.email || email || undefined },
        handler: async (result) => {
          const verification = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result) });
          const data = await verification.json();
          if (!verification.ok) throw new Error(data.error || "Payment verification failed.");
          router.push("/plans?subscribed=1");
          router.refresh();
        },
        modal: { ondismiss: () => setLoading(false) }
      });
      payment.open();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start payment.");
      setLoading(false);
    }
  }

  return <>
    <button type="button" onClick={subscribe} disabled={loading} className="button-primary w-full">{loading ? "Opening secure checkout..." : "Subscribe for ₹99"}</button>
    {error && <p className="text-press text-xs mt-3">{error}</p>}
  </>;
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}
