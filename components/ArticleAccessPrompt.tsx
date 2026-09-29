import Link from "next/link";

export default function ArticleAccessPrompt() {
  return (
    <aside className="my-8 border-y border-line py-6 no-print">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-2">Continue reading</p>
      <h2 className="font-serif text-2xl mb-2">Subscribe to keep reading</h2>
      <p className="text-sm text-ink/60 mb-4">You are seeing the first 20% of this article. Subscribe for ₹99 to unlock the complete story.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/plans" className="button-primary text-sm">Subscribe for ₹99</Link>
        <Link href="/account/login" className="button-secondary text-sm">Sign in</Link>
        <Link href="/account/register" className="button-secondary text-sm">Create account</Link>
      </div>
    </aside>
  );
}