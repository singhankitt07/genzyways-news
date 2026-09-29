"use client";

import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReaderAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [appleAvailable, setAppleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    getProviders().then((providers) => { setGoogleAvailable(Boolean(providers?.google)); setAppleAvailable(Boolean(providers?.apple)); }).catch(() => { setGoogleAvailable(false); setAppleAvailable(false); });
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

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

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter the email address connected to your account.");
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
      setResetMessage(data.message || "If an account matches, a password reset link has been sent.");
    } catch {
      setLoading(false);
      setError("Unable to send password reset instructions right now.");
    }
  }

  async function continueWithGoogle() {
    if (!googleAvailable) {
      setError("Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel.");
      return;
    }
    await signIn("google", { callbackUrl: "/" });
  }

  async function continueWithApple() {
    if (!appleAvailable) {
      setError("Apple sign-in is not configured yet. Add APPLE_CLIENT_ID and APPLE_CLIENT_SECRET in Vercel.");
      return;
    }
    await signIn("apple", { callbackUrl: "/" });
  }

  function GoogleLogo() {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.04-4.4 3.04-7.47Z"/><path fill="#34A853" d="M12 22c2.76 0 5.07-.91 6.76-2.48l-3.3-2.56c-.91.61-2.07.98-3.46.98-2.66 0-4.91-1.8-5.72-4.22H2.87v2.64A10.2 10.2 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.28 13.72A6.1 6.1 0 0 1 5.96 12c0-.6.11-1.18.32-1.72V7.64H2.87A10.2 10.2 0 0 0 1.8 12c0 1.57.38 3.05 1.07 4.36l3.41-2.64Z"/><path fill="#EA4335" d="M12 6.06c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.06 3.01 14.76 2 12 2a10.2 10.2 0 0 0-9.13 5.64l3.41 2.64C7.09 7.86 9.34 6.06 12 6.06Z"/></svg>;
  }

  function AppleLogo() {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16.77 12.65c.02 2.33 2.04 3.1 2.06 3.11-.02.05-.32 1.1-1.06 2.18-.64.94-1.3 1.88-2.35 1.9-1.03.02-1.37-.61-2.57-.61-1.2 0-1.57.59-2.55.63-1.02.04-1.8-1.02-2.45-1.96-1.33-1.92-2.34-5.42-.98-7.79.67-1.18 1.83-1.93 3.1-1.95 1.01-.02 1.96.68 2.57.68.61 0 1.75-.84 2.95-.72.5.02 1.91.2 2.81 1.52-.07.04-1.68.98-1.66 3.01ZM14.85 6.9c.54-.65.9-1.55.8-2.45-.77.03-1.7.51-2.25 1.16-.49.56-.92 1.47-.8 2.33.86.07 1.72-.4 2.25-1.04Z"/></svg>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1" htmlFor="reader-email">Email</label>
        <input id="reader-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-line bg-surface px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="reader-password">Password</label>
        <input id="reader-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-line bg-surface px-3 py-2" />
      </div>
      {error && <p className="text-press text-sm">{error}</p>}
      {resetMessage && <p className="text-green-700 text-sm">{resetMessage}</p>}
      <button type="submit" disabled={loading} className="button-primary w-full">
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
      {mode === "login" && (
        <button type="button" onClick={handleForgotPassword} className="text-sm text-press underline" disabled={loading}>
          Forgot Password
        </button>
      )}
      {(googleAvailable || appleAvailable) && (
        <>
          <div className="flex items-center gap-3 text-xs text-ink/45"><span className="h-px bg-line flex-1" />or<span className="h-px bg-line flex-1" /></div>
          <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={continueWithGoogle} disabled={!googleAvailable} className="button-secondary inline-flex w-full items-center justify-center gap-2"><GoogleLogo /> Google</button><button type="button" onClick={continueWithApple} disabled={!appleAvailable} className="button-secondary inline-flex w-full items-center justify-center gap-2"><AppleLogo /> Apple</button></div>
        </>
      )}
    </form>
  );
}
