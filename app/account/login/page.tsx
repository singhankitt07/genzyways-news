import Link from "next/link";
import ReaderAuthForm from "@/components/ReaderAuthForm";

export default function ReaderLoginPage() {
  return (
    <div className="max-w-sm mx-auto py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Reader access</p>
      <h1 className="font-serif text-3xl mb-2">Sign in to read the full story</h1>
      <p className="text-sm text-ink/60 mb-6">Your password is securely hashed before it is stored.</p>
      <ReaderAuthForm mode="login" />
      <p className="text-sm text-ink/60 mt-6">New here? <Link href="/account/register" className="text-press underline">Create a reader account</Link></p>
    </div>
  );
}
