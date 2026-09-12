import Link from "next/link";

export default function ArticleAccessPrompt({ subscriberOnly = false }: { subscriberOnly?: boolean }) {
  return (
    <aside className="my-8 border-y border-line py-6 no-print">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-2">Continue reading</p>
      <h2 className="font-serif text-2xl mb-2">{subscriberOnly ? "This story is for subscribers" : "Sign in to unlock the full article"}</h2>
      <p className="text-sm text-ink/60 mb-4">{subscriberOnly ? "Choose a plan to unlock subscriber-only reporting." : "Create a free reader account or sign in to continue."}</p>
      <div className="flex flex-wrap gap-3">
        {subscriberOnly && <Link href="/plans" className="bg-press px-4 py-2 text-sm text-white">View plans</Link>}
        <Link href="/account/login" className="bg-ink px-4 py-2 text-sm text-white">Sign in</Link>
        <Link href="/account/register" className="border border-line px-4 py-2 text-sm text-ink">Create account</Link>
      </div>
    </aside>
  );
}