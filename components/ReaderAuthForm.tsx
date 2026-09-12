"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReaderAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "register") {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Unable to create your account.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1" htmlFor="reader-email">Email</label>
        <input id="reader-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-line px-3 py-2 bg-white" />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="reader-password">Password</label>
        <input id="reader-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-line px-3 py-2 bg-white" />
      </div>
      {error && <p className="text-press text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-ink text-white py-2.5 hover:bg-ink/90 disabled:opacity-50">
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
