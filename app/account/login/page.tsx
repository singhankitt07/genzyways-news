import Link from "next/link";
import ReaderAuthForm from "@/components/ReaderAuthForm";

export default function ReaderLoginPage() {
  return (
    <div className="grid lg:grid-cols-2 min-h-[620px] items-center gap-12 py-12 lg:py-20">
      <section className="bg-footer text-white px-8 py-12 lg:px-14 lg:py-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 border-l border-b border-gold/40" />
        <p className="text-xs uppercase tracking-[0.24em] text-gold font-semibold mb-8">GenzyWayNews / Readers</p>
        <h1 className="font-serif text-5xl sm:text-6xl leading-[0.95] mb-8">Your news,<br /><span className="text-gold">your signal.</span></h1>
        <div className="space-y-3 text-footer-muted max-w-sm"><p>Personalised News Feed</p><p>Insightful Newsletters</p><p>Subscriber-only reporting</p></div>
      </section>
      <section className="max-w-sm w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Reader access</p>
        <h2 className="font-serif text-3xl mb-2">Sign in to read the full story</h2>
        <p className="text-sm text-ink/60 mb-6">Your password is securely hashed before it is stored.</p>
        <ReaderAuthForm mode="login" />
        <p className="text-sm text-ink/60 mt-6">New here? <Link href="/account/register" className="text-press underline">Create a reader account</Link></p>
      </section>
    </div>
  );
}
