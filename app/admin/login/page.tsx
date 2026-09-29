"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");
    const res = await signIn("admin-credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid admin email or password.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your registered email address first.");
      return;
    }
    setLoading(true);
    setError("");
    setResetMessage("");
    try {
      const response = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        setError(data.error || "Unable to reset your password.");
        return;
      }
      setResetMessage(data.message || "A new password has been sent to your email address.");
    } catch {
      setLoading(false);
      setError("Unable to send a password reset email right now.");
    }
  }

  return (
    <div className="-mx-4 flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-press/15 via-paper to-gold/20 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl sm:p-8">
      <div className="mb-8 text-center"><BrandMark /></div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-2">Admin access</p>
        <h1 className="font-serif text-3xl">Admin Login</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email / Username</label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 bg-surface"
            placeholder="admin@genzywaynews.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 bg-surface pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.12em] text-ink/50"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && <p className="text-press text-sm">{error}</p>}
        {resetMessage && <p className="text-green-700 text-sm">{resetMessage}</p>}

        <button
          type="submit"
          disabled={loading}
          className="button-primary w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-press underline"
          disabled={loading}
        >
          Forgot Password
        </button>
      </form>
      </div>
    </div>
  );
}
