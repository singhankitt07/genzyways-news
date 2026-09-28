"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("admin-credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid admin email or password.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="max-w-sm mx-auto py-20">
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
            className="w-full border border-line px-3 py-2 bg-white"
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
              className="w-full border border-line px-3 py-2 bg-white pr-10"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-white py-2.5 hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => setError("Password reset is not configured yet. Please contact the website owner.")}
          className="text-sm text-press underline"
        >
          Forgot Password
        </button>
      </form>
    </div>
  );
}
