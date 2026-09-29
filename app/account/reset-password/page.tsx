import { Suspense } from "react";
import PasswordResetForm from "@/components/PasswordResetForm";

export default function ResetPasswordPage() {
  return <div className="mx-auto max-w-md py-12"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Account security</p><h1 className="mb-2 font-serif text-4xl">Create a new password</h1><p className="mb-8 text-sm text-ink/60">Choose a new password to regain access to your GenzyWayNews account.</p><Suspense fallback={<p className="text-ink/60">Loading reset link...</p>}><PasswordResetForm /></Suspense></div>;
}