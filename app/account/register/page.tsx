import Link from "next/link";
import ReaderAuthForm from "@/components/ReaderAuthForm";

export default function ReaderRegisterPage() {
  return (
    <div className="max-w-sm mx-auto py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Reader access</p>
      <h1 className="font-serif text-3xl mb-2">Create your reader account</h1>
      <p className="text-sm text-ink/60 mb-6">Create an account to unlock every published article.</p>
      <ReaderAuthForm mode="register" />
      <p className="text-sm text-ink/60 mt-6">Already registered? <Link href="/account/login" className="text-press underline">Sign in</Link></p>
    </div>
  );
}
