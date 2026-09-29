"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PasswordResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/account/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Unable to reset your password.");
      else setMessage(data.message || "Password updated. You can sign in now.");
    } catch {
      setError("Unable to reset your password right now.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <p className="text-press">This password reset link is missing or invalid.</p>;
  if (message) return <div className="space-y-4"><p className="text-green-700">{message}</p><Link href="/account/login" className="button-primary w-full">Go to sign in</Link></div>;

  return <form onSubmit={submit} className="space-y-4"><div><label htmlFor="new-password" className="mb-1 block text-sm">New password</label><input id="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5" /></div><div><label htmlFor="confirm-password" className="mb-1 block text-sm">Confirm password</label><input id="confirm-password" type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5" /></div>{error && <p className="text-sm text-press">{error}</p>}<button type="submit" disabled={loading} className="button-primary w-full">{loading ? "Updating password..." : "Set new password"}</button></form>;
}