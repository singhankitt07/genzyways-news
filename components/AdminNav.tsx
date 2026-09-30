"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminNav({ title = "Dashboard" }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const heading = pathname?.startsWith("/admin/ebooks") ? "Guides & eBooks" : title;
  return (
    <header className="admin-header flex items-center justify-between gap-4 border-b border-line">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open admin navigation" aria-expanded={open} className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink lg:hidden">☰</button>
      <div className="flex items-center gap-3"><Logo iconOnly /><div><p className="text-xs uppercase tracking-widest text-ink/50">Newsroom</p><h1 className="font-serif text-2xl">{heading}</h1></div></div>
      <div className="flex items-center gap-3">
        <label className="hidden md:block"><span className="sr-only">Search admin</span><input className="w-40 rounded-lg border border-line bg-surface px-3 py-2 text-sm" placeholder="Search articles" /></label>
        <ThemeToggle />
        <details className="relative hidden sm:block"><summary className="cursor-pointer list-none rounded-lg border border-line px-3 py-2 text-sm">Profile</summary><div className="absolute right-0 top-12 z-20 w-36 rounded-lg border border-line bg-surface p-2 shadow-lg"><Link href="/" className="block rounded px-2 py-2 text-sm hover:bg-ink/10">View site</Link><button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-ink/10">Sign out</button></div></details>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)}><aside className="mobile-safe-bottom h-full w-72 bg-paper p-5 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><Logo iconOnly /><button type="button" onClick={() => setOpen(false)} aria-label="Close admin navigation" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line">&times;</button></div><nav className="space-y-1"><Link onClick={() => setOpen(false)} className="block rounded-lg bg-ink/10 px-3 py-3 font-medium" href="/admin">Dashboard</Link><Link onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/articles/new">New Article</Link><Link onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/ebooks">Guides & eBooks</Link></nav></aside></div>}
    </header>
  );
}
