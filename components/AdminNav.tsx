"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";

export default function AdminNav({ title = "Dashboard", isAuthenticated = false }: { title?: string; isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const heading = pathname?.startsWith("/admin/ebooks") ? "Guides & eBooks" : pathname?.startsWith("/admin/staff") ? "Staff & roles" : pathname?.startsWith("/admin/newsletter") ? "Newsletter" : title;
  return (
    <header className="admin-header flex items-center justify-between gap-4 border-b border-line">
      <div className="flex items-center gap-3"><Logo iconOnly /><div><p className="text-xs uppercase tracking-widest text-ink/50">Newsroom</p><h1 className="font-serif text-2xl">{heading}</h1></div></div>
      <div className="flex items-center gap-3">
        <label className="hidden md:block"><span className="sr-only">Search admin</span><input className="w-40 rounded-lg border border-line bg-surface px-3 py-2 text-sm" placeholder="Search articles" /></label>
        {isAuthenticated && <details className="relative hidden sm:block"><summary className="cursor-pointer list-none rounded-lg border border-line px-3 py-2 text-sm">Profile</summary><div className="absolute right-0 top-12 z-20 w-36 rounded-lg border border-line bg-surface p-2 shadow-lg"><Link href="/" className="block rounded px-2 py-2 text-sm hover:bg-ink/10">View site</Link><button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-ink/10">Sign out</button></div></details>}
      </div>
    </header>
  );
}
